import { describe, expect, it } from 'vitest';
import {
  clamp,
  currentFirst,
  lerpRect,
  loopAt,
  mix,
  range,
  sceneProgress,
  smooth,
  stepAt,
  stepDraw,
} from './math';

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
  it('reaches the end of the tail even when the tail fills the whole travel', () => {
    expect(sceneProgress(-400, 1400, 1000, 500)).toEqual({ progress: 1, body: 1, out: 1 });
    expect(sceneProgress(-200, 1400, 1000, 400).out).toBe(0.5);
    expect(sceneProgress(-200, 1400, 1000, 400).body).toBe(1);
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
  it('puts the current item first and keeps the others in order', () => {
    expect(currentFirst(5, 0)).toEqual([0, 1, 2, 3, 4]);
    expect(currentFirst(5, 3)).toEqual([3, 0, 1, 2, 4]);
  });
  it('draws each step over the first 62% of its share of the body', () => {
    expect(stepDraw(0, 0, 5)).toBe(0);
    expect(stepDraw(0.124, 0, 5)).toBeCloseTo(1, 5);
    expect(stepDraw(0.5, 2, 5)).toBeCloseTo(smooth(0.5 / 0.62), 5);
    expect(stepDraw(0.5, 3, 5)).toBe(0);
    expect(stepDraw(1, 4, 5)).toBe(1);
  });
  it('interpolates rectangles', () => {
    expect(lerpRect({ x: 0, y: 0, w: 10, h: 2 }, { x: 100, y: 50, w: 30, h: 20 }, 0.5)).toEqual({
      x: 50,
      y: 25,
      w: 20,
      h: 11,
    });
  });
  it('moves the A-to-Z loop one station per 2.3 s, travelling in the first half', () => {
    // the first stage: the dot arrives from the last station, so the arc is still empty
    expect(loopAt(0, 7)).toEqual({ index: 0, sweep: -1 / 7 });
    expect(loopAt(0.575, 7).index).toBe(0);
    expect(loopAt(0.575, 7).sweep).toBeCloseTo(-0.5 / 7, 5);
    expect(loopAt(1.15, 7)).toEqual({ index: 0, sweep: 0 });
    // the second stage: travel to the second station, then rest there
    expect(loopAt(2.3, 7).index).toBe(1);
    expect(loopAt(2.3, 7).sweep).toBeCloseTo(0, 5);
    expect(loopAt(4, 7).sweep).toBeCloseTo(1 / 7, 5);
    // the last stage rests at 6/7, then the loop starts again
    expect(loopAt(2.3 * 6.9, 7).sweep).toBeCloseTo(6 / 7, 5);
    expect(loopAt(2.3 * 7.9, 7)).toEqual({ index: 0, sweep: 0 });
  });
});
