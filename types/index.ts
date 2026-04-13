export interface Character {
  id: string;
  name: string;
  isGuest: boolean;
  isActive: boolean;
}

export type GameType = 'coin-flip' | 'random-picker' | 'random-picker-eliminazione' | 'dice-roll' | 'roulette' | 'roulette-eliminazione' | 'custom';

export interface HistoryEntry {
  id: string;
  characterId: string;
  characterName: string;
  gameType: GameType;
  result: string;
  timestamp: number;
  payout: number;
}