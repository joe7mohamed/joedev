import { describe, expect, it, vi } from 'vitest';
import type { SceneFrame, SceneId } from './engine';
import { fixedRect, type GoldShape, readSlot, registerSlot, resolveGold } from './gold';

const frame = (id: SceneId, top: number, out: number, pinned = true): SceneFrame => ({
  id,
  progress: 0,
  body: 0,
  out,
  top,
  end: top + 1000,
  viewport: 1000,
  pinned,
  layout: 0,
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
    expect(resolveGold(order, at(0), 100, read)).toEqual({ ...A, on: 'hero' });
  });
  it('is half way between shapes in the middle of the tail', () => {
    const mid = resolveGold(order, at(0.5), 750, read);
    expect(mid?.x).toBe(250);
    expect(mid?.h).toBe(202);
    expect(mid?.fill).toBe(0.5);
  });
  it('has arrived when the next scene starts', () => {
    expect(resolveGold(order, at(1), 999, read)).toEqual({ ...B, on: 'work' });
    expect(resolveGold(order, at(1), 1000, read)).toEqual({ ...B, on: 'work' });
  });
  it('blends the frame tilt in during the handoff, treating a missing tilt as none', () => {
    const tilted: Partial<Record<SceneId, GoldShape>> = { hero: A, work: { ...B, tilt: 1 } };
    const mid = resolveGold(order, at(0.5), 750, (id) => tilted[id] ?? null);
    expect(mid?.tilt).toBe(0.5);
  });
  it('lets the next shape bring its fill in early, ahead of its size, when it asks to', () => {
    const flood: GoldShape = { ...B, fill: 1, fillBy: 0.35 };
    const ring: GoldShape = { ...A, fill: 0 };
    const early: Partial<Record<SceneId, GoldShape>> = { hero: ring, work: flood };
    const blend = (out: number) => resolveGold(order, at(out), 750, (id) => early[id] ?? null);
    expect(blend(0.5)?.x).toBe(250);
    expect(blend(0.5)?.fill).toBe(1);
    // a quarter into the tail the fill is well ahead of the size, which moves with the shared ease
    const quarter = blend(0.25) as GoldShape;
    expect(quarter.fill).toBeGreaterThan((quarter.x / 500) * 2);
    expect(quarter.fill).toBeLessThan(1);
    expect(blend(0)?.fill).toBe(0);
  });
  it('returns null when nothing is registered', () => {
    expect(resolveGold(order, at(0), 0, () => null)).toBeNull();
  });
  it('holds the last shape when there is no next scene', () => {
    expect(resolveGold(order, at(1), 1600, read)).toEqual({ ...B, on: 'work' });
  });
  it('belongs to the scene it is leaving during a handoff', () => {
    expect(resolveGold(order, at(0.5), 750, read)?.on).toBe('hero');
  });

  // Spec 6.4: a scene that flows has no fixed place for the gold element; its neighbours keep theirs.
  describe('next to a scene that flows', () => {
    // hero pinned, work flowing below it (no overlap: it starts a viewport after the hero's end), process pinned
    const three: SceneId[] = ['hero', 'work', 'process'];
    const C: GoldShape = { x: 20, y: 300, w: 800, h: 3, radius: 2, fill: 0, round: 0 };
    const all: Partial<Record<SceneId, GoldShape>> = { hero: A, work: B, process: C };
    const frames = (heroOut: number) =>
      new Map<SceneId, SceneFrame>([
        ['hero', frame('hero', 0, heroOut)],
        ['work', frame('work', 2000, 0, false)],
        ['process', frame('process', 5000, 0)],
      ]);
    const readPinned = (id: SceneId, f: SceneFrame): GoldShape | null =>
      f.pinned ? (all[id] ?? null) : null;

    it('stays on the pinned scene through its tail instead of travelling to the scene that flows', () => {
      expect(resolveGold(three, frames(0.5), 750, readPinned)).toEqual({ ...A, on: 'hero' });
      expect(resolveGold(three, frames(1), 1000, readPinned)).toEqual({ ...A, on: 'hero' });
    });
    it('rides up with the pinned scene as it scrolls away', () => {
      expect(resolveGold(three, frames(1), 1400, readPinned)).toEqual({ ...A, y: -400, on: 'hero' });
    });
    it('treats a fraction of a pixel past the end as rounding, not movement', () => {
      expect(resolveGold(three, frames(1), 1000.6, readPinned)).toEqual({ ...A, on: 'hero' });
    });
    it('rides in with the pinned scene that follows, from where that scene really is', () => {
      expect(resolveGold(three, frames(1), 4400, readPinned)).toEqual({ ...C, y: 900, on: 'process' });
      expect(resolveGold(three, frames(1), 5000, readPinned)).toEqual({ ...C, on: 'process' });
    });
    it('is nowhere while only the scene that flows is around', () => {
      const alone = new Map<SceneId, SceneFrame>([['work', frame('work', 2000, 0, false)]]);
      expect(resolveGold(['work'], alone, 2500, readPinned)).toBeNull();
    });
  });
});

describe('readSlot', () => {
  it('never reads the slot of a scene that flows', () => {
    const layer = {} as HTMLElement;
    const reader = vi.fn((): GoldShape => A);
    const unregister = registerSlot('about', reader);
    expect(readSlot(layer)('about', frame('about', 0, 0, false))).toBeNull();
    expect(reader).not.toHaveBeenCalled();
    expect(readSlot(layer)('about', frame('about', 0, 0))).toEqual(A);
    unregister();
  });
});

// Spec 6.4: only the documented live slots read layout in the frame loop.
describe('fixedRect', () => {
  const box = (top: number, calls: { n: number }) =>
    ({
      getBoundingClientRect: () => {
        calls.n += 1;
        return { left: 10, top, width: 300, height: 200 } as DOMRect;
      },
    }) as HTMLElement;
  it('measures a slot that does not move once per layout, not every frame', () => {
    const calls = { n: 0 };
    const slot = box(150, calls);
    const sticky = box(0, calls);
    const layer = box(0, calls);
    const at = (layout: number): SceneFrame => ({ ...frame('work', 0, 0), sticky, layout });
    const rect = fixedRect(slot);
    expect(rect(at(1), layer)).toEqual({ x: 0, y: 150, w: 300, h: 200 });
    const first = calls.n;
    rect(at(1), layer);
    rect(at(1), layer);
    expect(calls.n).toBe(first);
    rect(at(2), layer);
    expect(calls.n).toBe(first * 2);
  });
});
