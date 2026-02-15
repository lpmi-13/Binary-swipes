import { getLevelConfig } from '../constants/difficulty';

describe('getLevelConfig', () => {
  it('returns level 1 config for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.level).toBe(1);
    expect(config.treeDepth).toBe(3);
    expect(config.approachDuration).toBe(2200);
  });

  it('returns level 10 config for level 10', () => {
    const config = getLevelConfig(10);
    expect(config.level).toBe(10);
    expect(config.treeDepth).toBe(6);
    expect(config.approachDuration).toBe(590);
  });

  it('clamps level 0 to level 1', () => {
    const config = getLevelConfig(0);
    expect(config.level).toBe(1);
    expect(config.treeDepth).toBe(3);
  });

  it('clamps negative levels to level 1', () => {
    const config = getLevelConfig(-5);
    expect(config.level).toBe(1);
  });

  it('returns expert config for levels above 10', () => {
    const config = getLevelConfig(11);
    expect(config.level).toBe(11);
    expect(config.treeDepth).toBe(6);
    expect(config.approachDuration).toBe(550);
  });

  it('preserves the correct level number for expert levels', () => {
    expect(getLevelConfig(25).level).toBe(25);
    expect(getLevelConfig(100).level).toBe(100);
  });

  it('each table entry has a correct level field matching its index', () => {
    for (let lvl = 1; lvl <= 10; lvl++) {
      expect(getLevelConfig(lvl).level).toBe(lvl);
    }
  });

  it('speed increases with level (approachDuration decreases)', () => {
    for (let lvl = 1; lvl < 10; lvl++) {
      expect(getLevelConfig(lvl).approachDuration).toBeGreaterThan(
        getLevelConfig(lvl + 1).approachDuration,
      );
    }
  });

  it('swipeTimeoutMs is always greater than approachDuration', () => {
    for (let lvl = 1; lvl <= 10; lvl++) {
      const config = getLevelConfig(lvl);
      expect(config.swipeTimeoutMs).toBeGreaterThan(config.approachDuration);
    }
  });

  it('value range is always large enough to fit the tree', () => {
    for (let lvl = 1; lvl <= 10; lvl++) {
      const config = getLevelConfig(lvl);
      const nodeCount = Math.pow(2, config.treeDepth) - 1;
      const range = config.maxValue - config.minValue + 1;
      expect(range).toBeGreaterThanOrEqual(nodeCount);
    }
  });
});
