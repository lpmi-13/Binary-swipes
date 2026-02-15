import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import type { ComposedGesture, GestureType } from 'react-native-gesture-handler';
import { COLORS, LAYOUT } from '../constants/theme';

interface SwipeZoneProps {
  gesture: ComposedGesture | GestureType;
  screenWidth: number;
  screenHeight: number;
  wrongFlash: SharedValue<number>;
  children?: React.ReactNode;
}

export function SwipeZone({
  gesture,
  screenWidth,
  screenHeight,
  wrongFlash,
  children,
}: SwipeZoneProps) {
  const flashStyle = useAnimatedStyle(() => ({
    opacity: wrongFlash.value * 0.35,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={StyleSheet.absoluteFill}>
        {children}

        {/* Wrong-swipe red flash overlay */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: COLORS.swipeLeft },
            flashStyle,
          ]}
          pointerEvents="none"
        />

        {/* Swipe hint arrows at the bottom */}
        <View
          style={[
            styles.hintRow,
            {
              bottom: screenHeight * (1 - LAYOUT.swipeZoneY) - 20,
            },
          ]}
          pointerEvents="none"
        />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  hintRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
});
