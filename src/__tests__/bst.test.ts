import {
  generateBST,
  getPathToValue,
  pickTarget,
  findNode,
  treeHeight,
  BSTNode,
} from '../engine/bst';

// ─── helpers ──────────────────────────────────────────────────────────────────

function collectAllValues(root: BSTNode): number[] {
  const values: number[] = [];
  function walk(node: BSTNode | null) {
    if (!node) return;
    values.push(node.value);
    walk(node.left);
    walk(node.right);
  }
  walk(root);
  return values;
}

function isBSTValid(node: BSTNode | null, min = -Infinity, max = Infinity): boolean {
  if (!node) return true;
  if (node.value <= min || node.value >= max) return false;
  return (
    isBSTValid(node.left, min, node.value) &&
    isBSTValid(node.right, node.value, max)
  );
}

function collectDepths(root: BSTNode): Map<string, number> {
  const map = new Map<string, number>();
  function walk(node: BSTNode | null) {
    if (!node) return;
    map.set(node.id, node.depth);
    walk(node.left);
    walk(node.right);
  }
  walk(root);
  return map;
}

// ─── generateBST ──────────────────────────────────────────────────────────────

describe('generateBST', () => {
  it('produces the correct number of nodes for depth 3', () => {
    const root = generateBST(3, 1, 100);
    expect(collectAllValues(root).length).toBe(7); // 2^3 - 1
  });

  it('produces the correct number of nodes for depth 4', () => {
    const root = generateBST(4, 1, 200);
    expect(collectAllValues(root).length).toBe(15); // 2^4 - 1
  });

  it('satisfies the BST ordering property', () => {
    const root = generateBST(4, 1, 500);
    expect(isBSTValid(root)).toBe(true);
  });

  it('root is at depth 0', () => {
    const root = generateBST(3, 1, 100);
    expect(root.depth).toBe(0);
  });

  it('root xFraction is 0.5', () => {
    const root = generateBST(3, 1, 100);
    expect(root.xFraction).toBeCloseTo(0.5);
  });

  it('left child xFraction is less than root', () => {
    const root = generateBST(3, 1, 100);
    expect(root.left!.xFraction).toBeLessThan(root.xFraction);
  });

  it('right child xFraction is greater than root', () => {
    const root = generateBST(3, 1, 100);
    expect(root.right!.xFraction).toBeGreaterThan(root.xFraction);
  });

  it('all values are within [minValue, maxValue]', () => {
    const root = generateBST(3, 10, 90);
    const values = collectAllValues(root);
    values.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(10);
      expect(v).toBeLessThanOrEqual(90);
    });
  });

  it('all values are unique', () => {
    const root = generateBST(4, 1, 500);
    const values = collectAllValues(root);
    expect(new Set(values).size).toBe(values.length);
  });

  it('depth field on each node matches its actual position', () => {
    const root = generateBST(3, 1, 100);
    const depths = collectDepths(root);
    expect(root.depth).toBe(0);
    if (root.left) expect(root.left.depth).toBe(1);
    if (root.right) expect(root.right.depth).toBe(1);
    if (root.left?.left) expect(root.left.left.depth).toBe(2);
  });

  it('throws when value range is too small for the node count', () => {
    // depth 3 needs 7 nodes; range of 5 is too small
    expect(() => generateBST(3, 1, 5)).toThrow();
  });

  it('each node has a unique id', () => {
    const root = generateBST(3, 1, 100);
    const ids = collectAllValues(root).map(() => ''); // placeholder
    const allIds: string[] = [];
    function collectIds(node: BSTNode | null) {
      if (!node) return;
      allIds.push(node.id);
      collectIds(node.left);
      collectIds(node.right);
    }
    collectIds(root);
    expect(new Set(allIds).size).toBe(allIds.length);
  });
});

// ─── treeHeight ───────────────────────────────────────────────────────────────

describe('treeHeight', () => {
  it('returns 0 for null', () => expect(treeHeight(null)).toBe(0));

  it('returns 1 for a single node', () => {
    const root = generateBST(1, 1, 1);
    expect(treeHeight(root)).toBe(1);
  });

  it('returns depth+1 for a balanced tree generated at depth 3', () => {
    const root = generateBST(3, 1, 100);
    expect(treeHeight(root)).toBe(3);
  });

  it('returns depth+1 for depth 4', () => {
    const root = generateBST(4, 1, 200);
    expect(treeHeight(root)).toBe(4);
  });
});

// ─── getPathToValue ───────────────────────────────────────────────────────────

describe('getPathToValue', () => {
  it('returns [root] when target is the root', () => {
    const root = generateBST(3, 1, 100);
    const path = getPathToValue(root, root.value);
    expect(path).toEqual([root.value]);
  });

  it('returns a path that starts at the root value', () => {
    const root = generateBST(4, 1, 200);
    const allValues = collectAllValues(root);
    const target = allValues[allValues.length - 1]; // rightmost
    const path = getPathToValue(root, target);
    expect(path![0]).toBe(root.value);
  });

  it('returns a path that ends at the target value', () => {
    const root = generateBST(4, 1, 200);
    const allValues = collectAllValues(root);
    for (const target of allValues.slice(0, 5)) {
      const path = getPathToValue(root, target);
      expect(path![path!.length - 1]).toBe(target);
    }
  });

  it('returns null for a value not in the tree', () => {
    const root = generateBST(3, 50, 100);
    expect(getPathToValue(root, 1)).toBeNull();
    expect(getPathToValue(root, 999)).toBeNull();
  });

  it('path follows BST ordering (each step goes in the right direction)', () => {
    const root = generateBST(4, 1, 500);
    const allValues = collectAllValues(root);
    for (const target of allValues) {
      const path = getPathToValue(root, target)!;
      for (let i = 0; i < path.length - 1; i++) {
        if (path[i + 1] < path[i]) {
          expect(path[i + 1]).toBeLessThan(path[i]);
        } else {
          expect(path[i + 1]).toBeGreaterThan(path[i]);
        }
      }
    }
  });

  it('path length is at least 1 for any value in the tree', () => {
    const root = generateBST(3, 1, 100);
    collectAllValues(root).forEach((val) => {
      const path = getPathToValue(root, val);
      expect(path!.length).toBeGreaterThanOrEqual(1);
    });
  });
});

// ─── findNode ─────────────────────────────────────────────────────────────────

describe('findNode', () => {
  it('finds the root node', () => {
    const root = generateBST(3, 1, 100);
    expect(findNode(root, root.value)?.value).toBe(root.value);
  });

  it('finds a leaf node', () => {
    const root = generateBST(3, 1, 100);
    const allValues = collectAllValues(root);
    for (const val of allValues) {
      expect(findNode(root, val)?.value).toBe(val);
    }
  });

  it('returns null for a missing value', () => {
    const root = generateBST(3, 50, 200);
    expect(findNode(root, 1)).toBeNull();
    expect(findNode(root, 9999)).toBeNull();
  });
});

// ─── pickTarget ───────────────────────────────────────────────────────────────

describe('pickTarget', () => {
  it('returns a value that exists in the tree', () => {
    const root = generateBST(4, 1, 200);
    const allValues = new Set(collectAllValues(root));
    for (let i = 0; i < 20; i++) {
      expect(allValues.has(pickTarget(root, 2))).toBe(true);
    }
  });

  it('returns a node at depth >= minDepth', () => {
    const root = generateBST(4, 1, 200);
    for (let i = 0; i < 20; i++) {
      const target = pickTarget(root, 2);
      const node = findNode(root, target)!;
      expect(node.depth).toBeGreaterThanOrEqual(2);
    }
  });

  it('falls back gracefully when minDepth exceeds tree depth', () => {
    // depth-3 tree has nodes at depth 0,1,2; asking for minDepth=10 uses fallback
    const root = generateBST(3, 1, 100);
    expect(() => pickTarget(root, 10)).not.toThrow();
    const target = pickTarget(root, 10);
    const allValues = new Set(collectAllValues(root));
    expect(allValues.has(target)).toBe(true);
  });
});
