import {
  initialGameState,
  getCorrectSwipe,
  processSwipe,
  processTimeout,
  advanceToNextNode,
  nodeArrived,
  startLevel,
  countdownDone,
  GameState,
} from '../engine/gameLoop';

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Build a mid-game state at a given path index */
function stateAt(
  pathIndex: number,
  phase: GameState['phase'] = 'AWAITING_SWIPE',
  extraPath: number[] = [50, 75, 62],
): GameState {
  return {
    ...initialGameState(),
    phase,
    path: extraPath,
    target: extraPath[extraPath.length - 1],
    pathIndex,
    score: 0,
  };
}

// ─── initialGameState ─────────────────────────────────────────────────────────

describe('initialGameState', () => {
  it('starts in IDLE phase', () => {
    expect(initialGameState().phase).toBe('IDLE');
  });
  it('starts at level 1', () => {
    expect(initialGameState().level).toBe(1);
  });
  it('starts with score 0', () => {
    expect(initialGameState().score).toBe(0);
  });
  it('starts with an empty path', () => {
    expect(initialGameState().path).toEqual([]);
  });
  it('has no wrong-swipe or timeout flags set', () => {
    const s = initialGameState();
    expect(s.wasWrongSwipe).toBe(false);
    expect(s.wasTimeout).toBe(false);
  });
});

// ─── getCorrectSwipe ──────────────────────────────────────────────────────────

describe('getCorrectSwipe', () => {
  it('returns right when next value is higher', () => {
    const state = stateAt(0, 'AWAITING_SWIPE', [50, 75, 62]);
    expect(getCorrectSwipe(state)).toBe('right');
  });

  it('returns left when next value is lower', () => {
    const state = stateAt(1, 'AWAITING_SWIPE', [50, 75, 62]);
    expect(getCorrectSwipe(state)).toBe('left');
  });

  it('returns null when at the last node in the path', () => {
    const state = stateAt(2, 'AWAITING_SWIPE', [50, 75, 62]);
    expect(getCorrectSwipe(state)).toBeNull();
  });

  it('returns null when path is empty', () => {
    expect(getCorrectSwipe(initialGameState())).toBeNull();
  });
});

// ─── processSwipe ─────────────────────────────────────────────────────────────

describe('processSwipe — correct swipe mid-path', () => {
  // path [50, 75, 90], target=90 — at index 0, correct swipe is right
  const path = [50, 75, 90];

  it('transitions to TRANSITIONING on a correct mid-path swipe', () => {
    const state = stateAt(0, 'AWAITING_SWIPE', path);
    const { correct, nextState } = processSwipe(state, 'right');
    expect(correct).toBe(true);
    expect(nextState.phase).toBe('TRANSITIONING');
  });

  it('increments pathIndex on correct swipe', () => {
    const state = stateAt(0, 'AWAITING_SWIPE', path);
    const { nextState } = processSwipe(state, 'right');
    expect(nextState.pathIndex).toBe(1);
  });

  it('increments score on correct swipe', () => {
    const state = stateAt(0, 'AWAITING_SWIPE', path);
    const { nextState } = processSwipe(state, 'right');
    expect(nextState.score).toBe(1);
  });

  it('clears wasWrongSwipe flag on correct swipe', () => {
    const state = { ...stateAt(0, 'AWAITING_SWIPE', path), wasWrongSwipe: true };
    const { nextState } = processSwipe(state, 'right');
    expect(nextState.wasWrongSwipe).toBe(false);
  });
});

describe('processSwipe — reaching the target', () => {
  // path [50, 75, 90], target=90 — at index 1, correct swipe is right → lands on target
  const path = [50, 75, 90];

  it('transitions to LEVEL_COMPLETE when landing on the target', () => {
    const state = stateAt(1, 'AWAITING_SWIPE', path);
    const { correct, nextState } = processSwipe(state, 'right');
    expect(correct).toBe(true);
    expect(nextState.phase).toBe('LEVEL_COMPLETE');
  });

  it('advances pathIndex to the target index', () => {
    const state = stateAt(1, 'AWAITING_SWIPE', path);
    const { nextState } = processSwipe(state, 'right');
    expect(nextState.pathIndex).toBe(2);
  });

  it('increments score on reaching the target', () => {
    const state = stateAt(1, 'AWAITING_SWIPE', path);
    const { nextState } = processSwipe(state, 'right');
    expect(nextState.score).toBe(1);
  });
});

describe('processSwipe — wrong swipe', () => {
  const path = [50, 75, 90];

  it('transitions to GAME_OVER on wrong swipe', () => {
    const state = stateAt(0, 'AWAITING_SWIPE', path);
    const { correct, nextState } = processSwipe(state, 'left'); // correct is right
    expect(correct).toBe(false);
    expect(nextState.phase).toBe('GAME_OVER');
  });

  it('sets wasWrongSwipe on wrong swipe', () => {
    const state = stateAt(0, 'AWAITING_SWIPE', path);
    const { nextState } = processSwipe(state, 'left');
    expect(nextState.wasWrongSwipe).toBe(true);
  });

  it('does not increment score on wrong swipe', () => {
    const state = stateAt(0, 'AWAITING_SWIPE', path);
    const { nextState } = processSwipe(state, 'left');
    expect(nextState.score).toBe(0);
  });
});

describe('processSwipe — accepts swipe while APPROACHING', () => {
  it('processes a swipe in APPROACHING phase', () => {
    const path = [50, 75, 90];
    const state = stateAt(0, 'APPROACHING', path);
    const { correct } = processSwipe(state, 'right');
    expect(correct).toBe(true);
  });
});

describe('processSwipe — no-op in wrong phases', () => {
  const path = [50, 75, 90];

  it.each(['IDLE', 'COUNTDOWN', 'TRANSITIONING', 'LEVEL_COMPLETE', 'GAME_OVER'] as const)(
    'returns correct=false and unchanged state in %s phase',
    (phase) => {
      const state = stateAt(0, phase, path);
      const { correct, nextState } = processSwipe(state, 'right');
      expect(correct).toBe(false);
      expect(nextState).toBe(state); // same reference
    },
  );
});

// ─── processTimeout ───────────────────────────────────────────────────────────

describe('processTimeout', () => {
  it('transitions AWAITING_SWIPE → GAME_OVER', () => {
    const state = stateAt(0, 'AWAITING_SWIPE');
    expect(processTimeout(state).phase).toBe('GAME_OVER');
  });

  it('sets wasTimeout flag', () => {
    const state = stateAt(0, 'AWAITING_SWIPE');
    expect(processTimeout(state).wasTimeout).toBe(true);
  });

  it('does not set wasWrongSwipe', () => {
    const state = stateAt(0, 'AWAITING_SWIPE');
    expect(processTimeout(state).wasWrongSwipe).toBe(false);
  });

  it.each(['IDLE', 'COUNTDOWN', 'APPROACHING', 'TRANSITIONING', 'LEVEL_COMPLETE', 'GAME_OVER'] as const)(
    'is a no-op in %s phase',
    (phase) => {
      const state = stateAt(0, phase);
      expect(processTimeout(state)).toBe(state);
    },
  );
});

// ─── nodeArrived ──────────────────────────────────────────────────────────────

describe('nodeArrived', () => {
  it('transitions APPROACHING → AWAITING_SWIPE', () => {
    const state = stateAt(0, 'APPROACHING');
    expect(nodeArrived(state).phase).toBe('AWAITING_SWIPE');
  });

  it.each(['IDLE', 'COUNTDOWN', 'AWAITING_SWIPE', 'TRANSITIONING', 'LEVEL_COMPLETE', 'GAME_OVER'] as const)(
    'is a no-op in %s phase',
    (phase) => {
      const state = stateAt(0, phase);
      expect(nodeArrived(state)).toBe(state);
    },
  );
});

// ─── advanceToNextNode ────────────────────────────────────────────────────────

describe('advanceToNextNode', () => {
  it('transitions TRANSITIONING → APPROACHING', () => {
    const state = stateAt(0, 'TRANSITIONING');
    expect(advanceToNextNode(state).phase).toBe('APPROACHING');
  });

  it.each(['IDLE', 'COUNTDOWN', 'APPROACHING', 'AWAITING_SWIPE', 'LEVEL_COMPLETE', 'GAME_OVER'] as const)(
    'is a no-op in %s phase',
    (phase) => {
      const state = stateAt(0, phase);
      expect(advanceToNextNode(state)).toBe(state);
    },
  );
});

// ─── startLevel ───────────────────────────────────────────────────────────────

describe('startLevel', () => {
  it('sets phase to COUNTDOWN', () => {
    const state = initialGameState();
    expect(startLevel(state, [50, 75, 90], 90).phase).toBe('COUNTDOWN');
  });

  it('resets pathIndex to 0', () => {
    const state = { ...stateAt(2), pathIndex: 2 };
    expect(startLevel(state, [50, 75, 90], 90).pathIndex).toBe(0);
  });

  it('stores the provided path', () => {
    const state = initialGameState();
    const path = [50, 75, 90];
    expect(startLevel(state, path, 90).path).toEqual(path);
  });

  it('stores the provided target', () => {
    const state = initialGameState();
    expect(startLevel(state, [50, 75, 90], 90).target).toBe(90);
  });

  it('clears wasWrongSwipe and wasTimeout', () => {
    const state = { ...stateAt(0), wasWrongSwipe: true, wasTimeout: true };
    const next = startLevel(state, [50, 75], 75);
    expect(next.wasWrongSwipe).toBe(false);
    expect(next.wasTimeout).toBe(false);
  });

  it('preserves score across levels', () => {
    const state = { ...initialGameState(), score: 5 };
    expect(startLevel(state, [50, 75], 75).score).toBe(5);
  });
});

// ─── countdownDone ────────────────────────────────────────────────────────────

describe('countdownDone', () => {
  it('transitions COUNTDOWN → APPROACHING', () => {
    const state = startLevel(initialGameState(), [50, 75, 90], 90);
    expect(countdownDone(state).phase).toBe('APPROACHING');
  });

  it.each(['IDLE', 'APPROACHING', 'AWAITING_SWIPE', 'TRANSITIONING', 'LEVEL_COMPLETE', 'GAME_OVER'] as const)(
    'is a no-op in %s phase',
    (phase) => {
      const state = stateAt(0, phase);
      expect(countdownDone(state)).toBe(state);
    },
  );
});
