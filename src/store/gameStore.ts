import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GameState,
  GamePhase,
  SwipeDirection,
  initialGameState,
  processSwipe,
  processTimeout,
  advanceToNextNode,
  nodeArrived,
  startLevel,
  countdownDone,
} from '../engine/gameLoop';
import { createLevel, LevelData } from '../engine/levels';

interface GameStore extends GameState {
  currentLevel: LevelData | null;
  highScore: number;

  // Actions
  initLevel: (level: number) => void;
  onCountdownDone: () => void;
  onNodeArrived: () => void;
  onSwipe: (direction: SwipeDirection) => boolean;
  onTimeout: () => void;
  onTransitionDone: () => void;
  nextLevel: () => void;
  restartLevel: () => void;
  goToMenu: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialGameState(),
      currentLevel: null,
      highScore: 0,

      initLevel: (level: number) => {
        const levelData = createLevel(level);
        set((state) => ({
          ...startLevel(state, levelData.path, levelData.target),
          currentLevel: levelData,
          level,
        }));
      },

      onCountdownDone: () => {
        set((state) => countdownDone(state));
      },

      onNodeArrived: () => {
        set((state) => nodeArrived(state));
      },

      onSwipe: (direction: SwipeDirection) => {
        const state = get();
        const { correct, nextState } = processSwipe(state, direction);
        const newHighScore = Math.max(state.highScore, nextState.score);
        set({ ...nextState, highScore: newHighScore });
        return correct;
      },

      onTimeout: () => {
        set((state) => processTimeout(state));
      },

      onTransitionDone: () => {
        set((state) => advanceToNextNode(state));
      },

      nextLevel: () => {
        const { level } = get();
        const nextLvl = level + 1;
        const levelData = createLevel(nextLvl);
        set((state) => ({
          ...startLevel(state, levelData.path, levelData.target),
          currentLevel: levelData,
          level: nextLvl,
        }));
      },

      restartLevel: () => {
        const { level } = get();
        const levelData = createLevel(level);
        set((state) => ({
          ...startLevel(state, levelData.path, levelData.target),
          currentLevel: levelData,
          score: 0,
        }));
      },

      goToMenu: () => {
        set({ ...initialGameState(), currentLevel: null, highScore: get().highScore });
      },
    }),
    {
      name: 'binary-swipes-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ highScore: state.highScore }),
    },
  ),
);
