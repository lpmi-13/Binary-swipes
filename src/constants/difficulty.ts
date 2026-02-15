export interface LevelConfig {
  level: number;
  treeDepth: number;
  minValue: number;
  maxValue: number;
  /** milliseconds for a node to travel from horizon to swipe zone */
  approachDuration: number;
  /** extra time after the node is fully visible before timeout */
  swipeTimeoutMs: number;
}

const LEVELS: LevelConfig[] = [
  { level: 1,  treeDepth: 3, minValue: 1,  maxValue: 100,  approachDuration: 2200, swipeTimeoutMs: 3000 },
  { level: 2,  treeDepth: 3, minValue: 1,  maxValue: 100,  approachDuration: 1900, swipeTimeoutMs: 2700 },
  { level: 3,  treeDepth: 3, minValue: 1,  maxValue: 100,  approachDuration: 1600, swipeTimeoutMs: 2400 },
  { level: 4,  treeDepth: 4, minValue: 1,  maxValue: 200,  approachDuration: 1400, swipeTimeoutMs: 2200 },
  { level: 5,  treeDepth: 4, minValue: 1,  maxValue: 200,  approachDuration: 1200, swipeTimeoutMs: 2000 },
  { level: 6,  treeDepth: 4, minValue: 1,  maxValue: 200,  approachDuration: 1050, swipeTimeoutMs: 1800 },
  { level: 7,  treeDepth: 5, minValue: 1,  maxValue: 500,  approachDuration: 900,  swipeTimeoutMs: 1600 },
  { level: 8,  treeDepth: 5, minValue: 1,  maxValue: 500,  approachDuration: 780,  swipeTimeoutMs: 1400 },
  { level: 9,  treeDepth: 5, minValue: 1,  maxValue: 500,  approachDuration: 680,  swipeTimeoutMs: 1300 },
  { level: 10, treeDepth: 6, minValue: 1,  maxValue: 1000, approachDuration: 590,  swipeTimeoutMs: 1200 },
];

const EXPERT_CONFIG: Omit<LevelConfig, 'level'> = {
  treeDepth: 6,
  minValue: 1,
  maxValue: 1000,
  approachDuration: 550,
  swipeTimeoutMs: 1100,
};

export function getLevelConfig(level: number): LevelConfig {
  if (level <= 0) return { ...LEVELS[0], level: 1 };
  if (level <= LEVELS.length) return LEVELS[level - 1];
  return { ...EXPERT_CONFIG, level };
}
