import React, { useMemo } from 'react';
import { Canvas, Path, Skia, Group, Paint } from '@shopify/react-native-skia';
import type { BSTNode } from '../engine/bst';
import { COLORS, LAYOUT } from '../constants/theme';

interface NodePosition {
  x: number;
  y: number;
  value: number;
  id: string;
}

interface TreeBackgroundProps {
  width: number;
  height: number;
  root: BSTNode | null;
  /** Value of the current node the player is at */
  currentValue: number;
  /** Path already traversed (visited node values) */
  visitedValues: Set<number>;
  /** The target value */
  targetValue: number;
}

/**
 * Draws the binary tree as a perspective "highway" in the background.
 * The tree is centred horizontally. Upper nodes appear smaller (farther away).
 */
export function TreeBackground({
  width,
  height,
  root,
  currentValue,
  visitedValues,
  targetValue,
}: TreeBackgroundProps) {
  const { positions, edgePath } = useMemo(() => {
    if (!root) return { positions: [], edgePath: '' };

    const treeTop = height * LAYOUT.horizonY;
    const treeBottom = height * (LAYOUT.swipeZoneY - 0.05);
    const treeHeight = treeBottom - treeTop;

    // Compute max depth
    let maxDepth = 0;
    const walk = (n: BSTNode | null) => {
      if (!n) return;
      if (n.depth > maxDepth) maxDepth = n.depth;
      walk(n.left);
      walk(n.right);
    };
    walk(root);

    const PADDING = width * 0.08;
    const usableWidth = width - PADDING * 2;

    const getPos = (node: BSTNode): { x: number; y: number } => {
      // Scale y: depth 0 is at treeTop, maxDepth at treeBottom
      const yFraction = maxDepth > 0 ? node.depth / maxDepth : 0;
      const y = treeTop + yFraction * treeHeight;
      const x = PADDING + node.xFraction * usableWidth;
      return { x, y };
    };

    const posMap = new Map<string, { x: number; y: number }>();
    const allPositions: NodePosition[] = [];
    const edgeParts: string[] = [];

    const collectPositions = (node: BSTNode | null) => {
      if (!node) return;
      const pos = getPos(node);
      posMap.set(node.id, pos);
      allPositions.push({ x: pos.x, y: pos.y, value: node.value, id: node.id });
      collectPositions(node.left);
      collectPositions(node.right);
    };

    const collectEdges = (node: BSTNode | null) => {
      if (!node) return;
      const from = posMap.get(node.id);
      if (!from) return;
      if (node.left) {
        const to = posMap.get(node.left.id);
        if (to) {
          edgeParts.push(`M ${from.x} ${from.y} L ${to.x} ${to.y}`);
        }
        collectEdges(node.left);
      }
      if (node.right) {
        const to = posMap.get(node.right.id);
        if (to) {
          edgeParts.push(`M ${from.x} ${from.y} L ${to.x} ${to.y}`);
        }
        collectEdges(node.right);
      }
    };

    collectPositions(root);
    collectEdges(root);

    return { positions: allPositions, edgePath: edgeParts.join(' ') };
  }, [root, width, height]);

  if (!root) return null;

  const paint = Skia.Paint();
  paint.setColor(Skia.Color(COLORS.edgeLine));
  paint.setStrokeWidth(LAYOUT.treeLineWidth);
  paint.setStyle(1); // Stroke

  const path = Skia.Path.MakeFromSVGString(edgePath || 'M 0 0');

  return (
    <Canvas style={{ position: 'absolute', top: 0, left: 0, width, height }}>
      <Group>
        {/* Edge lines */}
        {path && (
          <Path
            path={path}
            color={COLORS.edgeLine}
            style="stroke"
            strokeWidth={LAYOUT.treeLineWidth}
            opacity={0.6}
          />
        )}

        {/* Node circles */}
        {positions.map((pos) => {
          const isCurrent = pos.value === currentValue;
          const isTarget = pos.value === targetValue;
          const isVisited = visitedValues.has(pos.value);

          let fillColor: string = COLORS.nodeVisited;
          let borderColor: string = COLORS.nodeVisitedBorder;
          let r = 10;
          let opacity = 0.4;

          if (isCurrent) {
            fillColor = COLORS.nodeCurrent;
            borderColor = COLORS.nodeCurrentBorder;
            r = 14;
            opacity = 1.0;
          } else if (isTarget) {
            fillColor = COLORS.nodeTarget;
            borderColor = COLORS.nodeTargetBorder;
            r = 12;
            opacity = 0.9;
          } else if (!isVisited) {
            fillColor = COLORS.nodeDefault;
            borderColor = COLORS.nodeDefaultBorder;
            r = 10;
            opacity = 0.7;
          }

          return (
            <React.Fragment key={pos.id}>
              <Circle cx={pos.x} cy={pos.y} r={r} color={fillColor} opacity={opacity} />
              <Circle
                cx={pos.x}
                cy={pos.y}
                r={r}
                color={borderColor}
                style="stroke"
                strokeWidth={1.5}
                opacity={opacity}
              />
            </React.Fragment>
          );
        })}
      </Group>
    </Canvas>
  );
}

// Inline Circle component for Skia
function Circle({
  cx, cy, r, color, style, strokeWidth, opacity,
}: {
  cx: number; cy: number; r: number; color: string;
  style?: 'fill' | 'stroke'; strokeWidth?: number; opacity?: number;
}) {
  const path = Skia.Path.Make();
  path.addCircle(cx, cy, r);
  return (
    <Path
      path={path}
      color={color}
      style={style === 'stroke' ? 'stroke' : 'fill'}
      strokeWidth={strokeWidth}
      opacity={opacity ?? 1}
    />
  );
}
