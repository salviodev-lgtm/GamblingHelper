import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';

interface MinecraftButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function MinecraftButton({
  title,
  onPress,
  color = '#5C5C5C',
  disabled = false,
  style,
  textStyle,
}: MinecraftButtonProps) {
  const darkColor = shadeColor(color, -30);
  const lightColor = shadeColor(color, 30);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        { backgroundColor: disabled ? '#3C3C3C' : color },
        style,
      ]}
    >
      <View style={[styles.topEdge, { backgroundColor: disabled ? '#4C4C4C' : lightColor }]} />
      <View style={[styles.leftEdge, { backgroundColor: disabled ? '#4C4C4C' : lightColor }]} />
      <View style={[styles.rightEdge, { backgroundColor: disabled ? '#2C2C2C' : darkColor }]} />
      <View style={[styles.bottomEdge, { backgroundColor: disabled ? '#2C2C2C' : darkColor }]} />
      <Text style={[styles.text, disabled && styles.disabledText, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function shadeColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 3,
    borderColor: '#1a1a1a',
  },
  topEdge: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    height: 6,
    borderTopWidth: 3,
    borderTopColor: '#1a1a1a',
  },
  leftEdge: {
    position: 'absolute',
    top: 3,
    left: -3,
    bottom: 3,
    width: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#1a1a1a',
  },
  rightEdge: {
    position: 'absolute',
    top: 3,
    right: -3,
    bottom: 3,
    width: 6,
    borderRightWidth: 3,
    borderRightColor: '#1a1a1a',
  },
  bottomEdge: {
    position: 'absolute',
    bottom: -3,
    left: -3,
    right: -3,
    height: 6,
    borderBottomWidth: 3,
    borderBottomColor: '#1a1a1a',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
    letterSpacing: 1,
  },
  disabledText: {
    color: '#888',
  },
});