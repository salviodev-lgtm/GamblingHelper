import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

export function useBackgroundMusic(isMuted: boolean) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const isSetupRef = useRef(false);

  useEffect(() => {
    const setupAudio = async () => {
      if (isSetupRef.current) return;
      isSetupRef.current = true;

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

    if (!isMuted) {
      setupAudio();
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
        isSetupRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setVolumeAsync(isMuted ? 0 : 0.3);
    }
  }, [isMuted]);
}