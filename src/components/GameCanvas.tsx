import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Canvas, LinearGradient, Rect, vec } from '@shopify/react-native-skia';
import { useGameStore } from '../store/gameStore';
import { useGameEngine } from '../hooks/useGameEngine';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { TreeBackground } from './TreeBackground';
import { NodeSprite, NodeNumber } from './NodeSprite';
import { SwipeZone } from './SwipeZone';
import { HUD } from './HUD';
import { CountdownOverlay } from './CountdownOverlay';
import { COLORS } from '../constants/theme';
import type { SwipeDirection } from '../engine/gameLoop';

const FULL_NODE_WIDTH = 200;
const FULL_NODE_HEIGHT = 100;

export function GameCanvas() {
  const { width, height } = useWindowDimensions();

  const {
    phase,
    path,
    pathIndex,
    target,
    level,
    score,
    highScore,
    currentLevel,
  } = useGameStore();

  const { nodeProgress, nodeExitX, wrongFlash, countdownValue } =
    useGameEngine();

  const handleSwipe = (direction: SwipeDirection) => {
    const fn = (useGameStore as any).getState()._handleSwipe;
    if (fn) fn(direction);
  };

  const gesture = useSwipeGesture({
    onSwipe: handleSwipe,
    enabled:
      phase === 'APPROACHING' ||
      phase === 'AWAITING_SWIPE',
  });

  const currentValue = path[pathIndex] ?? 0;

  const visitedValues = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < pathIndex; i++) set.add(path[i]);
    return set;
  }, [path, pathIndex]);

  const showCountdown = phase === 'COUNTDOWN';
  const showNode =
    phase === 'APPROACHING' ||
    phase === 'AWAITING_SWIPE' ||
    phase === 'TRANSITIONING';

  return (
    <View style={styles.root}>
      {/* Background gradient */}
      <Canvas style={{ position: 'absolute', top: 0, left: 0, width, height }}>
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={vec(width / 2, 0)}
            end={vec(width / 2, height)}
            colors={[COLORS.background, COLORS.backgroundGradientEnd]}
          />
        </Rect>
      </Canvas>

      {/* Binary tree background */}
      {currentLevel && (
        <TreeBackground
          width={width}
          height={height}
          root={currentLevel.root}
          currentValue={currentValue}
          visitedValues={visitedValues}
          targetValue={target}
        />
      )}

      {/* HUD */}
      <HUD
        target={target}
        level={level}
        score={score}
        highScore={highScore}
      />

      {/* Swipe zone + approaching node */}
      <SwipeZone
        gesture={gesture}
        screenWidth={width}
        screenHeight={height}
        wrongFlash={wrongFlash}
      >
        {showNode && (
          <>
            <NodeSprite
              value={currentValue}
              screenWidth={width}
              screenHeight={height}
              progress={nodeProgress}
              exitX={nodeExitX}
            />
            <NodeNumber
              value={String(currentValue)}
              nodeWidth={FULL_NODE_WIDTH}
              nodeHeight={FULL_NODE_HEIGHT}
              fontSize={38}
            />
          </>
        )}
      </SwipeZone>

      {/* Countdown 3-2-1 */}
      {showCountdown && (
        <CountdownOverlay countdownValue={countdownValue} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
