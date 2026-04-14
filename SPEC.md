# Gambling Helper - Specification

## Overview
An Android app to help decide who pays for coffee among friends. Features playful UI with character selection and history tracking.

## Tech Stack
- **React Native** with Expo
- **TypeScript**
- **expo-router** for navigation

## Navigation Structure

```
Root
├── index (Home - Game Selection)
│   ├── coin-flip
│   │   └── play
│   ├── random-picker
│   │   ├── play (character selection)
│   │   └── eliminazione (character selection)
│   ├── dice-roll
│   │   └── play
│   ├── roulette
│   │   └── play (character selection)
│   └── history (shared across all games)
└── characters (Manage roster)
```

## Features

### 1. Character Management (`/characters`)
- View all available characters
- Add/edit/remove characters
- Activate/deactivate guests (with custom name input)
- Default characters: hardi, botty, pesca, michele cappello, victor, kekko bomba, riccardone

### 2. Coin Flip (`/coin-flip`)
- Single tap to flip coin
- Animated coin showing result (Heads/Tails)
- After result, enter payout amount

### 3. Random Picker (`/random-picker`)
- **Play**: Select subset of characters → pick random one → show result → enter payout
- **Eliminazione**: Select characters → repeatedly pick and eliminate until one remains → that character pays → enter payout

### 4. Dice Roll (`/dice-roll`)
- Select dice type: D3, D6, D10, D12, D20, D50
- 3-second countdown before reveal
- Random number displayed after countdown
- Two options after result: "Finish Game" (select loser) or "Another Round" (roll again)

### 5. Roulette (`/roulette`)
- **Play**: Select subset of characters → spin wheel → result → enter payout

## Data Model

### Character
```typescript
interface Character {
  id: string;
  name: string;
  isGuest: boolean;
  isActive: boolean;
}
```

### HistoryEntry
```typescript
interface HistoryEntry {
  id: string;
  characterId: string;
  characterName: string;
  gameType: 'coin-flip' | 'random-picker' | 'random-picker-eliminazione' | 'dice-roll' | 'roulette';
  result: string;
  timestamp: number;
  payout: number;
}
```

### Shared History (`/history`)
Unified history table with columns:
- **Character** - the loser (who pays)
- **Game** - which minigame
- **Time** - timestamp
- **Payout** - numeric value (e.g., 17.50)
- **Delete** - tap ✕ to remove individual record

## UI Style
- Playful and colorful
- Fun animations for coin flip, dice roll, roulette spin
- Simple, intuitive navigation

## Storage
- AsyncStorage for persisting characters and history

## Use Cases

### 1. Add/Edit/Remove Character
1. User opens the app
2. User taps "Characters" in navigation
3. Screen displays list of all characters
4. User taps "+" to add a new character OR taps an existing character to edit
5. User can delete a character from the edit screen

### 2. View History
1. User opens the app
2. User taps "History" in navigation
3. Screen displays unified list of all payers with columns: Character, Game, Time, Payout
4. User can filter the list by character
5. User can tap ✕ on any record to delete it

### 3. Play Coin Flip
1. User opens the app → Game Selection
2. User taps "Coin Flip"
3. User selects 2 characters (one for Heads, one for Tails)
4. App displays countdown
5. Coin result is revealed (Heads or Tails)
6. **Scenario A - Confirm Game:**
   - User taps "Confirm Game"
   - Loser is determined based on result
   - User enters payout amount
   - Entry is saved to history
7. **Scenario B - Exit:**
   - User taps "Exit"
   - App returns to game selection

### 4. Play Dice Roll
1. User opens the app → Game Selection
2. User taps "Dice Roll"
3. User selects dice type: D3, D6, D10, D12, D20, or D50
4. App displays 3-second countdown
5. Random number is revealed
6. **Scenario A - Finish Game:**
   - User taps "Finish Game"
   - User selects the character who lost
   - User enters payout amount
   - Entry is saved to history
7. **Scenario B - Another Round:**
   - User taps "Another Round"
   - New countdown begins (3 seconds)
   - New random number revealed
   - Return to step 6
8. **Scenario C - Exit:**
   - User taps "Exit"
   - App returns to game selection

### 5. Play Random Picker (Normal)
1. User opens the app → Game Selection
2. User taps "Random Picker"
3. User selects "Normal" mode
4. User selects subset of characters from the roster
5. App randomly picks one character
6. Picked character is shown as the loser (payer)
7. **Scenario A - Confirm Game:**
   - User taps "Confirm Game"
   - User enters payout amount
   - Entry is saved to history
8. **Scenario B - Exit:**
   - User taps "Exit"
   - App returns to game selection

### 6. Play Roulette (Normal)
1. User opens the app → Game Selection
2. User taps "Roulette"
3. User selects "Normal" mode
4. User selects subset of characters from the roster
5. App spins the wheel and picks one character
6. Picked character is shown as the loser (payer)
7. **Scenario A - Confirm Game:**
   - User taps "Confirm Game"
   - User enters payout amount
   - Entry is saved to history
8. **Scenario B - Exit:**
   - User taps "Exit"
   - App returns to game selection

### 7. Play Roulette (Eliminazione)
1. User opens the app → Game Selection
2. User taps "Roulette"
3. User selects "Eliminazione" mode
4. User selects subset of characters from the roster
5. App spins the wheel and repeatedly eliminates characters until one remains
6. Last remaining character is shown as the loser (payer)
7. **Scenario A - Confirm Game:**
   - User taps "Confirm Game"
   - User enters payout amount
   - Entry is saved to history
8. **Scenario B - Exit:**
   - User taps "Exit"
   - App returns to game selection
