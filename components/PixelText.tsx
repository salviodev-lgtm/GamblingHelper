import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';

interface PixelTextProps extends TextProps {
  color?: string;
  size?: 'small' | 'medium' | 'large' | 'huge';
}

export default function PixelText({ color = '#FFFFFF', size = 'medium', style, ...props }: PixelTextProps) {
  const fontSize = {
    small: 12,
    medium: 16,
    large: 24,
    huge: 36,
  }[size];

  return (
    <RNText
      {...props}
      style={[
        styles.pixel,
        { color, fontSize, lineHeight: fontSize + 4 },
        style,
      ]}
    >
      {props.children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  pixel: {
    fontFamily: 'monospace',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
    letterSpacing: 1,
  },
});