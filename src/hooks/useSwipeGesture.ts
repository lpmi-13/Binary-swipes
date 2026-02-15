import { useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import type { SwipeDirection } from '../engine/gameLoop';

const MIN_SWIPE_DISTANCE = 60; // px
const MAX_VERTICAL_RATIO = 1.5; // horizontal must dominate

interface UseSwipeGestureOptions {
  onSwipe: (direction: SwipeDirection) => void;
  enabled?: boolean;
}

export function useSwipeGesture({ onSwipe, enabled = true }: UseSwipeGestureOptions) {
  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (enabled) onSwipe(direction);
    },
    [onSwipe, enabled],
  );

  const gesture = Gesture.Pan()
    .minDistance(MIN_SWIPE_DISTANCE)
    .onEnd((event) => {
      'worklet';
      const { translationX, translationY } = event;
      const absX = Math.abs(translationX);
      const absY = Math.abs(translationY);

      // Only process predominantly horizontal swipes
      if (absX < MIN_SWIPE_DISTANCE) return;
      if (absY > absX * MAX_VERTICAL_RATIO) return;

      if (translationX < 0) {
        runOnJS(handleSwipe)('left');
      } else {
        runOnJS(handleSwipe)('right');
      }
    });

  return gesture;
}
