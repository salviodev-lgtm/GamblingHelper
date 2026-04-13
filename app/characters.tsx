import { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput, Alert } from 'react-native';
import { getCharacters, saveCharacters, generateId } from '../hooks/storage';
import { Character } from '../types';
import MinecraftBackground from '../components/MinecraftBackground';
import MinecraftButton from '../components/MinecraftButton';
import PixelText from '../components/PixelText';

export default function CharactersScreen() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    const chars = await getCharacters();
    setCharacters(chars);
  };

  const addCharacter = async () => {
    if (!newName.trim()) return;
    const newChar: Character = {
      id: generateId(),
      name: newName.trim(),
      isGuest: true,
      isActive: true,
    };
    const updated = [...characters, newChar];
    await saveCharacters(updated);
    setCharacters(updated);
    setNewName('');
  };

  const updateCharacter = async (id: string) => {
    const updated = characters.map((c) =>
      c.id === id ? { ...c, name: editName.trim() } : c
    );
    await saveCharacters(updated);
    setCharacters(updated);
    setEditingId(null);
    setEditName('');
  };

  const deleteCharacter = (id: string) => {
    Alert.alert('Delete Character', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = characters.filter((c) => c.id !== id);
          await saveCharacters(updated);
          setCharacters(updated);
        },
      },
    ]);
  };

  const toggleActive = async (id: string) => {
    const updated = characters.map((c) =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    await saveCharacters(updated);
    setCharacters(updated);
  };

  const startEdit = (character: Character) => {
    setEditingId(character.id);
    setEditName(character.name);
  };

  const renderItem = ({ item }: { item: Character }) => {
    if (editingId === item.id) {
      return (
        <View style={styles.item}>
          <TextInput
            style={styles.input}
            value={editName}
            onChangeText={setEditName}
            autoFocus
            placeholderTextColor="#888"
          />
          <MinecraftButton title="SAVE" color="#5C9C3E" onPress={() => updateCharacter(item.id)} style={styles.smallBtn} />
          <MinecraftButton title="X" color="#E74C3C" onPress={() => setEditingId(null)} style={styles.xSmallBtn} />
        </View>
      );
    }

    return (
      <View style={[styles.item, !item.isActive && styles.inactive]}>
        <View style={styles.nameContainer}>
          <PixelText size="medium" color={item.isActive ? '#FFF' : '#888'}>{item.name.toUpperCase()}</PixelText>
          {item.isGuest && <PixelText size="small" color="#9B59B6"> GUEST</PixelText>}
        </View>
        <View style={styles.actions}>
          <MinecraftButton
            title={item.isActive ? 'ON' : 'OFF'}
            color={item.isActive ? '#5C9C3E' : '#3C3C3C'}
            onPress={() => toggleActive(item.id)}
            style={styles.smallBtn}
          />
          <MinecraftButton title="EDIT" color="#3498DB" onPress={() => startEdit(item)} style={styles.smallBtn} />
          <MinecraftButton title="X" color="#E74C3C" onPress={() => deleteCharacter(item.id)} style={styles.xSmallBtn} />
        </View>
      </View>
    );
  };

  return (
    <MinecraftBackground>
      <View style={styles.container}>
        <PixelText size="huge" color="#FFD700" style={styles.title}>CHARACTERS</PixelText>
        <View style={styles.addSection}>
          <TextInput
            style={styles.input}
            placeholder="New character name"
            placeholderTextColor="#888"
            value={newName}
            onChangeText={setNewName}
          />
          <MinecraftButton title="+" color="#5C9C3E" onPress={addCharacter} style={styles.addBtn} />
        </View>
        <FlatList
          data={characters}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      </View>
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
    marginTop: 10,
  },
  addSection: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#3C3C3C',
    color: '#fff',
    padding: 12,
    borderWidth: 3,
    borderColor: '#1a1a1a',
    fontFamily: 'monospace',
    fontSize: 16,
  },
  addBtn: {
    width: 60,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5C5C5C',
    padding: 15,
    borderWidth: 3,
    borderColor: '#1a1a1a',
    gap: 10,
  },
  inactive: {
    opacity: 0.5,
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 5,
  },
  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  xSmallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
});