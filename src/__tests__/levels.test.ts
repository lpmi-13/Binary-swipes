import { createLevel } from '../engine/levels';
import { getPathToValue, findNode } from '../engine/bst';
import { getLevelConfig } from '../constants/difficulty';

describe('createLevel', () => {
  it('returns the correct level number', () => {
    expect(createLevel(1).level).toBe(1);
    expect(createLevel(5).level).toBe(5);
    expect(createLevel(10).level).toBe(10);
  });

  it('path starts at the root value', () => {
    for (let lvl = 1; lvl <= 5; lvl++) {
      const { root, path } = createLevel(lvl);
      expect(path[0]).toBe(root.value);
    }
  });

  it('path ends at the target value', () => {
    for (let lvl = 1; lvl <= 5; lvl++) {
      const { path, target } = createLevel(lvl);
      expect(path[path.length - 1]).toBe(target);
    }
  });

  it('path has at least 2 nodes (guarantees at least one swipe)', () => {
    for (let lvl = 1; lvl <= 10; lvl++) {
      expect(createLevel(lvl).path.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('target exists in the tree', () => {
    for (let lvl = 1; lvl <= 5; lvl++) {
      const { root, target } = createLevel(lvl);
      expect(findNode(root, target)).not.toBeNull();
    }
  });

  it('path matches the result of getPathToValue on the generated tree', () => {
    for (let lvl = 1; lvl <= 5; lvl++) {
      const { root, target, path } = createLevel(lvl);
      const expectedPath = getPathToValue(root, target);
      expect(path).toEqual(expectedPath);
    }
  });

  it('uses the correct treeDepth from level config', () => {
    for (let lvl = 1; lvl <= 10; lvl++) {
      const { treeDepth } = createLevel(lvl);
      expect(treeDepth).toBe(getLevelConfig(lvl).treeDepth);
    }
  });

  it('uses the correct approachDuration from level config', () => {
    for (let lvl = 1; lvl <= 10; lvl++) {
      const { approachDuration } = createLevel(lvl);
      expect(approachDuration).toBe(getLevelConfig(lvl).approachDuration);
    }
  });

  it('uses the correct swipeTimeoutMs from level config', () => {
    for (let lvl = 1; lvl <= 10; lvl++) {
      const { swipeTimeoutMs } = createLevel(lvl);
      expect(swipeTimeoutMs).toBe(getLevelConfig(lvl).swipeTimeoutMs);
    }
  });

  it('works for expert levels above 10', () => {
    const { level, path, treeDepth } = createLevel(15);
    expect(level).toBe(15);
    expect(path.length).toBeGreaterThanOrEqual(2);
    expect(treeDepth).toBe(6);
  });
});
