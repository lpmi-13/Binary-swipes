import { useEffect, useRef, useCallback } from 'react';
import {
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
  cancelAnimation,
  withDelay,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../store/gameStore';
import type { SwipeDirection } from '../engine/gameLoop';

export interface GameAnimValues {
  /** 0 = at horizon, 1 = at swipe zone */
  nodeProgress: ReturnType<typeof useSharedValue<number>>;
  /** -1 = exiting left, 0 = centre, 1 = exiting right */
  nodeExitX: ReturnType<typeof useSharedValue<number>>;
  /** Opacity for wrong-swipe flash */
  wrongFlash: ReturnType<typeof useSharedValue<number>>;
  /** Countdown digit (3, 2, 1, 0=go) */
  countdownValue: ReturnType<typeof useSharedValue<number>>;
}

export function useGameEngine(): GameAnimValues {
  const {
    phase,
    currentLevel,
    onCountdownDone,
    onNodeArrived,
    onSwipe,
    onTimeout,
    onTransitionDone,
  } = useGameStore();

  const nodeProgress = useSharedValue(0);
  const nodeExitX = useSharedValue(0);
  const wrongFlash = useSharedValue(0);
  const countdownValue = useSharedValue(3);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSwipeTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startSwipeTimeout = useCallback(() => {
    clearSwipeTimeout();
    if (!currentLevel) return;
    timeoutRef.current = setTimeout(() => {
      onTimeout();
    }, currentLevel.swipeTimeoutMs);
  }, [currentLevel, clearSwipeTimeout, onTimeout]);

  // React to phase changes
  useEffect(() => {
    if (phase === 'COUNTDOWN') {
      countdownValue.value = 3;
      // Animate 3→2→1→0 then fire countdownDone
      const step = 900;
      countdownValue.value = withTiming(2, { duration: 100 });
      const t1 = setTimeout(() => {
        countdownValue.value = 2;
        countdownValue.value = withTiming(1, { duration: 100 });
      }, step);
      const t2 = setTimeout(() => {
        countdownValue.value = 1;
        countdownValue.value = withTiming(0, { duration: 100 });
      }, step * 2);
      const t3 = setTimeout(() => {
        onCountdownDone();
      }, step * 3);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    if (phase === 'APPROACHING') {
      nodeProgress.value = 0;
      nodeExitX.value = 0;
      const duration = currentLevel?.approachDuration ?? 1500;
      nodeProgress.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.quad),
      }, (finished) => {
        'worklet';
        if (finished) {
          runOnJS(onNodeArrived)();
        }
      });
    }

    if (phase === 'AWAITING_SWIPE') {
      startSwipeTimeout();
      return clearSwipeTimeout;
    }

    if (phase === 'TRANSITIONING') {
      clearSwipeTimeout();
      // Slide the node up/off screen briefly before advancing
      nodeProgress.value = withTiming(1.3, { duration: 250, easing: Easing.in(Easing.quad) }, (finished) => {
        'worklet';
        if (finished) {
          runOnJS(onTransitionDone)();
        }
      });
    }

    if (phase === 'GAME_OVER') {
      clearSwipeTimeout();
      cancelAnimation(nodeProgress);
      wrongFlash.value = 1;
      wrongFlash.value = withDelay(50, withTiming(0, { duration: 500 }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    if (phase === 'LEVEL_COMPLETE') {
      clearSwipeTimeout();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [phase]);

  // Handle swipe from gesture
  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      const correct = onSwipe(direction);
      if (correct) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        nodeExitX.value = withTiming(direction === 'left' ? -1 : 1, {
          duration: 200,
          easing: Easing.in(Easing.quad),
        });
      }
    },
    [onSwipe, nodeExitX],
  );

  // Expose handleSwipe for the gesture hook — attach it to store so SwipeZone can call it
  useEffect(() => {
    (useGameStore as any).getState()._handleSwipe = handleSwipe;
  }, [handleSwipe]);

  return { nodeProgress, nodeExitX, wrongFlash, countdownValue };
}
