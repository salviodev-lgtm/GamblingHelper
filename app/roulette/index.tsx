import { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { getCharacters, addHistoryEntry, generateId } from '../../hooks/storage';
import { Character, HistoryEntry } from '../../types';
import Wheel from '../../components/Wheel';
import MinecraftButton from '../../components/MinecraftButton';
import MinecraftBackground from '../../components/MinecraftBackground';
import PixelText from '../../components/PixelText';
import AchievementPopup from '../../components/AchievementPopup';

export default function RouletteScreen() {
  const [mode, setMode] = useState<'normal' | 'eliminazione' | null>(null);

  if (!mode) {
    return (
      <MinecraftBackground>
        <View style={styles.container}>
          <PixelText size="huge" color="#FFD700" style={styles.title}>ROULETTE</PixelText>
          <PixelText size="medium" color="#AAAAAA" style={styles.subtitle}>Select Game Mode</PixelText>
          <View style={styles.buttonGroup}>
            <MinecraftButton
              title="NORMAL"
              color="#5C9C3E"
              onPress={() => setMode('normal')}
              style={styles.modeButton}
            />
            <PixelText size="small" color="#AAAAAA" style={styles.modeDesc}>Spin and pick one loser</PixelText>
            <MinecraftButton
              title="ELIMINAZIONE"
              color="#E74C3C"
              onPress={() => setMode('eliminazione')}
              style={styles.modeButton}
            />
            <PixelText size="small" color="#AAAAAA" style={styles.modeDesc}>Spin until one remains</PixelText>
          </View>
        </View>
      </MinecraftBackground>
    );
  }

  if (mode === 'normal') {
    return <RouletteNormal />;
  }

  return <RouletteEliminazione />;
}

function RouletteNormal() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selected, setSelected] = useState<Character[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<Character | null>(null);
  const [showPayout, setShowPayout] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [payout, setPayout] = useState('');

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    const chars = await getCharacters();
    setCharacters(chars.filter((c) => c.isActive));
  };

  const toggleCharacter = (char: Character) => {
    setSelected((prev) =>
      prev.find((c) => c.id === char.id)
        ? prev.filter((c) => c.id !== char.id)
        : [...prev, char]
    );
  };

  const spinWheel = () => {
    if (selected.length === 0) return;
    setIsSpinning(true);
    setShowAchievement(false);
  };

  const handleSpinEnd = (winner: string) => {
    const char = selected.find(c => c.name === winner);
    setResult(char || null);
    setIsSpinning(false);
    setShowAchievement(true);
  };

  const confirmGame = async () => {
    if (!result || !payout) return;
    const entry: HistoryEntry = {
      id: generateId(),
      characterId: result.id,
      characterName: result.name,
      gameType: 'roulette',
      result: 'spun',
      timestamp: Date.now(),
      payout: parseFloat(payout) || 0,
    };
    await addHistoryEntry(entry);
    router.push('/');
  };

  const exitGame = () => {
    router.push('/');
  };

  if (showAchievement && result) {
    return (
      <MinecraftBackground>
        <View style={styles.container}>
          <AchievementPopup
            winner={result.name}
            visible={showAchievement}
            onHide={() => setShowAchievement(false)}
          />
          <View style={styles.resultContainer}>
            <PixelText size="large" color="#E74C3C">THE LOSER IS:</PixelText>
            <PixelText size="huge" color="#E74C3C" style={styles.winnerName}>{result.name}</PixelText>
            <TextInput
              style={styles.payoutInput}
              placeholder="Enter Payout"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={payout}
              onChangeText={setPayout}
            />
            <View style={styles.buttonRow}>
              <MinecraftButton
                title="CONFIRM"
                color="#5C9C3E"
                onPress={confirmGame}
                disabled={!payout}
                style={styles.halfButton}
              />
              <MinecraftButton
                title="EXIT"
                color="#E74C3C"
                onPress={exitGame}
                style={styles.halfButton}
              />
            </View>
          </View>
        </View>
        <AchievementPopup
            winner={result.name}
            visible={showAchievement}
            onHide={() => setShowAchievement(false)}
          />
      </MinecraftBackground>
    );
  }

  if (isSpinning) {
    return (
      <MinecraftBackground>
        <View style={styles.container}>
          <PixelText size="large" color="#FFD700" style={styles.spinTitle}>SPINNING...</PixelText>
          <View style={styles.wheelWrapper}>
            <Wheel
              items={selected.map(c => c.name)}
              isSpinning={isSpinning}
              onSpinEnd={handleSpinEnd}
              size={300}
            />
          </View>
        </View>
      </MinecraftBackground>
    );
  }

  return (
    <MinecraftBackground>
      <ScrollView style={styles.container}>
        <PixelText size="large" color="#FFD700" style={styles.title}>SELECT PLAYERS</PixelText>
        <View style={styles.playerGrid}>
          {characters.map((char) => {
            const isSelected = selected.find((c) => c.id === char.id);
            return (
              <MinecraftButton
                key={char.id}
                title={char.name.toUpperCase()}
                color={isSelected ? '#5C9C3E' : '#5C5C5C'}
                onPress={() => toggleCharacter(char)}
                style={styles.playerButton}
                textStyle={styles.playerButtonText}
              />
            );
          })}
        </View>
        <MinecraftButton
          title="SPIN!"
          color="#FFD700"
          onPress={spinWheel}
          disabled={selected.length === 0}
          style={styles.spinButton}
        />
      </ScrollView>
    </MinecraftBackground>
  );
}

function RouletteEliminazione() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [available, setAvailable] = useState<Character[]>([]);
  const [selected, setSelected] = useState<Character[]>([]);
  const [isSelecting, setIsSelecting] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentEliminated, setCurrentEliminated] = useState<Character | null>(null);
  const [showPayout, setShowPayout] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [payout, setPayout] = useState('');

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    const chars = await getCharacters();
    setCharacters(chars.filter((c) => c.isActive));
  };

  const toggleCharacter = (char: Character) => {
    setSelected((prev) =>
      prev.find((c) => c.id === char.id)
        ? prev.filter((c) => c.id !== char.id)
        : [...prev, char]
    );
  };

  const startGame = () => {
    if (selected.length < 2) return;
    setAvailable([...selected]);
    setIsSelecting(false);
  };

  const spinAndEliminate = () => {
    if (available.length <= 1) return;
    setIsSpinning(true);
    setCurrentEliminated(null);
  };

  const handleEliminateSpinEnd = (winner: string) => {
    const char = available.find(c => c.name === winner);
    if (char) {
      setCurrentEliminated(char);
      setIsSpinning(false);
      setTimeout(() => {
        setAvailable((prev) => prev.filter((c) => c.id !== char.id));
        setCurrentEliminated(null);
      }, 1500);
    }
  };

  useEffect(() => {
    if (!isSelecting && available.length > 1 && !currentEliminated && !isSpinning) {
      const timer = setTimeout(spinAndEliminate, 500);
      return () => clearTimeout(timer);
    }
  }, [isSelecting, available.length, currentEliminated, isSpinning]);

  const confirmGame = async () => {
    const loser = available[0];
    if (!loser || !payout) return;
    const entry: HistoryEntry = {
      id: generateId(),
      characterId: loser.id,
      characterName: loser.name,
      gameType: 'roulette-eliminazione',
      result: 'last-remaining',
      timestamp: Date.now(),
      payout: parseFloat(payout) || 0,
    };
    await addHistoryEntry(entry);
    router.push('/');
  };

  const exitGame = () => {
    router.push('/');
  };

  if (!isSelecting && available.length === 1) {
    const loser = available[0];
    return (
      <MinecraftBackground>
        <View style={styles.container}>
          <AchievementPopup
            winner={loser.name}
            visible={true}
            onHide={() => {}}
          />
          <View style={styles.resultContainer}>
            <PixelText size="large" color="#E74C3C">THE LOSER IS:</PixelText>
            <PixelText size="huge" color="#E74C3C" style={styles.winnerName}>{loser.name}</PixelText>
            <TextInput
              style={styles.payoutInput}
              placeholder="Enter Payout"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={payout}
              onChangeText={setPayout}
            />
            <View style={styles.buttonRow}>
              <MinecraftButton
                title="CONFIRM"
                color="#5C9C3E"
                onPress={confirmGame}
                disabled={!payout}
                style={styles.halfButton}
              />
              <MinecraftButton
                title="EXIT"
                color="#E74C3C"
                onPress={exitGame}
                style={styles.halfButton}
              />
            </View>
          </View>
        </View>
      </MinecraftBackground>
    );
  }

  if (!isSelecting) {
    return (
      <MinecraftBackground>
        <View style={styles.container}>
          <PixelText size="large" color="#E74C3C" style={styles.title}>ELIMINATING...</PixelText>
          <PixelText size="medium" color="#FFD700" style={styles.remaining}>Remaining: {available.length}</PixelText>
          {isSpinning ? (
            <View style={styles.wheelWrapper}>
              <Wheel
                items={available.map(c => c.name)}
                isSpinning={isSpinning}
                onSpinEnd={handleEliminateSpinEnd}
                size={280}
              />
            </View>
          ) : (
            <View style={styles.playerGrid}>
              {available.map((char) => {
                const isEliminated = currentEliminated?.id === char.id;
                const isLast = available.length === 1;
                return (
                  <View
                    key={char.id}
                    style={[
                      styles.eliminationTile,
                      isEliminated && styles.eliminatedTile,
                      isLast && styles.lastTile,
                    ]}
                  >
                    <PixelText
                      size="medium"
                      color={isEliminated ? '#888' : '#FFF'}
                      style={isEliminated ? styles.strikethrough : undefined}
                    >
                      {char.name.toUpperCase()}
                    </PixelText>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </MinecraftBackground>
    );
  }

  return (
    <MinecraftBackground>
      <ScrollView style={styles.container}>
        <PixelText size="large" color="#E74C3C" style={styles.title}>SELECT PLAYERS (MIN 2)</PixelText>
        <View style={styles.playerGrid}>
          {characters.map((char) => {
            const isSelected = selected.find((c) => c.id === char.id);
            return (
              <MinecraftButton
                key={char.id}
                title={char.name.toUpperCase()}
                color={isSelected ? '#E74C3C' : '#5C5C5C'}
                onPress={() => toggleCharacter(char)}
                style={styles.playerButton}
                textStyle={styles.playerButtonText}
              />
            );
          })}
        </View>
        <MinecraftButton
          title="START ELIMINAZIONE"
          color="#E74C3C"
          onPress={startGame}
          disabled={selected.length < 2}
          style={styles.spinButton}
        />
      </ScrollView>
    </MinecraftBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonGroup: {
    alignItems: 'center',
    gap: 10,
  },
  modeButton: {
    width: 250,
    marginVertical: 5,
  },
  modeDesc: {
    textAlign: 'center',
    marginBottom: 10,
  },
  playerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 10,
  },
  playerButton: {
    minWidth: 120,
    marginBottom: 5,
  },
  playerButtonText: {
    fontSize: 12,
  },
  spinButton: {
    marginTop: 20,
    marginHorizontal: 40,
    paddingVertical: 15,
  },
  wheelWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  winnerName: {
    marginVertical: 20,
  },
  payoutInput: {
    width: 200,
    backgroundColor: '#3C3C3C',
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    padding: 15,
    borderWidth: 3,
    borderColor: '#1a1a1a',
    marginVertical: 20,
    fontFamily: 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  halfButton: {
    flex: 1,
  },
  remaining: {
    textAlign: 'center',
    marginBottom: 20,
  },
  eliminationTile: {
    backgroundColor: '#5C5C5C',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 3,
    borderColor: '#1a1a1a',
  },
  eliminatedTile: {
    backgroundColor: '#3C3C3C',
    opacity: 0.5,
  },
  lastTile: {
    backgroundColor: '#5C9C3E',
    borderColor: '#FFD700',
    borderWidth: 4,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  spinTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
});