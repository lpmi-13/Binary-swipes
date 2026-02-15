import React from 'react';
import { Canvas, RoundedRect, Text, useFont, Group, Shadow } from '@shopify/react-native-skia';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { COLORS, LAYOUT } from '../constants/theme';

interface NodeSpriteProps {
  value: number;
  screenWidth: number;
  screenHeight: number;
  /** 0 = at horizon (tiny), 1 = at swipe zone (full size), >1 = zooming past */
  progress: SharedValue<number>;
  /** -1 = exiting left, 0 = centre, 1 = exiting right */
  exitX: SharedValue<number>;
  /** true when this is the wrong-swipe flash frame */
  isWrong?: boolean;
}

const FULL_NODE_WIDTH = 200;
const FULL_NODE_HEIGHT = 100;
const CORNER_RADIUS = 16;

export function NodeSprite({
  value,
  screenWidth,
  screenHeight,
  progress,
  exitX,
}: NodeSpriteProps) {
  // Interpolate size: small at horizon, full at swipe zone, overshoot past
  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const scale = interpolate(p, [0, 1, 1.3], [0.12, 1.0, 1.4], Extrapolation.CLAMP);
    const targetY = screenHeight * LAYOUT.swipeZoneY;
    const horizonY = screenHeight * LAYOUT.horizonY;
    const y = interpolate(p, [0, 1, 1.3], [horizonY, targetY, screenHeight * 1.1], Extrapolation.CLAMP);
    const centreX = screenWidth / 2;
    const exitOffset = exitX.value * screenWidth * 0.6;

    return {
      transform: [
        { translateX: centreX - (FULL_NODE_WIDTH * scale) / 2 + exitOffset },
        { translateY: y - (FULL_NODE_HEIGHT * scale) / 2 },
        { scale },
      ],
    };
  });

  const nodeWidth = FULL_NODE_WIDTH;
  const nodeHeight = FULL_NODE_HEIGHT;
  const fontSize = 38;
  const label = String(value);

  return (
    <Animated.View style={[styles.container, animatedStyle, { width: nodeWidth, height: nodeHeight }]}>
      <Canvas style={{ width: nodeWidth, height: nodeHeight }}>
        <Group>
          <RoundedRect
            x={4}
            y={4}
            width={nodeWidth - 8}
            height={nodeHeight - 8}
            r={CORNER_RADIUS}
            color={COLORS.nodeCurrent}
          >
            <Shadow dx={0} dy={4} blur={12} color="rgba(66,165,245,0.4)" />
          </RoundedRect>
          <RoundedRect
            x={4}
            y={4}
            width={nodeWidth - 8}
            height={nodeHeight - 8}
            r={CORNER_RADIUS}
            color={COLORS.nodeCurrentBorder}
            style="stroke"
            strokeWidth={2.5}
          />
          <NodeText value={label} nodeWidth={nodeWidth} nodeHeight={nodeHeight} fontSize={fontSize} />
        </Group>
      </Canvas>
    </Animated.View>
  );
}

function NodeText({
  value,
  nodeWidth,
  nodeHeight,
  fontSize,
}: {
  value: string;
  nodeWidth: number;
  nodeHeight: number;
  fontSize: number;
}) {
  // Without a loaded font, fall back to native Text via Animated.View
  // (Skia Text requires a loaded SkFont; we use a native overlay instead)
  return null;
}

// Overlay native text on top of the Canvas for the number
export function NodeNumber({
  value,
  nodeWidth,
  nodeHeight,
  fontSize,
}: {
  value: string;
  nodeWidth: number;
  nodeHeight: number;
  fontSize: number;
}) {
  const { StyleSheet } = require('react-native');
  const { Text: RNText, View } = require('react-native');
  return (
    <View
      style={{
        position: 'absolute',
        width: nodeWidth,
        height: nodeHeight,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      pointerEvents="none"
    >
      <RNText
        style={{
          color: COLORS.textPrimary,
          fontSize,
          fontWeight: '700',
          letterSpacing: 1,
        }}
      >
        {value}
      </RNText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});
