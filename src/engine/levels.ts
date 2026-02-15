import { getLevelConfig } from '../constants/difficulty';
import { generateBST, pickTarget, getPathToValue, BSTNode } from './bst';

export interface LevelData {
  level: number;
  root: BSTNode;
  target: number;
  /** Ordered list of values from root → target */
  path: number[];
  approachDuration: number;
  swipeTimeoutMs: number;
  treeDepth: number;
}

/**
 * Generate all data needed to play a level.
 */
export function createLevel(level: number): LevelData {
  const config = getLevelConfig(level);

  // Retry until we get a valid target path (extremely rare to fail)
  for (let attempt = 0; attempt < 10; attempt++) {
    const root = generateBST(config.treeDepth, config.minValue, config.maxValue);
    const target = pickTarget(root, 2);
    const path = getPathToValue(root, target);
    if (path && path.length >= 2) {
      return {
        level,
        root,
        target,
        path,
        approachDuration: config.approachDuration,
        swipeTimeoutMs: config.swipeTimeoutMs,
        treeDepth: config.treeDepth,
      };
    }
  }

  // Should never reach here
  throw new Error(`Failed to generate valid level after 10 attempts`);
}
