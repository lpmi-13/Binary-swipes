import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Canvas, LinearGradient, Rect, vec, Circle, Line } from '@shopify/react-native-skia';
import { useWindowDimensions } from 'react-native';
import { useGameStore } from '../src/store/gameStore';
import { COLORS } from '../src/constants/theme';

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const { highScore, initLevel } = useGameStore();

  const handleStart = () => {
    initLevel(1);
    router.push('/game');
  };

  return (
    <View style={styles.root}>
      {/* Animated background */}
      <Canvas style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={vec(width / 2, 0)}
            end={vec(width / 2, height)}
            colors={['#0a0a1a', '#1a0a2e']}
          />
        </Rect>

        {/* Decorative tree lines */}
        <Line p1={vec(width / 2, height * 0.15)} p2={vec(width * 0.25, height * 0.38)} color={COLORS.edgeLine} strokeWidth={1.5} opacity={0.5} />
        <Line p1={vec(width / 2, height * 0.15)} p2={vec(width * 0.75, height * 0.38)} color={COLORS.edgeLine} strokeWidth={1.5} opacity={0.5} />
        <Line p1={vec(width * 0.25, height * 0.38)} p2={vec(width * 0.12, height * 0.56)} color={COLORS.edgeLine} strokeWidth={1.5} opacity={0.35} />
        <Line p1={vec(width * 0.25, height * 0.38)} p2={vec(width * 0.38, height * 0.56)} color={COLORS.edgeLine} strokeWidth={1.5} opacity={0.35} />
        <Line p1={vec(width * 0.75, height * 0.38)} p2={vec(width * 0.62, height * 0.56)} color={COLORS.edgeLine} strokeWidth={1.5} opacity={0.35} />
        <Line p1={vec(width * 0.75, height * 0.38)} p2={vec(width * 0.88, height * 0.56)} color={COLORS.edgeLine} strokeWidth={1.5} opacity={0.35} />

        {/* Node circles */}
        <Circle cx={width / 2} cy={height * 0.15} r={18} color={COLORS.nodeCurrent} opacity={0.9} />
        <Circle cx={width / 2} cy={height * 0.15} r={18} color={COLORS.nodeCurrentBorder} style="stroke" strokeWidth={2} opacity={0.9} />
        <Circle cx={width * 0.25} cy={height * 0.38} r={14} color={COLORS.nodeDefault} opacity={0.7} />
        <Circle cx={width * 0.25} cy={height * 0.38} r={14} color={COLORS.nodeDefaultBorder} style="stroke" strokeWidth={1.5} opacity={0.7} />
        <Circle cx={width * 0.75} cy={height * 0.38} r={14} color={COLORS.nodeDefault} opacity={0.7} />
        <Circle cx={width * 0.75} cy={height * 0.38} r={14} color={COLORS.nodeDefaultBorder} style="stroke" strokeWidth={1.5} opacity={0.7} />
      </Canvas>

      <SafeAreaView style={styles.content}>
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.titleLine1}>BINARY</Text>
          <Text style={styles.titleLine2}>SWIPES</Text>
          <Text style={styles.subtitle}>Master binary search one swipe at a time</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>HOW TO PLAY</Text>
          <View style={styles.instructionRow}>
            <Text style={styles.instructionArrow}>◀</Text>
            <Text style={styles.instructionText}>Swipe LEFT to go lower</Text>
          </View>
          <View style={styles.instructionRow}>
            <Text style={styles.instructionArrow}>▶</Text>
            <Text style={styles.instructionText}>Swipe RIGHT to go higher</Text>
          </View>
          <Text style={styles.instructionNote}>
            Navigate the tree to find the target number before time runs out!
          </Text>
        </View>

        {/* High score */}
        {highScore > 0 && (
          <View style={styles.highScoreRow}>
            <Text style={styles.highScoreLabel}>BEST</Text>
            <Text style={styles.highScoreValue}>{highScore}</Text>
          </View>
        )}

        {/* Start button */}
        <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.8}>
          <Text style={styles.startButtonText}>START GAME</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  titleLine1: {
    color: COLORS.textSecondary,
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 8,
    lineHeight: 56,
  },
  titleLine2: {
    color: COLORS.gold,
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 8,
    lineHeight: 56,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    letterSpacing: 0.5,
    marginTop: 8,
    textAlign: 'center',
  },
  instructionsCard: {
    backgroundColor: 'rgba(30,58,95,0.4)',
    borderColor: COLORS.nodeDefaultBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    gap: 8,
  },
  instructionsTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionArrow: {
    color: COLORS.gold,
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  instructionText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  instructionNote: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  highScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  highScoreLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  highScoreValue: {
    color: COLORS.gold,
    fontSize: 28,
    fontWeight: '900',
  },
  startButton: {
    backgroundColor: COLORS.nodeCurrent,
    borderColor: COLORS.nodeCurrentBorder,
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 56,
    alignItems: 'center',
  },
  startButtonText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
  },
});
