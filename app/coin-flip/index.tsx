import { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput } from 'react-native';
import { router } from 'expo-router';
import { getCharacters, addHistoryEntry, generateId } from '../../hooks/storage';
import { Character, HistoryEntry } from '../../types';
import MinecraftBackground from '../../components/MinecraftBackground';
import MinecraftButton from '../../components/MinecraftButton';
import PixelText from '../../components/PixelText';

type CoinSide = 'heads' | 'tails' | null;

export default function CoinFlipScreen() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedHeads, setSelectedHeads] = useState<Character | null>(null);
  const [selectedTails, setSelectedTails] = useState<Character | null>(null);
  const [countdown, setCountdown] = useState<number>(5);
  const [result, setResult] = useState<CoinSide>(null);
  const [isCounting, setIsCounting] = useState(false);
  const [showPayout, setShowPayout] = useState(false);
  const [payout, setPayout] = useState('');

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    const chars = await getCharacters();
    setCharacters(chars.filter((c) => c.isActive));
  };

  const startGame = () => {
    if (!selectedHeads || !selectedTails || selectedHeads.id === selectedTails.id) return;
    setIsCounting(true);
    setCountdown(5);
    setResult(null);
    setShowPayout(false);
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
      const random = Math.random() < 0.5 ? 'heads' : 'tails';
      setResult(random);
      setIsCounting(false);
    }
  }, [isCounting, countdown]);

  const getLoser = (): Character | null => {
    if (!result) return null;
    return result === 'heads' ? selectedTails : selectedHeads;
  };

  const confirmGame = async () => {
    const loser = getLoser();
    if (!loser || !payout) return;
    const entry: HistoryEntry = {
      id: generateId(),
      characterId: loser.id,
      characterName: loser.name,
      gameType: 'coin-flip',
      result: result!,
      timestamp: Date.now(),
      payout: parseFloat(payout) || 0,
    };
    await addHistoryEntry(entry);
    router.push('/');
  };

  const exitGame = () => {
    router.push('/');
  };

  const renderCharacter = ({ item }: { item: Character }) => {
    const isSelectedHeads = selectedHeads?.id === item.id;
    const isSelectedTails = selectedTails?.id === item.id;
    return (
      <View style={styles.charContainer}>
        <MinecraftButton
          title={`${item.name.toUpperCase()}\nHEADS`}
          color={isSelectedHeads ? '#E74C3C' : '#5C5C5C'}
          onPress={() => setSelectedHeads(item)}
          style={styles.charBtn}
          textStyle={styles.charBtnText}
        />
        <MinecraftButton
          title={`${item.name.toUpperCase()}\nTAILS`}
          color={isSelectedTails ? '#3498DB' : '#5C5C5C'}
          onPress={() => setSelectedTails(item)}
          style={styles.charBtn}
          textStyle={styles.charBtnText}
        />
      </View>
    );
  };

  if (showPayout) {
    const loser = getLoser();
    return (
      <MinecraftBackground>
        <View style={styles.container}>
          <PixelText size="huge" color="#E74C3C">{loser?.name.toUpperCase()} LOSES!</PixelText>
          <PixelText size="medium" color="#FFF" style={styles.label}>ENTER PAYOUT</PixelText>
          <TextInput
            style={styles.payoutInput}
            placeholder="0.00"
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

  if (isCounting) {
    return (
      <MinecraftBackground>
        <View style={styles.container}>
          <PixelText size="huge" color="#FFD700">{countdown}</PixelText>
          <PixelText size="large" color="#FFF">FLIPPING...</PixelText>
        </View>
      </MinecraftBackground>
    );
  }

  if (result) {
    const loser = getLoser();
    return (
      <MinecraftBackground>
        <View style={styles.container}>
          <PixelText size="huge" color="#FFD700">{result.toUpperCase()}</PixelText>
          <PixelText size="huge" color="#E74C3C" style={styles.winnerText}>{loser?.name.toUpperCase()} LOSES!</PixelText>
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
        <PixelText size="huge" color="#FFD700" style={styles.title}>COIN FLIP</PixelText>
        <View style={styles.headsTailsHeader}>
          <PixelText size="large" color="#E74C3C">HEADS</PixelText>
          <PixelText size="large" color="#3498DB">TAILS</PixelText>
        </View>
        <FlatList
          data={characters}
          keyExtractor={(item) => item.id}
          renderItem={renderCharacter}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
        <MinecraftButton
          title="FLIP!"
          color="#FFD700"
          onPress={startGame}
          disabled={!selectedHeads || !selectedTails || selectedHeads.id === selectedTails.id}
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
    marginBottom: 20,
  },
  headsTailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15,
  },
  list: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    gap: 10,
  },
  charContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  charBtn: {
    flex: 1,
    paddingVertical: 15,
  },
  charBtnText: {
    fontSize: 12,
  },
  startBtn: {
    marginTop: 15,
    width: 200,
    paddingVertical: 15,
  },
  winnerText: {
    marginVertical: 20,
  },
  label: {
    marginTop: 20,
    marginBottom: 10,
  },
  payoutInput: {
    backgroundColor: '#3C3C3C',
    color: '#FFFFFF',
    fontSize: 28,
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
  },
  halfBtn: {
    flex: 1,
  },
});