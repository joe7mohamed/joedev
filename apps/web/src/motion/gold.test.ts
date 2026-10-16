import { describe, expect, it } from 'vitest';
import type { SceneFrame, SceneId } from './engine';
import { type GoldShape, resolveGold } from './gold';

const frame = (id: SceneId, top: number, out: number): SceneFrame => ({
  id,
  progress: 0,
  body: 0,
  out,
  top,
  end: top + 1000,
  viewport: 1000,
  sticky: {} as HTMLElement,
});
const A: GoldShape = { x: 0, y: 0, w: 100, h: 4, radius: 2, fill: 1, round: 0 };
const B: GoldShape = { x: 500, y: 200, w: 600, h: 400, radius: 14, fill: 0, round: 0 };
const shapes: Partial<Record<SceneId, GoldShape>> = { hero: A, work: B };
const read = (id: SceneId): GoldShape | null => shapes[id] ?? null;
const order: SceneId[] = ['hero', 'work'];
const at = (heroOut: number) =>
  new Map<SceneId, SceneFrame>([
    ['hero', frame('hero', 0, heroOut)],
    ['work', frame('work', 1000, 0)],
  ]);

describe('resolveGold', () => {
  it('is the current shape while the scene body plays', () => {
    expect(resolveGold(order, at(0), 100, read)).toEqual(A);
  });
  it('is half way between shapes in the middle of the tail', () => {
    const mid = resolveGold(order, at(0.5), 750, read);
    expect(mid?.x).toBe(250);
    expect(mid?.h).toBe(202);
    expect(mid?.fill).toBe(0.5);
  });
  it('has arrived when the next scene starts', () => {
    expect(resolveGold(order, at(1), 999, read)).toEqual(B);
    expect(resolveGold(order, at(1), 1000, read)).toEqual(B);
  });
  it('blends the frame tilt in during the handoff, treating a missing tilt as none', () => {
    const tilted: Partial<Record<SceneId, GoldShape>> = { hero: A, work: { ...B, tilt: 1 } };
    const mid = resolveGold(order, at(0.5), 750, (id) => tilted[id] ?? null);
    expect(mid?.tilt).toBe(0.5);
  });
  it('returns null when nothing is registered', () => {
    expect(resolveGold(order, at(0), 0, () => null)).toBeNull();
  });
  it('holds the last shape when there is no next scene', () => {
    expect(resolveGold(order, at(1), 1600, read)).toEqual(B);
  });
});
