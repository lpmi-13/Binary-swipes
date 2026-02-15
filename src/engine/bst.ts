import { randomInt } from '../utils/math';

export interface BSTNode {
  id: string;
  value: number;
  left: BSTNode | null;
  right: BSTNode | null;
  depth: number;
  /** Horizontal position within the tree: 0 = leftmost, 1 = rightmost */
  xFraction: number;
}

/**
 * Generate a balanced BST.
 *
 * Strategy: build a sorted array of `2^depth - 1` unique random integers,
 * then recursively split at the midpoint so every node's left subtree contains
 * only smaller values and every right subtree only larger values.
 */
export function generateBST(
  depth: number,
  minValue: number,
  maxValue: number,
): BSTNode {
  const nodeCount = Math.pow(2, depth) - 1;
  const range = maxValue - minValue + 1;

  if (range < nodeCount) {
    throw new Error(
      `Value range [${minValue},${maxValue}] too small for ${nodeCount} nodes`,
    );
  }

  // Generate nodeCount unique sorted values spread across the range
  const values = generateUniqueValues(nodeCount, minValue, maxValue);

  return buildFromSortedArray(values, 0, values.length - 1, 0, 0, 1);
}

function generateUniqueValues(
  count: number,
  min: number,
  max: number,
): number[] {
  const set = new Set<number>();
  // Ensure we don't loop forever on a too-small range
  const maxAttempts = count * 20;
  let attempts = 0;
  while (set.size < count && attempts < maxAttempts) {
    set.add(randomInt(min, max));
    attempts++;
  }
  if (set.size < count) {
    // Fallback: fill with evenly spaced values
    const step = Math.floor((max - min) / count);
    for (let i = 0; set.size < count; i++) {
      set.add(min + i * Math.max(step, 1));
    }
  }
  return Array.from(set).sort((a, b) => a - b).slice(0, count);
}

let nodeIdCounter = 0;
function nextId(): string {
  return `node_${++nodeIdCounter}`;
}

function buildFromSortedArray(
  values: number[],
  start: number,
  end: number,
  depth: number,
  xMin: number,
  xMax: number,
): BSTNode {
  const mid = Math.floor((start + end) / 2);
  const xFraction = (xMin + xMax) / 2;

  let left: BSTNode | null = null;
  let right: BSTNode | null = null;

  if (start <= mid - 1) {
    left = buildFromSortedArray(
      values, start, mid - 1, depth + 1, xMin, xFraction,
    );
  }
  if (mid + 1 <= end) {
    right = buildFromSortedArray(
      values, mid + 1, end, depth + 1, xFraction, xMax,
    );
  }

  return {
    id: nextId(),
    value: values[mid],
    left,
    right,
    depth,
    xFraction,
  };
}

/**
 * Find the path (list of values) from root to the target value.
 * Returns null if the target is not in the tree.
 */
export function getPathToValue(
  root: BSTNode,
  target: number,
): number[] | null {
  const path: number[] = [];

  function search(node: BSTNode | null): boolean {
    if (!node) return false;
    path.push(node.value);
    if (node.value === target) return true;
    if (target < node.value) {
      if (search(node.left)) return true;
    } else {
      if (search(node.right)) return true;
    }
    path.pop();
    return false;
  }

  return search(root) ? path : null;
}

/**
 * Pick a target node that is at least `minDepth` levels from the root,
 * ensuring the player makes at least that many swipes.
 */
export function pickTarget(root: BSTNode, minDepth: number = 2): number {
  const candidates: number[] = [];

  function collect(node: BSTNode | null): void {
    if (!node) return;
    if (node.depth >= minDepth) candidates.push(node.value);
    collect(node.left);
    collect(node.right);
  }

  collect(root);

  if (candidates.length === 0) {
    // Fallback: pick the deepest nodes at any depth
    let deepest: BSTNode[] = [];
    let maxDepth = 0;
    function findDeepest(node: BSTNode | null) {
      if (!node) return;
      if (node.depth > maxDepth) { maxDepth = node.depth; deepest = [node]; }
      else if (node.depth === maxDepth) deepest.push(node);
      findDeepest(node.left);
      findDeepest(node.right);
    }
    findDeepest(root);
    return deepest[randomInt(0, deepest.length - 1)].value;
  }

  return candidates[randomInt(0, candidates.length - 1)];
}

/**
 * Get a node by value from the tree.
 */
export function findNode(
  root: BSTNode,
  value: number,
): BSTNode | null {
  let current: BSTNode | null = root;
  while (current) {
    if (value === current.value) return current;
    current = value < current.value ? current.left : current.right;
  }
  return null;
}

/**
 * Calculate the total depth of the tree.
 */
export function treeHeight(node: BSTNode | null): number {
  if (!node) return 0;
  return 1 + Math.max(treeHeight(node.left), treeHeight(node.right));
}
