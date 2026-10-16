import { describe, expect, it } from 'vitest';
import { clamp, lerpRect, mix, range, sceneProgress, smooth, stepAt } from './math';

describe('math', () => {
  it('clamps', () => {
    expect(clamp(-1)).toBe(0);
    expect(clamp(2)).toBe(1);
    expect(clamp(5, 0, 3)).toBe(3);
  });
  it('mixes and smooths', () => {
    expect(mix(10, 20, 0.5)).toBe(15);
    expect(smooth(0)).toBe(0);
    expect(smooth(1)).toBe(1);
    expect(smooth(0.5)).toBe(0.5);
    expect(smooth(-3)).toBe(0);
    expect(smooth(9)).toBe(1);
  });
  it('maps a window to 0..1', () => {
    expect(range(0.1, 0.1, 0.8)).toBe(0);
    expect(range(0.9, 0.1, 0.8)).toBe(1);
    expect(range(0.5, 0.1, 0.8)).toBe(0.5);
  });
  it('gives scene progress from its box', () => {
    expect(sceneProgress(0, 2000, 1000)).toEqual({ progress: 0, body: 0, out: 0 });
    expect(sceneProgress(-500, 2000, 1000)).toEqual({ progress: 0.5, body: 0.5, out: 0 });
    expect(sceneProgress(-1000, 2000, 1000)).toEqual({ progress: 1, body: 1, out: 0 });
    expect(sceneProgress(300, 2000, 1000).progress).toBe(0);
    expect(sceneProgress(-5000, 2000, 1000).progress).toBe(1);
  });
  it('splits the travel into a body and a tail', () => {
    expect(sceneProgress(-300, 2000, 1000, 400)).toEqual({ progress: 0.3, body: 0.5, out: 0 });
    expect(sceneProgress(-600, 2000, 1000, 400)).toEqual({ progress: 0.6, body: 1, out: 0 });
    expect(sceneProgress(-800, 2000, 1000, 400)).toEqual({ progress: 0.8, body: 1, out: 0.5 });
    expect(sceneProgress(-1000, 2000, 1000, 400)).toEqual({ progress: 1, body: 1, out: 1 });
  });
  it('does not divide by zero when the scene is one viewport tall', () => {
    expect(sceneProgress(0, 1000, 1000)).toEqual({ progress: 0, body: 0, out: 0 });
    expect(sceneProgress(-1, 1000, 1000)).toEqual({ progress: 1, body: 1, out: 1 });
    expect(sceneProgress(-10, 1200, 1000, 500).body).toBeLessThanOrEqual(1);
  });
  it('finds the step and its local progress', () => {
    expect(stepAt(0, 5)).toEqual({ index: 0, local: 0 });
    expect(stepAt(0.5, 5)).toEqual({ index: 2, local: 0.5 });
    expect(stepAt(1, 5)).toEqual({ index: 4, local: 1 });
    expect(stepAt(0.999, 3).index).toBe(2);
  });
  it('interpolates rectangles', () => {
    expect(lerpRect({ x: 0, y: 0, w: 10, h: 2 }, { x: 100, y: 50, w: 30, h: 20 }, 0.5)).toEqual({
      x: 50,
      y: 25,
      w: 20,
      h: 11,
    });
  });
});
