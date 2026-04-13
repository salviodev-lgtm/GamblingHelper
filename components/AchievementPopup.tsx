import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

interface AchievementPopupProps {
  winner: string;
  visible: boolean;
  onHide: () => void;
}

const { width } = Dimensions.get('window');

export default function AchievementPopup({ winner, visible, onHide }: AchievementPopupProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <Animated.View style={[styles.popup, { transform: [{ scale }] }]}>
        <View style={styles.topBar}>
          <Text style={styles.achievementText}>ACHIEVEMENT UNLOCKED!</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🏆</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.winnerLabel}>THE LOSER IS:</Text>
            <Text style={styles.winnerName}>{winner}</Text>
          </View>
        </View>
        <View style={styles.bottomBar} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 1000,
  },
  popup: {
    width: width * 0.85,
    backgroundColor: '#2C2C2C',
    borderWidth: 4,
    borderColor: '#1a1a1a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  topBar: {
    backgroundColor: '#5C5C5C',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#1a1a1a',
  },
  achievementText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#3C3C3C',
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#5C5C5C',
    marginRight: 16,
  },
  icon: {
    fontSize: 32,
  },
  textContainer: {
    flex: 1,
  },
  winnerLabel: {
    color: '#AAAAAA',
    fontSize: 12,
    marginBottom: 4,
  },
  winnerName: {
    color: '#E74C3C',
    fontSize: 28,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  bottomBar: {
    height: 8,
    backgroundColor: '#2C2C2C',
  },
});