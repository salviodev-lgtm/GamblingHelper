import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { Audio } from 'expo-av';
import { Stack } from 'expo-router';
import { getMuteState, saveMuteState } from '../hooks/storage';
import { Animated, Easing } from 'react-native';

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

const slideInterpolator = ({ current, layouts }: { current: Animated.AnimatedInterpolation; layouts: { screen: { width: number } } }) => {
  return {
    cardStyle: {
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.width, 0],
          }),
        },
      ],
    },
  };
};

const transitionSpec = {
  open: {
    animation: 'timing' as const,
    config: {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    },
  },
  close: {
    animation: 'timing' as const,
    config: {
      duration: 300,
      easing: Easing.in(Easing.cubic),
    },
  },
};

function AudioProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const loadMuteState = async () => {
      const stored = await getMuteState();
      setIsMuted(stored);
      setIsLoaded(true);
    };
    loadMuteState();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    let isMounted = true;

    const setupAudio = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        require('../assets/OST.mp3'),
        { isLooping: true, volume: isMuted ? 0 : 0.3 }
      );

      if (isMounted) {
        soundRef.current = sound;
        await sound.playAsync();
      } else {
        await sound.unloadAsync();
      }
    };

    setupAudio();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [isLoaded]);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setVolumeAsync(isMuted ? 0 : 0.3);
    }
  }, [isMuted]);

  const toggleMute = async () => {
    const newState = !isMuted;
    setIsMuted(newState);
    await saveMuteState(newState);
  };

  return (
    <MuteContext.Provider value={{ isMuted, toggleMute }}>
      {isLoaded ? children : null}
    </MuteContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <AudioProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
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

