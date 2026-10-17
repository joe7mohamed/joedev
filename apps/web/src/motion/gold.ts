import type { SceneFrame, SceneId } from './engine';
import { clamp, lerpRect, mix, type Rect, smooth } from './math';

/**
 * `tilt` (0..1, default 0) is how much the shape behaves as the floating project frame: it scales the pointer tilt,
 * the phone sway and the float, which move only the element's face, never the box that sits on the slot.
 * `fillBy` (0..1) lets a shape bring its fill in early: on the way into it, the fill has fully arrived by that
 * fraction of the handoff, eased, while position and size keep the shared pace. Without it the fill moves with them.
 */
export type GoldShape = Rect & {
  radius: number;
  fill: number;
  round: number;
  tilt?: number;
  fillBy?: number;
};
type Reader = (frame: SceneFrame, layer: HTMLElement) => GoldShape;

const slots = new Map<SceneId, Reader>();

export const registerSlot = (scene: SceneId, read: Reader): (() => void) => {
  slots.set(scene, read);
  return () => {
    if (slots.get(scene) === read) slots.delete(scene);
  };
};

/** A scene that flows has no fixed place for the gold element (spec 6.4): its slot is never read. */
export const readSlot =
  (layer: HTMLElement) =>
  (id: SceneId, frame: SceneFrame): GoldShape | null =>
    frame.pinned ? (slots.get(id)?.(frame, layer) ?? null) : null;

/**
 * Where a slot sits on screen once its scene is pinned, in the gold layer's coordinates.
 * x is measured against the layer itself, so a scrollbar on the start side or any other
 * shift of the page cannot offset it. y is measured against the slot's own sticky scene.
 */
export const pinnedRect = (slot: HTMLElement, sticky: HTMLElement, layer: HTMLElement): Rect => {
  const a = slot.getBoundingClientRect();
  const s = sticky.getBoundingClientRect();
  const l = layer.getBoundingClientRect();
  return { x: a.left - l.left, y: a.top - s.top, w: a.width, h: a.height };
};

/** The shape on screen, and the scene it belongs to (the one it sits on, or is leaving during a handoff). */
export type GoldPlacement = GoldShape & { on: SceneId };

/**
 * Moves a shape by the distance its pinned scene's box really is from the top of the screen. Under a pixel is
 * rounding (a fractional scroll position at the very bottom of the page), not movement.
 */
const ride = (shape: GoldShape, on: SceneId, dy: number): GoldPlacement =>
  Math.abs(dy) < 1 ? { ...shape, on } : { ...shape, y: shape.y + dy, on };

/**
 * The gold element's shape at this scroll position. Between two pinned scenes it travels from one slot to the next
 * during the first one's tail. Next to a scene that flows (whose slot reads null) it never travels: it stays on the
 * pinned scene's slot and moves with that scene's box as it scrolls away, or in, so it never covers a scene that
 * flows and never leaves the screen blank.
 */
export const resolveGold = (
  order: SceneId[],
  frames: Map<SceneId, SceneFrame>,
  scrollY: number,
  read: (id: SceneId, frame: SceneFrame) => GoldShape | null,
): GoldPlacement | null => {
  const present = order.filter((id) => frames.has(id));
  let at = -1;
  present.forEach((id, i) => {
    if ((frames.get(id) as SceneFrame).top <= scrollY + 1) at = i;
  });
  if (at < 0) at = 0;
  const currentId = present[at];
  if (!currentId) return null;
  const currentFrame = frames.get(currentId) as SceneFrame;
  const current = read(currentId, currentFrame);
  const nextId = present[at + 1];
  const nextFrame = nextId ? (frames.get(nextId) as SceneFrame) : null;
  const next = nextId && nextFrame ? read(nextId, nextFrame) : null;
  if (!current) {
    // before its top reaches the top of the screen, the next scene's box is still on its way in
    return next && nextId && nextFrame ? ride(next, nextId, Math.max(0, nextFrame.top - scrollY)) : null;
  }
  // past its end, the box has stopped being pinned and scrolls away
  if (!next) return ride(current, currentId, Math.min(0, currentFrame.end - scrollY));
  const t = smooth(currentFrame.out);
  if (t <= 0) return { ...current, on: currentId };
  if (t >= 1) return { ...next, on: currentId };
  return {
    ...lerpRect(current, next, t),
    radius: mix(current.radius, next.radius, t),
    fill: mix(current.fill, next.fill, next.fillBy ? smooth(clamp(t / next.fillBy)) : t),
    round: mix(current.round, next.round, t),
    tilt: mix(current.tilt ?? 0, next.tilt ?? 0, t),
    on: currentId,
  };
};
