import { lerp, clamp, mapRange, easeInOutCubic, easeOutQuart, randomInt } from '../utils/math';

describe('lerp', () => {
  it('returns a at t=0', () => expect(lerp(0, 10, 0)).toBe(0));
  it('returns b at t=1', () => expect(lerp(0, 10, 1)).toBe(10));
  it('returns midpoint at t=0.5', () => expect(lerp(0, 10, 0.5)).toBe(5));
  it('works with negative values', () => expect(lerp(-10, 10, 0.5)).toBe(0));
  it('extrapolates beyond t=1', () => expect(lerp(0, 10, 2)).toBe(20));
});

describe('clamp', () => {
  it('returns value when within range', () => expect(clamp(5, 0, 10)).toBe(5));
  it('clamps to min', () => expect(clamp(-5, 0, 10)).toBe(0));
  it('clamps to max', () => expect(clamp(15, 0, 10)).toBe(10));
  it('returns min when value equals min', () => expect(clamp(0, 0, 10)).toBe(0));
  it('returns max when value equals max', () => expect(clamp(10, 0, 10)).toBe(10));
});

describe('mapRange', () => {
  it('maps midpoint of input to midpoint of output', () => {
    expect(mapRange(5, 0, 10, 0, 100)).toBe(50);
  });
  it('maps inMin to outMin', () => {
    expect(mapRange(0, 0, 10, 50, 150)).toBe(50);
  });
  it('maps inMax to outMax', () => {
    expect(mapRange(10, 0, 10, 50, 150)).toBe(150);
  });
  it('clamps values below inMin to outMin', () => {
    expect(mapRange(-10, 0, 10, 0, 100)).toBe(0);
  });
  it('clamps values above inMax to outMax', () => {
    expect(mapRange(20, 0, 10, 0, 100)).toBe(100);
  });
  it('handles inverted output range', () => {
    expect(mapRange(5, 0, 10, 100, 0)).toBe(50);
  });
});

describe('easeInOutCubic', () => {
  it('returns 0 at t=0', () => expect(easeInOutCubic(0)).toBe(0));
  it('returns 1 at t=1', () => expect(easeInOutCubic(1)).toBe(1));
  it('returns 0.5 at t=0.5 (symmetric midpoint)', () => {
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5);
  });
  it('is slower at the start than linear', () => {
    expect(easeInOutCubic(0.1)).toBeLessThan(0.1);
  });
  it('is faster than linear in the middle', () => {
    expect(easeInOutCubic(0.5)).toBeGreaterThan(easeInOutCubic(0.25) * 2 - 0.01);
  });
});

describe('easeOutQuart', () => {
  it('returns 0 at t=0', () => expect(easeOutQuart(0)).toBe(0));
  it('returns 1 at t=1', () => expect(easeOutQuart(1)).toBe(1));
  it('is faster than linear near the start', () => {
    expect(easeOutQuart(0.5)).toBeGreaterThan(0.5);
  });
  it('approaches 1 quickly', () => {
    expect(easeOutQuart(0.9)).toBeGreaterThan(0.99);
  });
});

describe('randomInt', () => {
  it('always returns an integer', () => {
    for (let i = 0; i < 50; i++) {
      expect(Number.isInteger(randomInt(1, 100))).toBe(true);
    }
  });
  it('stays within [min, max] inclusive', () => {
    for (let i = 0; i < 100; i++) {
      const n = randomInt(5, 10);
      expect(n).toBeGreaterThanOrEqual(5);
      expect(n).toBeLessThanOrEqual(10);
    }
  });
  it('returns min when min === max', () => {
    expect(randomInt(7, 7)).toBe(7);
  });
  it('can produce both boundary values over many trials', () => {
    const results = new Set(Array.from({ length: 200 }, () => randomInt(1, 2)));
    expect(results.has(1)).toBe(true);
    expect(results.has(2)).toBe(true);
  });
});
