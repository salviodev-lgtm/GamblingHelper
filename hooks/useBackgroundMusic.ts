import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

export function useBackgroundMusic(isMuted: boolean) {
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
        { isLooping: true, volume: isMuted ? 0 : 0.3 }
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

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setVolumeAsync(isMuted ? 0 : 0.3);
    }
  }, [isMuted]);
}