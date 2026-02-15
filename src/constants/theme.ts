export const COLORS = {
  background: '#0a0a1a',
  backgroundGradientEnd: '#1a0a2e',
  nodeDefault: '#1e3a5f',
  nodeDefaultBorder: '#2a6db5',
  nodeCurrent: '#0d47a1',
  nodeCurrentBorder: '#42a5f5',
  nodeTarget: '#1a237e',
  nodeTargetBorder: '#7c4dff',
  nodeVisited: '#1a1a2e',
  nodeVisitedBorder: '#333355',
  nodeCorrect: '#1b5e20',
  nodeCorrectBorder: '#66bb6a',
  nodeWrong: '#b71c1c',
  nodeWrongBorder: '#ef5350',
  textPrimary: '#ffffff',
  textSecondary: '#90caf9',
  textMuted: '#546e7a',
  edgeLine: '#1e3a5f',
  edgeLineActive: '#42a5f5',
  hudBackground: 'rgba(0,0,0,0.7)',
  swipeLeft: '#ef5350',
  swipeRight: '#66bb6a',
  gold: '#ffd700',
  particle: '#42a5f5',
} as const;

export const FONTS = {
  regular: 'SpaceMono',
  sizes: {
    nodeNumber: 32,
    targetLabel: 16,
    targetNumber: 48,
    score: 20,
    level: 18,
    hud: 14,
  },
} as const;

export const LAYOUT = {
  nodeRadius: 52,
  nodeStartScale: 0.15,
  nodeEndScale: 1.0,
  horizonY: 0.18,       // fraction of screen height where nodes originate
  swipeZoneY: 0.72,     // fraction of screen height where node is largest
  swipeZoneHeight: 120,
  treeLineWidth: 2,
  activeTreeLineWidth: 3,
} as const;
