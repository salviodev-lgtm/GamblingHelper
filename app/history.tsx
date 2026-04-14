import { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity, Text } from 'react-native';
import { getHistory, getCharacters, deleteHistoryEntry } from '../hooks/storage';
import { HistoryEntry, Character } from '../types';
import MinecraftBackground from '../components/MinecraftBackground';
import MinecraftButton from '../components/MinecraftButton';
import PixelText from '../components/PixelText';

const gameLabels: Record<string, string> = {
  'coin-flip': 'COIN FLIP',
  'random-picker': 'RANDOM PICK',
  'random-picker-eliminazione': 'RP ELIM',
  'dice-roll': 'DICE ROLL',
  'roulette': 'ROULETTE',
  'roulette-eliminazione': 'ROUL ELIM',
  'custom': 'CUSTOM',
};

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filterCharacter, setFilterCharacter] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const h = await getHistory();
    const c = await getCharacters();
    setHistory(h);
    setCharacters(c);
  };

  const handleDelete = async (id: string) => {
    await deleteHistoryEntry(id);
    loadData();
  };

  const filteredHistory = filterCharacter
    ? history.filter((e) => e.characterId === filterCharacter)
    : history;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + '\n' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }: { item: HistoryEntry }) => (
    <View style={styles.item}>
      <PixelText size="medium" color="#FFF" style={styles.characterName}>{item.characterName.toUpperCase()}</PixelText>
      <PixelText size="small" color="#3498DB" style={styles.gameType}>
        {item.gameType === 'custom' ? item.result.toUpperCase() : gameLabels[item.gameType]}
      </PixelText>
      <PixelText size="small" color="#888" style={styles.time}>{formatDate(item.timestamp)}</PixelText>
      <PixelText size="medium" color="#FFD700" style={styles.payout}>{item.payout.toFixed(2)}€</PixelText>
      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const uniqueCharacters = [...new Set(history.map((h) => h.characterId))];

  return (
    <MinecraftBackground>
      <View style={styles.container}>
        <PixelText size="huge" color="#FFD700" style={styles.title}>HISTORY</PixelText>
        <View style={styles.header}>
          <PixelText size="small" color="#FFF">CHARACTER</PixelText>
          <PixelText size="small" color="#FFF">GAME</PixelText>
          <PixelText size="small" color="#FFF">TIME</PixelText>
          <PixelText size="small" color="#FFF">PAYOUT</PixelText>
        </View>
        <ScrollView horizontal style={styles.filterSection}>
          <MinecraftButton
            title="ALL"
            color={!filterCharacter ? '#5C9C3E' : '#5C5C5C'}
            onPress={() => setFilterCharacter(null)}
            style={styles.filterBtn}
          />
          {uniqueCharacters.map((charId) => {
            const char = characters.find((c) => c.id === charId);
            if (!char) return null;
            return (
              <MinecraftButton
                key={charId}
                title={char.name.toUpperCase()}
                color={filterCharacter === charId ? '#E74C3C' : '#5C5C5C'}
                onPress={() => setFilterCharacter(charId)}
                style={styles.filterBtn}
              />
            );
          })}
        </ScrollView>
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<PixelText size="medium" color="#888" style={styles.empty}>NO HISTORY YET</PixelText>}
        />
      </View>
    </MinecraftBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    textAlign: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#5C5C5C',
    padding: 10,
    borderWidth: 3,
    borderColor: '#1a1a1a',
    marginBottom: 5,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3C3C3C',
    padding: 10,
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  characterName: {
    flex: 1.2,
    textAlign: 'center',
  },
  gameType: {
    flex: 1,
    textAlign: 'center',
  },
  time: {
    flex: 1,
    textAlign: 'center',
  },
  payout: {
    flex: 0.8,
    textAlign: 'center',
  },
  deleteBtn: {
    padding: 5,
  },
  deleteText: {
    color: '#E74C3C',
    fontSize: 18,
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
  },
  filterSection: {
    marginBottom: 10,
    maxHeight: 50,
  },
  filterBtn: {
    marginRight: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
});