import React from 'react';
import { View, StyleSheet } from 'react-native';

interface MinecraftBackgroundProps {
  children: React.ReactNode;
}

export default function MinecraftBackground({ children }: MinecraftBackgroundProps) {
  return (
    <View style={styles.container}>
      <View style={styles.grassLayer}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={`grass-${i}`} style={[styles.grassBlock, { left: i * 40 }]} />
        ))}
      </View>
      <View style={styles.dirtLayer}>
        {Array.from({ length: 60 }).map((_, i) => (
          <View key={`dirt-${i}`} style={[styles.dirtBlock, { left: (i % 10) * 40, top: Math.floor(i / 10) * 40 }]} />
        ))}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  grassLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    flexDirection: 'row',
    zIndex: 10,
  },
  grassBlock: {
    width: 40,
    height: 40,
    backgroundColor: '#5C9C3E',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  dirtLayer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dirtBlock: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: '#8B6B4A',
    borderWidth: 1,
    borderColor: '#6B4B2A',
  },
  content: {
    flex: 1,
    zIndex: 5,
  },
});