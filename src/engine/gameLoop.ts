/**
 * Pure game state machine — no rendering or animation code.
 * The UI layer consumes these types and transitions.
 */

export type GamePhase =
  | 'IDLE'           // Before the game starts
  | 'COUNTDOWN'      // 3-2-1 countdown before level
  | 'APPROACHING'    // Node is zooming toward the player
  | 'AWAITING_SWIPE' // Node has arrived, waiting for player swipe
  | 'TRANSITIONING'  // Player swiped correctly; animating to next node
  | 'LEVEL_COMPLETE' // Player found the target
  | 'GAME_OVER';     // Player swiped wrong or timed out

export type SwipeDirection = 'left' | 'right';

export interface GameState {
  phase: GamePhase;
  level: number;
  score: number;
  /** Index into the current level's path (which node the player is at) */
  pathIndex: number;
  /** The sequence of values from root to target for this level */
  path: number[];
  /** The target number to find */
  target: number;
  /** Whether the last swipe was wrong (for visual feedback) */
  wasWrongSwipe: boolean;
  /** Whether the player timed out */
  wasTimeout: boolean;
}

export function initialGameState(): GameState {
  return {
    phase: 'IDLE',
    level: 1,
    score: 0,
    pathIndex: 0,
    path: [],
    target: 0,
    wasWrongSwipe: false,
    wasTimeout: false,
  };
}

/** Determine the correct swipe for the current node */
export function getCorrectSwipe(state: GameState): SwipeDirection | null {
  const current = state.path[state.pathIndex];
  const next = state.path[state.pathIndex + 1];
  if (current === undefined || next === undefined) return null;
  return next > current ? 'right' : 'left';
}

export interface SwipeResult {
  correct: boolean;
  nextState: GameState;
}

/**
 * Process a player swipe. Returns the new game state.
 * Call this from the gesture handler in the UI layer.
 */
export function processSwipe(
  state: GameState,
  direction: SwipeDirection,
): SwipeResult {
  if (
    state.phase !== 'AWAITING_SWIPE' &&
    state.phase !== 'APPROACHING'
  ) {
    return { correct: false, nextState: state };
  }

  const correct = getCorrectSwipe(state) === direction;

  if (!correct) {
    return {
      correct: false,
      nextState: {
        ...state,
        phase: 'GAME_OVER',
        wasWrongSwipe: true,
        wasTimeout: false,
      },
    };
  }

  const nextPathIndex = state.pathIndex + 1;
  const nextValue = state.path[nextPathIndex];

  // Reaching the target
  if (nextValue === state.target) {
    return {
      correct: true,
      nextState: {
        ...state,
        phase: 'LEVEL_COMPLETE',
        pathIndex: nextPathIndex,
        score: state.score + 1,
        wasWrongSwipe: false,
        wasTimeout: false,
      },
    };
  }

  return {
    correct: true,
    nextState: {
      ...state,
      phase: 'TRANSITIONING',
      pathIndex: nextPathIndex,
      score: state.score + 1,
      wasWrongSwipe: false,
      wasTimeout: false,
    },
  };
}

/** Called when the swipe timeout expires */
export function processTimeout(state: GameState): GameState {
  if (state.phase !== 'AWAITING_SWIPE') return state;
  return {
    ...state,
    phase: 'GAME_OVER',
    wasWrongSwipe: false,
    wasTimeout: true,
  };
}

/** Move from TRANSITIONING → APPROACHING for the next node */
export function advanceToNextNode(state: GameState): GameState {
  if (state.phase !== 'TRANSITIONING') return state;
  return { ...state, phase: 'APPROACHING' };
}

/** Node has arrived at swipe zone */
export function nodeArrived(state: GameState): GameState {
  if (state.phase !== 'APPROACHING') return state;
  return { ...state, phase: 'AWAITING_SWIPE' };
}

/** Start a new level */
export function startLevel(
  state: GameState,
  path: number[],
  target: number,
): GameState {
  return {
    ...state,
    phase: 'COUNTDOWN',
    pathIndex: 0,
    path,
    target,
    wasWrongSwipe: false,
    wasTimeout: false,
  };
}

/** Countdown finished — begin the first node approach */
export function countdownDone(state: GameState): GameState {
  if (state.phase !== 'COUNTDOWN') return state;
  return { ...state, phase: 'APPROACHING' };
}
