import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import type { ComposedGesture, GestureType } from 'react-native-gesture-handler';
import { LAYOUT, type Theme } from '../constants/theme';

interface SwipeZoneProps {
  gesture: ComposedGesture | GestureType;
  screenWidth: number;
  screenHeight: number;
  wrongFlash: SharedValue<number>;
  children?: React.ReactNode;
  theme: Theme;
}

export function SwipeZone({
  gesture,
  screenWidth,
  screenHeight,
  wrongFlash,
  theme,
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
            { backgroundColor: theme.swipeLeft },
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
        >
          <Text style={[styles.hintText, { color: theme.swipeLeft }]}>◀ LEFT</Text>
          <Text style={[styles.hintText, { color: theme.swipeRight }]}>RIGHT ▶</Text>
        </View>
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
  hintText: {
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
