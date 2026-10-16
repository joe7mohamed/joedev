import type { SceneFrame, SceneId } from './engine';
import { lerpRect, mix, type Rect, smooth } from './math';

export type GoldShape = Rect & { radius: number; fill: number; round: number };
type Reader = (frame: SceneFrame, layer: HTMLElement) => GoldShape;

const slots = new Map<SceneId, Reader>();

export const registerSlot = (scene: SceneId, read: Reader): (() => void) => {
  slots.set(scene, read);
  return () => {
    if (slots.get(scene) === read) slots.delete(scene);
  };
};

export const readSlot =
  (layer: HTMLElement) =>
  (id: SceneId, frame: SceneFrame): GoldShape | null =>
    slots.get(id)?.(frame, layer) ?? null;

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

export const resolveGold = (
  order: SceneId[],
  frames: Map<SceneId, SceneFrame>,
  scrollY: number,
  read: (id: SceneId, frame: SceneFrame) => GoldShape | null,
): GoldShape | null => {
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
  const next = nextId ? read(nextId, frames.get(nextId) as SceneFrame) : null;
  if (!current) return next;
  const t = smooth(currentFrame.out);
  if (!next || t <= 0) return current;
  if (t >= 1) return next;
  return {
    ...lerpRect(current, next, t),
    radius: mix(current.radius, next.radius, t),
    fill: mix(current.fill, next.fill, t),
    round: mix(current.round, next.round, t),
  };
};
