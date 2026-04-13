import { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';
import { addHistoryEntry, generateId, getCharacters } from '../../hooks/storage';
import { HistoryEntry, Character } from '../../types';
import MinecraftBackground from '../../components/MinecraftBackground';
import MinecraftButton from '../../components/MinecraftButton';
import PixelText from '../../components/PixelText';

const DICE_TYPES = [3, 6, 10, 12, 20, 50];

export default function DiceRollScreen() {
  const [selectedDice, setSelectedDice] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number>(5);
  const [result, setResult] = useState<number | null>(null);
  const [isCounting, setIsCounting] = useState(false);
  const [showPayout, setShowPayout] = useState(false);
  const [payout, setPayout] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedLoser, setSelectedLoser] = useState<Character | null>(null);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    const chars = await getCharacters();
    setCharacters(chars.filter((c) => c.isActive));
  };

  const startRoll = () => {
    if (!selectedDice) return;
    setIsCounting(true);
    setCountdown(5);
    setResult(null);
    setShowPayout(false);
    setSelectedLoser(null);
  };

  useEffect(() => {
    if (!isCounting || countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isCounting, countdown]);

  useEffect(() => {
    if (isCounting && countdown === 0) {
      const random = Math.floor(Math.random() * selectedDice!) + 1;
      setResult(random);
      setIsCounting(false);
    }
  }, [isCounting, countdown]);

  const confirmGame = async () => {
    if (!selectedLoser || !payout) return;
    const entry: HistoryEntry = {
      id: generateId(),
      characterId: selectedLoser.id,
      characterName: selectedLoser.name,
      gameType: 'dice-roll',
      result: result?.toString() || '',
      timestamp: Date.now(),
      payout: parseFloat(payout) || 0,
    };
    await addHistoryEntry(entry);
    router.push('/');
  };

  const exitGame = () => {
    router.push('/');
  };

  if (showPayout) {
    return (
      <MinecraftBackground>
        <View style={styles.container}>
          <PixelText size="huge" color="#5C9C3E">D{selectedDice}</PixelText>
          <PixelText size="large" color="#FFD700" style={styles.rolledNum}>{result}</PixelText>
          <PixelText size="medium" color="#FFF" style={styles.label}>SELECT THE LOSER</PixelText>
          <View style={styles.characterGrid}>
            {characters.map((char) => (
              <MinecraftButton
                key={char.id}
                title={char.name.toUpperCase()}
                color={selectedLoser?.id === char.id ? '#E74C3C' : '#5C5C5C'}
                onPress={() => setSelectedLoser(char)}
                style={styles.charBtn}
              />
            ))}
          </View>
          <TextInput
            style={styles.payoutInput}
            placeholder="0.00"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={payout}
            onChangeText={setPayout}
          />
          <View style={styles.btnRow}>
            <MinecraftButton
              title="CONFIRM"
              color="#5C9C3E"
              onPress={confirmGame}
              disabled={!selectedLoser || !payout}
              style={styles.halfBtn}
            />
            <MinecraftButton title="EXIT" color="#E74C3C" onPress={exitGame} style={styles.halfBtn} />
          </View>
        </View>
      </MinecraftBackground>
    );
  }

  if (isCounting) {
    return (
      <MinecraftBackground>
        <View style={styles.container}>
          <PixelText size="huge" color="#E74C3C">{countdown}</PixelText>
          <PixelText size="large" color="#FFF">ROLLING D{selectedDice}...</PixelText>
        </View>
      </MinecraftBackground>
    );
  }

  if (result !== null) {
    return (
      <MinecraftBackground>
        <View style={styles.container}>
          <PixelText size="huge" color="#5C9C3E">D{selectedDice}</PixelText>
          <PixelText size="huge" color="#FFD700" style={styles.rolledNum}>{result}</PixelText>
          <View style={styles.btnColumn}>
            <MinecraftButton title="FINISH GAME" color="#5C9C3E" onPress={() => setShowPayout(true)} style={styles.fullBtn} />
            <MinecraftButton title="ANOTHER ROUND" color="#3498DB" onPress={startRoll} style={styles.fullBtn} />
            <MinecraftButton title="EXIT" color="#E74C3C" onPress={exitGame} style={styles.fullBtn} />
          </View>
        </View>
      </MinecraftBackground>
    );
  }

  return (
    <MinecraftBackground>
      <View style={styles.container}>
        <PixelText size="huge" color="#FFD700" style={styles.title}>DICE ROLL</PixelText>
        <View style={styles.diceGrid}>
          {DICE_TYPES.map((d) => (
            <MinecraftButton
              key={d}
              title={`D${d}`}
              color={selectedDice === d ? '#E74C3C' : '#5C5C5C'}
              onPress={() => setSelectedDice(d)}
              style={styles.diceBtn}
            />
          ))}
        </View>
        <MinecraftButton
          title="ROLL!"
          color="#5C9C3E"
          onPress={startRoll}
          disabled={!selectedDice}
          style={styles.startBtn}
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
    justifyContent: 'center',
  },
  title: {
    marginBottom: 30,
  },
  diceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  diceBtn: {
    width: 90,
    paddingVertical: 20,
  },
  startBtn: {
    marginTop: 40,
    width: 200,
    paddingVertical: 15,
  },
  rolledNum: {
    marginVertical: 10,
  },
  label: {
    marginBottom: 15,
    marginTop: 10,
  },
  characterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  charBtn: {
    minWidth: 100,
    paddingVertical: 12,
  },
  payoutInput: {
    backgroundColor: '#3C3C3C',
    color: '#FFFFFF',
    fontSize: 24,
    textAlign: 'center',
    padding: 15,
    borderWidth: 3,
    borderColor: '#1a1a1a',
    width: 200,
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  halfBtn: {
    flex: 1,
  },
  btnColumn: {
    gap: 15,
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 40,
  },
  fullBtn: {
    width: '100%',
  },
});