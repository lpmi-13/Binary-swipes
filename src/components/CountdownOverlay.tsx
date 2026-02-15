import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

interface CountdownOverlayProps {
  countdownValue: SharedValue<number>;
}

const LABELS = ['GO!', '1', '2', '3'];

export function CountdownOverlay({ countdownValue }: CountdownOverlayProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {LABELS.map((label, idx) => {
        const digit = 3 - idx; // 3, 2, 1, 0
        return (
          <CountdownDigit
            key={label}
            label={label}
            digit={digit}
            countdownValue={countdownValue}
          />
        );
      })}
    </View>
  );
}

function CountdownDigit({
  label,
  digit,
  countdownValue,
}: {
  label: string;
  digit: number;
  countdownValue: SharedValue<number>;
}) {
  const animStyle = useAnimatedStyle(() => {
    const diff = Math.abs(countdownValue.value - digit);
    const opacity = interpolate(diff, [0, 0.5, 1], [1, 0.3, 0], Extrapolation.CLAMP);
    const scale = interpolate(diff, [0, 0.5, 1], [1, 1.4, 2], Extrapolation.CLAMP);
    return { opacity, transform: [{ scale }] };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.centre, animStyle]}>
      <Animated.Text style={styles.text}>{label}</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  centre: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: COLORS.gold,
    fontSize: 96,
    fontWeight: '900',
    textShadowColor: 'rgba(255,215,0,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
});
