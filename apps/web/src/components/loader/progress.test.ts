import { describe, expect, it } from 'vitest';
import { countOf, stepShown, targetOf } from './progress';

const FRAME = 1000 / 60;

describe('targetOf', () => {
  it('follows the share of finished jobs', () => {
    expect(targetOf({ loaded: 1, total: 4, sinceStart: 2000, pageTime: 2000 })).toBe(0.25);
  });

  it('never runs ahead of 900 ms since the loader started', () => {
    expect(targetOf({ loaded: 4, total: 4, sinceStart: 450, pageTime: 1200 })).toBe(0.5);
    expect(targetOf({ loaded: 4, total: 4, sinceStart: 900, pageTime: 1650 })).toBe(1);
  });

  it('gives up and reads 1 after 5000 ms', () => {
    expect(targetOf({ loaded: 0, total: 4, sinceStart: 4200, pageTime: 5000 })).toBe(1);
    expect(targetOf({ loaded: 0, total: 4, sinceStart: 5000, pageTime: 5000 })).toBe(1);
    expect(targetOf({ loaded: 0, total: 4, sinceStart: 4999, pageTime: 4999 })).toBe(0);
  });

  it('never reads below 0 when the first frame is stamped before the loader started', () => {
    expect(targetOf({ loaded: 4, total: 4, sinceStart: -3, pageTime: 1200 })).toBe(0);
  });

  it('reads 1 when there is nothing to load, once the minimum time has passed', () => {
    expect(targetOf({ loaded: 0, total: 0, sinceStart: 900, pageTime: 900 })).toBe(1);
  });
});

describe('stepShown', () => {
  it('moves 16% of the way per 60 Hz frame', () => {
    expect(stepShown(0, 1, FRAME)).toBeCloseTo(0.16, 10);
    expect(stepShown(0.5, 0.5, FRAME)).toBe(0.5);
  });

  it('keeps that pace at any frame rate', () => {
    const at60 = stepShown(stepShown(0, 0.8, FRAME), 0.8, FRAME);
    const at30 = stepShown(0, 0.8, 2 * FRAME);
    expect(at30).toBeCloseTo(at60, 10);
  });

  it('snaps to 1 above 0.992 once the target is 1', () => {
    expect(stepShown(0.991, 1, FRAME)).toBe(1);
    expect(stepShown(0.99, 0.995, FRAME)).toBeLessThan(1);
  });

  it('never moves backwards on a frame stamped before the last one', () => {
    expect(stepShown(0, 1, -4)).toBe(0);
    expect(stepShown(0.3, 1, -4)).toBe(0.3);
  });

  it('never overshoots after a long pause', () => {
    expect(stepShown(0.2, 0.6, 60_000)).toBeCloseTo(0.6, 10);
  });
});

describe('countOf', () => {
  it('pads to two digits and reads up to 100', () => {
    expect(countOf(0)).toBe('00');
    expect(countOf(0.04)).toBe('04');
    expect(countOf(0.456)).toBe('46');
    expect(countOf(1)).toBe('100');
  });
});
