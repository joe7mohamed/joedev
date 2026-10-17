import type { SceneId } from '@/motion/engine';

/** Uniform values for the background shader (spec 5.8), as pure arithmetic on what the engine reports. */

/** Time runs up to this many times faster on top of its own pace while the page scrolls fast. */
const MAX_SURGE = 5;
const SURGE_PER_PX = 0.06;
const PRESS_PER_PX = 0.012;
/** The side eases by 12% of the way per 60 Hz frame (prototype), converted so any frame rate keeps that pace. */
const SIDE_EASE = 0.12;
const FRAME = 1 / 60;
/** On phones the text is centred and the background runs at half strength. */
const PHONE_STRENGTH = 0.5;
/** Scenes whose text sits on the end side on desktop (the about ring is on the start side). */
const TEXT_AT_END: ReadonlySet<SceneId> = new Set(['about']);

export type Rgb = [number, number, number];

/** Advances the shader's clock by `dt` seconds; `velocity` is the engine's smoothed scroll speed in px per frame. */
export const advance = (time: number, dt: number, velocity: number): number =>
  time + dt * (1 + Math.min(MAX_SURGE, Math.abs(velocity) * SURGE_PER_PX));

/** How hard fast scrolling brightens the ridges, 0..1. */
export const pressOf = (velocity: number): number => Math.min(1, Math.abs(velocity) * PRESS_PER_PX);

/**
 * The physical side the current scene's text sits on: −1 left, +1 right, 0 on phones where it is centred.
 * The shader keeps that side calm.
 */
export const textSideOf = (scene: SceneId | undefined, rtl: boolean, phone: boolean): number => {
  if (phone) return 0;
  const start = rtl ? 1 : -1;
  return scene && TEXT_AT_END.has(scene) ? -start : start;
};

/** Moves the eased side toward its target over `dt` seconds. */
export const easeSide = (side: number, target: number, dt: number): number =>
  side + (target - side) * (1 - (1 - SIDE_EASE) ** (dt / FRAME));

export const strengthOf = (phone: boolean): number => (phone ? PHONE_STRENGTH : 1);

/** Scroll position as a fraction of the page's scroll length, 0..1. */
export const scrollOf = (y: number, length: number): number =>
  length > 0 ? Math.min(1, Math.max(0, y / length)) : 0;

export const rgbOf = (hex: number): Rgb => [
  ((hex >> 16) & 255) / 255,
  ((hex >> 8) & 255) / 255,
  (hex & 255) / 255,
];
