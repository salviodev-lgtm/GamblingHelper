import { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import Svg, { G, Path, Circle, Text as SvgText, Line, Rect, Polygon } from 'react-native-svg';

interface WheelProps {
  items: string[];
  isSpinning: boolean;
  onSpinEnd: (winner: string) => void;
  size?: number;
}

const MINECRAFT_COLORS = [
  '#E74C3C', '#3498DB', '#2ECC71', '#F1C40F', '#9B59B6', '#1ABC9C',
  '#E67E22', '#34495E', '#C0392B', '#2980B9', '#27AE60', '#D4AC0D',
];

export default function Wheel({ items, isSpinning, onSpinEnd, size = 300 }: WheelProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const hasEndedRef = useRef(false);
  const winnerRef = useRef<string>('');
  const radius = size / 2 - 10;
  const center = size / 2;

  const sortedItems = useMemo(() => [...items].sort((a, b) => b.localeCompare(a)), [items]);
  const sliceAngle = 360 / Math.max(sortedItems.length, 1);

  const getPlayerAtNumber = (num: number): string => {
    const index = Math.floor(num / sliceAngle);
    const clampedIndex = Math.min(index, sortedItems.length - 1);
    return sortedItems[clampedIndex];
  };

  useEffect(() => {
    if (isSpinning) {
      hasEndedRef.current = false;

      const winningNumber = Math.floor(Math.random() * 360);
      winnerRef.current = getPlayerAtNumber(winningNumber);

      const minSpins = 5;
      const targetAngle = (270 - winningNumber + 360) % 360;
      const totalRotation = minSpins * 360 + targetAngle;

      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: totalRotation,
        duration: 4000,
        easing: Easing.bezier(0.2, 0.8, 0.3, 1),
        useNativeDriver: true,
      }).start(() => {
        if (!hasEndedRef.current && items.length > 0) {
          hasEndedRef.current = true;
          onSpinEnd(winnerRef.current);
        }
      });
    } else {
      spinValue.setValue(0);
    }
  }, [isSpinning]);

  const createSlicePath = (startAngle: number, endAngle: number): string => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Svg width={size} height={size}>
          <G>
            {sortedItems.map((item, index) => {
              const startAngle = index * sliceAngle;
              return (
                <G key={index}>
                  <Path
                    d={createSlicePath(startAngle, startAngle + sliceAngle)}
                    fill={MINECRAFT_COLORS[index % MINECRAFT_COLORS.length]}
                    stroke="#1a1a1a"
                    strokeWidth={3}
                  />
                  <SvgText
                    x={center + (radius / 1.6) * Math.cos(((startAngle + sliceAngle / 2) * Math.PI) / 180)}
                    y={center + (radius / 1.6) * Math.sin(((startAngle + sliceAngle / 2) * Math.PI) / 180)}
                    fill="#fff"
                    fontSize={11}
                    fontWeight="bold"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    stroke="#1a1a1a"
                    strokeWidth={0.5}
                  >
                    {item.length > 7 ? item.slice(0, 7) + '..' : item}
                  </SvgText>
                </G>
              );
            })}
            <Circle cx={center} cy={center} r={12} fill="#5C5C5C" stroke="#1a1a1a" strokeWidth={2} />
            <Circle cx={center} cy={center} r={6} fill="#3C3C3C" />
          </G>
        </Svg>
      </Animated.View>
      <View style={styles.pointerContainer}>
        <Svg width={40} height={50}>
          <Polygon
            points="20,50 5,15 20,25 35,15"
            fill="#808080"
            stroke="#1a1a1a"
            strokeWidth={2}
          />
          <Rect x={8} y={0} width={24} height={15} fill="#5C5C5C" stroke="#1a1a1a" strokeWidth={2} />
          <Rect x={12} y={3} width={16} height={9} fill="#3C3C3C" />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointerContainer: {
    position: 'absolute',
    top: -10,
    alignItems: 'center',
  },
});