import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useGameStore } from '../src/store/gameStore';
import { GameCanvas } from '../src/components/GameCanvas';

export default function GameScreen() {
  const router = useRouter();
  const { phase } = useGameStore();

  useEffect(() => {
    if (phase === 'GAME_OVER' || phase === 'LEVEL_COMPLETE') {
      // Small delay so the player sees the outcome before navigating
      const timer = setTimeout(() => {
        router.replace('/results');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [phase, router]);

  return <GameCanvas />;
}
