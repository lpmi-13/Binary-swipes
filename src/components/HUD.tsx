import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS, type Theme } from '../constants/theme';

interface HUDProps {
  target: number;
  level: number;
  score: number;
  highScore: number;
  theme: Theme;
}

export function HUD({ target, level, score, highScore, theme }: HUDProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 8, backgroundColor: theme.hudBackground },
      ]}
    >
      {/* Left: Level */}
      <View style={styles.pill}>
        <Text style={[styles.pillLabel, { color: theme.textMuted }]}>LVL</Text>
        <Text style={[styles.pillValue, { color: theme.textSecondary }]}>{level}</Text>
      </View>

      {/* Centre: Find target */}
      <View style={styles.targetContainer}>
        <Text style={[styles.findLabel, { color: theme.textMuted }]}>FIND</Text>
        <Text style={[styles.targetNumber, { color: theme.gold }]}>{target}</Text>
      </View>

      {/* Right: Score */}
      <View style={styles.pill}>
        <Text style={[styles.pillLabel, { color: theme.textMuted }]}>SCORE</Text>
        <Text style={[styles.pillValue, { color: theme.textSecondary }]}>{score}</Text>
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
  },
  pill: {
    alignItems: 'center',
    minWidth: 60,
  },
  pillLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  pillValue: {
    fontSize: FONTS.sizes.score,
    fontWeight: '700',
  },
  targetContainer: {
    alignItems: 'center',
  },
  findLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
  },
  targetNumber: {
    fontSize: FONTS.sizes.targetNumber,
    fontWeight: '900',
    letterSpacing: -1,
  },
});
