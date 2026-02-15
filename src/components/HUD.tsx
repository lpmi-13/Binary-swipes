import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../constants/theme';

interface HUDProps {
  target: number;
  level: number;
  score: number;
  highScore: number;
}

export function HUD({ target, level, score, highScore }: HUDProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Left: Level */}
      <View style={styles.pill}>
        <Text style={styles.pillLabel}>LVL</Text>
        <Text style={styles.pillValue}>{level}</Text>
      </View>

      {/* Centre: Find target */}
      <View style={styles.targetContainer}>
        <Text style={styles.findLabel}>FIND</Text>
        <Text style={styles.targetNumber}>{target}</Text>
      </View>

      {/* Right: Score */}
      <View style={styles.pill}>
        <Text style={styles.pillLabel}>SCORE</Text>
        <Text style={styles.pillValue}>{score}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: COLORS.hudBackground,
  },
  pill: {
    alignItems: 'center',
    minWidth: 60,
  },
  pillLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  pillValue: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.score,
    fontWeight: '700',
  },
  targetContainer: {
    alignItems: 'center',
  },
  findLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
  },
  targetNumber: {
    color: COLORS.gold,
    fontSize: FONTS.sizes.targetNumber,
    fontWeight: '900',
    letterSpacing: -1,
  },
});
