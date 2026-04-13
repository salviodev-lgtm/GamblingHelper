import { useState, useEffect } from 'react';
import { View, StyleSheet, ImageBackground, TextInput, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { getCharacters, addHistoryEntry, generateId } from '../hooks/storage';
import { Character, HistoryEntry } from '../types';
import MinecraftButton from '../components/MinecraftButton';
import PixelText from '../components/PixelText';

const games = [
  { name: 'COIN FLIP', path: '/coin-flip' as const, color: '#E74C3C' },
  { name: 'DICE ROLL', path: '/dice-roll' as const, color: '#5C9C3E' },
  { name: 'RANDOM PICKER', path: '/random-picker' as const, color: '#3498DB' },
  { name: 'ROULETTE', path: '/roulette' as const, color: '#9B59B6' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [showCustomModal, setShowCustomModal] = useState(false);

  return (
    <ImageBackground source={require('../assets/images/MenuWallpaper.jpeg')} style={styles.background}>
      <View style={styles.overlay}>
        <PixelText size="huge" color="#FFD700" style={styles.title}>GAMBLING{'\n'}HELPER</PixelText>
        <View style={styles.gameGrid}>
          {games.map((game) => (
            <MinecraftButton
              key={game.path}
              title={game.name}
              color={game.color}
              style={styles.gameButton}
              onPress={() => router.push(game.path)}
            />
          ))}
          <MinecraftButton
            title="CUSTOM GAME"
            color="#F39C12"
            style={styles.gameButton}
            onPress={() => setShowCustomModal(true)}
          />
        </View>
        <View style={styles.bottomLinks}>
          <MinecraftButton
            title="HISTORY"
            color="#5C5C5C"
            style={styles.linkButton}
            onPress={() => router.push('/history')}
          />
          <MinecraftButton
            title="CHARACTERS"
            color="#5C5C5C"
            style={styles.linkButton}
            onPress={() => router.push('/characters')}
          />
        </View>
      </View>

      <CustomGameModal
        visible={showCustomModal}
        onClose={() => setShowCustomModal(false)}
      />
    </ImageBackground>
  );
}

interface CustomGameModalProps {
  visible: boolean;
  onClose: () => void;
}

function CustomGameModal({ visible, onClose }: CustomGameModalProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [gameName, setGameName] = useState('');
  const [payout, setPayout] = useState('');

  useEffect(() => {
    if (visible) {
      loadCharacters();
    }
  }, [visible]);

  const loadCharacters = async () => {
    const chars = await getCharacters();
    setCharacters(chars.filter((c) => c.isActive));
  };

  const handleSave = async () => {
    if (!selectedCharacter || !gameName.trim() || !payout) return;

    const entry: HistoryEntry = {
      id: generateId(),
      characterId: selectedCharacter.id,
      characterName: selectedCharacter.name,
      gameType: 'custom',
      result: gameName.trim(),
      timestamp: Date.now(),
      payout: parseFloat(payout) || 0,
    };

    await addHistoryEntry(entry);
    setSelectedCharacter(null);
    setGameName('');
    setPayout('');
    onClose();
  };

  const handleClose = () => {
    setSelectedCharacter(null);
    setGameName('');
    setPayout('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.modal}>
          <PixelText size="large" color="#FFD700" style={modalStyles.title}>CUSTOM GAME</PixelText>

          <PixelText size="medium" color="#FFF" style={modalStyles.label}>SELECT LOSER:</PixelText>
          <ScrollView style={modalStyles.characterList}>
            {characters.map((char) => (
              <MinecraftButton
                key={char.id}
                title={char.name.toUpperCase()}
                color={selectedCharacter?.id === char.id ? '#E74C3C' : '#5C5C5C'}
                onPress={() => setSelectedCharacter(char)}
                style={modalStyles.charBtn}
              />
            ))}
          </ScrollView>

          <PixelText size="medium" color="#FFF" style={modalStyles.label}>GAME NAME:</PixelText>
          <TextInput
            style={modalStyles.input}
            placeholder="e.g. Poker Night"
            placeholderTextColor="#888"
            value={gameName}
            onChangeText={setGameName}
          />

          <PixelText size="medium" color="#FFF" style={modalStyles.label}>PAYOUT (€):</PixelText>
          <TextInput
            style={modalStyles.input}
            placeholder="0.00"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={payout}
            onChangeText={setPayout}
          />

          <View style={modalStyles.btnRow}>
            <MinecraftButton
              title="SAVE"
              color="#5C9C3E"
              onPress={handleSave}
              disabled={!selectedCharacter || !gameName.trim() || !payout}
              style={modalStyles.halfBtn}
            />
            <MinecraftButton
              title="CANCEL"
              color="#E74C3C"
              onPress={handleClose}
              style={modalStyles.halfBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  title: {
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  gameGrid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  gameButton: {
    width: 250,
    paddingVertical: 20,
  },
  bottomLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  linkButton: {
    width: 140,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#3C3C3C',
    borderWidth: 4,
    borderColor: '#1a1a1a',
    borderRadius: 4,
    padding: 20,
    width: '100%',
    maxWidth: 350,
    maxHeight: '80%',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    marginTop: 15,
  },
  characterList: {
    maxHeight: 150,
    marginBottom: 10,
  },
  charBtn: {
    marginBottom: 8,
    paddingVertical: 10,
  },
  input: {
    backgroundColor: '#2C2C2C',
    color: '#FFFFFF',
    fontSize: 16,
    padding: 12,
    borderWidth: 3,
    borderColor: '#1a1a1a',
    fontFamily: 'monospace',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 25,
  },
  halfBtn: {
    flex: 1,
  },
});