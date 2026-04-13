import { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput } from 'react-native';
import { router } from 'expo-router';
import { getCharacters, addHistoryEntry, generateId } from '../../hooks/storage';
import { Character, HistoryEntry } from '../../types';
import MinecraftBackground from '../../components/MinecraftBackground';
import MinecraftButton from '../../components/MinecraftButton';
import PixelText from '../../components/PixelText';

export default function RandomPickerScreen() {
  const [mode, setMode] = useState<'normal' | 'eliminazione' | null>(null);

  if (!mode) {
    return (
      <MinecraftBackground>
        <View style={styles.container}>
          <PixelText size="huge" color="#FFD700" style={styles.title}>RANDOM PICKER</PixelText>
          <View style={styles.buttonGroup}>
            <MinecraftButton
              title="NORMAL"
              color="#5C9C3E"
              onPress={() => setMode('normal')}
              style={styles.modeButton}
            />
            <PixelText size="small" color="#AAAAAA" style={styles.modeDesc}>Pick one random character</PixelText>
            <MinecraftButton
              title="ELIMINAZIONE"
              color="#E74C3C"
              onPress={() => setMode('eliminazione')}
              style={styles.modeButton}
            />
            <PixelText size="small" color="#AAAAAA" style={styles.modeDesc}>Eliminate until one remains</PixelText>
          </View>
        </View>
      </MinecraftBackground>
    );
  }

  if (mode === 'normal') {
    return <RandomPickerNormal />;
  }

  return <RandomPickerEliminazione />;
}

function RandomPickerNormal() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selected, setSelected] = useState<Character[]>([]);
  const [result, setResult] = useState<Character | null>(null);
  const [showPayout, setShowPayout] = useState(false);
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

  const pickRandom = () => {
    if (selected.length === 0) return;
    const random = selected[Math.floor(Math.random() * selected.length)];
    setResult(random);
  };

  const confirmGame = async () => {
    if (!result || !payout) return;
    const entry: HistoryEntry = {
      id: generateId(),
      characterId: result.id,
      characterName: result.name,
      gameType: 'random-picker',
      result: 'picked',
      timestamp: Date.now(),
      payout: parseFloat(payout) || 0,
    };
    await addHistoryEntry(entry);
    router.push('/');
  };

  const exitGame = () => {
    router.push('/');
  };

  if (showPayout && result) {
    return (
      <MinecraftBackground>
        <View style={styles.container}>
          <PixelText size="large" color="#E74C3C">THE LOSER IS:</PixelText>
          <PixelText size="huge" color="#E74C3C" style={styles.winnerName}>{result.name.toUpperCase()}</PixelText>
          <TextInput
            style={styles.payoutInput}
            placeholder="Enter Payout"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={payout}
            onChangeText={setPayout}
          />
          <View style={styles.btnRow}>
            <MinecraftButton title="CONFIRM" color="#5C9C3E" onPress={confirmGame} disabled={!payout} style={styles.halfBtn} />
            <MinecraftButton title="EXIT" color="#E74C3C" onPress={exitGame} style={styles.halfBtn} />
          </View>
        </View>
      </MinecraftBackground>
    );
  }

  if (result) {
    return (
      <MinecraftBackground>
        <View style={styles.container}>
          <PixelText size="large" color="#E74C3C">THE LOSER IS:</PixelText>
          <PixelText size="huge" color="#E74C3C" style={styles.winnerName}>{result.name.toUpperCase()}</PixelText>
          <View style={styles.btnRow}>
            <MinecraftButton title="CONFIRM GAME" color="#5C9C3E" onPress={() => setShowPayout(true)} style={styles.halfBtn} />
            <MinecraftButton title="EXIT" color="#E74C3C" onPress={exitGame} style={styles.halfBtn} />
          </View>
        </View>
      </MinecraftBackground>
    );
  }

  return (
    <MinecraftBackground>
      <View style={styles.container}>
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
          title="PICK RANDOM!"
          color="#3498DB"
          onPress={pickRandom}
          disabled={selected.length === 0}
          style={styles.spinButton}
        />
      </View>
    </MinecraftBackground>
  );
}

function RandomPickerEliminazione() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [available, setAvailable] = useState<Character[]>([]);
  const [selected, setSelected] = useState<Character[]>([]);
  const [isSelecting, setIsSelecting] = useState(true);
  const [currentEliminated, setCurrentEliminated] = useState<Character | null>(null);
  const [showPayout, setShowPayout] = useState(false);
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

  const eliminateRandom = () => {
    if (available.length <= 1) return;
    const random = available[Math.floor(Math.random() * available.length)];
    setCurrentEliminated(random);
    setTimeout(() => {
      setAvailable((prev) => prev.filter((c) => c.id !== random.id));
      setCurrentEliminated(null);
    }, 1500);
  };

  useEffect(() => {
    if (!isSelecting && available.length > 1 && !currentEliminated) {
      const timer = setTimeout(eliminateRandom, 500);
      return () => clearTimeout(timer);
    }
  }, [isSelecting, available.length, currentEliminated]);

  const getLoser = () => available[0];

  const confirmGame = async () => {
    const loser = getLoser();
    if (!loser || !payout) return;
    const entry: HistoryEntry = {
      id: generateId(),
      characterId: loser.id,
      characterName: loser.name,
      gameType: 'random-picker-eliminazione',
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

  if (showPayout && !isSelecting && available.length === 1) {
    const loser = getLoser();
    return (
      <MinecraftBackground>
        <View style={styles.container}>
          <PixelText size="large" color="#E74C3C">THE LOSER IS:</PixelText>
          <PixelText size="huge" color="#E74C3C" style={styles.winnerName}>{loser?.name.toUpperCase()}</PixelText>
          <TextInput
            style={styles.payoutInput}
            placeholder="Enter Payout"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={payout}
            onChangeText={setPayout}
          />
          <View style={styles.btnRow}>
            <MinecraftButton title="CONFIRM" color="#5C9C3E" onPress={confirmGame} disabled={!payout} style={styles.halfBtn} />
            <MinecraftButton title="EXIT" color="#E74C3C" onPress={exitGame} style={styles.halfBtn} />
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
          {available.length === 1 && !showPayout && (
            <MinecraftButton
              title="ENTER PAYOUT"
              color="#5C9C3E"
              onPress={() => setShowPayout(true)}
              style={styles.payoutBtn}
            />
          )}
        </View>
      </MinecraftBackground>
    );
  }

  return (
    <MinecraftBackground>
      <View style={styles.container}>
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
      </View>
    </MinecraftBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    marginBottom: 20,
    marginTop: 10,
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
  winnerName: {
    marginVertical: 20,
  },
  payoutInput: {
    backgroundColor: '#3C3C3C',
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    padding: 15,
    borderWidth: 3,
    borderColor: '#1a1a1a',
    marginVertical: 20,
    width: 200,
    fontFamily: 'monospace',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 15,
  },
  halfBtn: {
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
  payoutBtn: {
    marginTop: 30,
    width: 200,
  },
});