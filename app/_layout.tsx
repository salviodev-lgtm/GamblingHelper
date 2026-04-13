import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Gambling Helper' }} />
      <Stack.Screen name="characters" options={{ title: 'Characters' }} />
      <Stack.Screen name="history" options={{ title: 'History' }} />
      <Stack.Screen name="coin-flip" options={{ title: 'Coin Flip' }} />
      <Stack.Screen name="random-picker" options={{ title: 'Random Picker' }} />
      <Stack.Screen name="dice-roll" options={{ title: 'Dice Roll' }} />
      <Stack.Screen name="roulette" options={{ title: 'Roulette' }} />
    </Stack>
  );
}