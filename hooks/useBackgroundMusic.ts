import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

export function useBackgroundMusic() {
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const setupAudio = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        require('../assets/OST.mp3'),
        { isLooping: true, volume: 0.3 }
      );
      soundRef.current = sound;
      await sound.playAsync();
    };

    setupAudio();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);
}