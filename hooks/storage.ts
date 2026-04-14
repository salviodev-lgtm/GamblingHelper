import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character, HistoryEntry } from '../types';

const CHARACTERS_KEY = 'characters';
const HISTORY_KEY = 'history';
const MUTE_KEY = 'mute_state';

const DEFAULT_CHARACTERS: Character[] = [
  { id: '1', name: 'hardi', isGuest: false, isActive: true },
  { id: '2', name: 'botty', isGuest: false, isActive: true },
  { id: '3', name: 'pesca', isGuest: false, isActive: true },
  { id: '4', name: 'michele cappello', isGuest: false, isActive: true },
  { id: '5', name: 'victor', isGuest: false, isActive: true },
  { id: '6', name: 'kekko bomba', isGuest: false, isActive: true },
  { id: '7', name: 'riccardone', isGuest: false, isActive: true },
];

export const getCharacters = async (): Promise<Character[]> => {
  const stored = await AsyncStorage.getItem(CHARACTERS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  await AsyncStorage.setItem(CHARACTERS_KEY, JSON.stringify(DEFAULT_CHARACTERS));
  return DEFAULT_CHARACTERS;
};

export const saveCharacters = async (characters: Character[]): Promise<void> => {
  await AsyncStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
};

export const getHistory = async (): Promise<HistoryEntry[]> => {
  const stored = await AsyncStorage.getItem(HISTORY_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

export const saveHistory = async (history: HistoryEntry[]): Promise<void> => {
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const addHistoryEntry = async (entry: HistoryEntry): Promise<void> => {
  const history = await getHistory();
  history.unshift(entry);
  await saveHistory(history);
};

export const deleteHistoryEntry = async (id: string): Promise<void> => {
  const history = await getHistory();
  const filtered = history.filter((entry) => entry.id !== id);
  await saveHistory(filtered);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getMuteState = async (): Promise<boolean> => {
  const stored = await AsyncStorage.getItem(MUTE_KEY);
  return stored ? JSON.parse(stored) : false;
};

export const saveMuteState = async (isMuted: boolean): Promise<void> => {
  await AsyncStorage.setItem(MUTE_KEY, JSON.stringify(isMuted));
};