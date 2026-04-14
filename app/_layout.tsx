import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Stack } from 'expo-router';
import { useBackgroundMusic } from '../hooks/useBackgroundMusic';
import { getMuteState, saveMuteState } from '../hooks/storage';

interface MuteContextType {
  isMuted: boolean;
  toggleMute: () => void;
}

export const MuteContext = createContext<MuteContextType>({
  isMuted: false,
  toggleMute: () => {},
});

export function useMute() {
  return useContext(MuteContext);
}

function AudioProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const loadMuteState = async () => {
      const stored = await getMuteState();
      setIsMuted(stored);
    };
    loadMuteState();
  }, []);

  useBackgroundMusic(isMuted);

  const toggleMute = async () => {
    const newState = !isMuted;
    setIsMuted(newState);
    await saveMuteState(newState);
  };

  return (
    <MuteContext.Provider value={{ isMuted, toggleMute }}>
      {children}
    </MuteContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <AudioProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Gambling Helper' }} />
        <Stack.Screen name="characters" options={{ title: 'Characters' }} />
        <Stack.Screen name="history" options={{ title: 'History' }} />
        <Stack.Screen name="coin-flip" options={{ title: 'Coin Flip' }} />
        <Stack.Screen name="random-picker" options={{ title: 'Random Picker' }} />
        <Stack.Screen name="dice-roll" options={{ title: 'Dice Roll' }} />
        <Stack.Screen name="roulette" options={{ title: 'Roulette' }} />
      </Stack>
    </AudioProvider>
  );
}

