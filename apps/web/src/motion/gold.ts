import type { SceneFrame, SceneId } from './engine';
import { lerpRect, mix, type Rect, smooth } from './math';

/**
 * `tilt` (0..1, default 0) is how much the shape behaves as the floating project frame: it scales the pointer tilt,
 * the phone sway and the float, which move only the element's face, never the box that sits on the slot.
 */
export type GoldShape = Rect & { radius: number; fill: number; round: number; tilt?: number };
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
  const readNext = () => (nextId ? read(nextId, frames.get(nextId) as SceneFrame) : null);
  if (!current) return readNext();
  const t = smooth(currentFrame.out);
  if (!nextId || t <= 0) return current;
  const next = readNext();
  if (!next) return current;
  if (t >= 1) return next;
  return {
    ...lerpRect(current, next, t),
    radius: mix(current.radius, next.radius, t),
    fill: mix(current.fill, next.fill, t),
    round: mix(current.round, next.round, t),
    tilt: mix(current.tilt ?? 0, next.tilt ?? 0, t),
  };
};
