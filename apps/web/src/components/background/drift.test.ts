import { describe, expect, it } from 'vitest';
import {
  advance,
  easeSide,
  guardRoom,
  hexOf,
  luminance,
  pressOf,
  rgbOf,
  scrollOf,
  strengthOf,
  textSideOf,
} from './drift';

describe('background drift', () => {
  it('advances time by one second per second at rest and up to six times faster when scrolling fast', () => {
    expect(advance(2, 0.5, 0)).toBeCloseTo(2.5);
    expect(advance(0, 1, 50)).toBeCloseTo(4);
    expect(advance(0, 1, -1000)).toBeCloseTo(6);
  });

  it('presses harder with scroll speed, capped at 1', () => {
    expect(pressOf(0)).toBe(0);
    expect(pressOf(-50)).toBeCloseTo(0.6);
    expect(pressOf(400)).toBe(1);
  });

  it('keeps the text side calm: the start side, the end side in about, mirrored in RTL, none on phones', () => {
    expect(textSideOf('hero', false, false)).toBe(-1);
    expect(textSideOf('work', true, false)).toBe(1);
    expect(textSideOf('about', false, false)).toBe(1);
    expect(textSideOf('about', true, false)).toBe(-1);
    expect(textSideOf(undefined, false, false)).toBe(-1);
    expect(textSideOf('about', false, true)).toBe(0);
  });

  it('eases the side at the same pace whatever the frame rate', () => {
    expect(easeSide(0, 1, 1 / 60)).toBeCloseTo(0.12);
    const fast = Array.from({ length: 6 }).reduce<number>((side) => easeSide(side, 1, 1 / 60), 0);
    expect(easeSide(0, 1, 0.1)).toBeCloseTo(fast);
    expect(easeSide(-1, -1, 0.08)).toBe(-1);
  });

  it('runs at half strength on phones', () => {
    expect(strengthOf(false)).toBe(1);
    expect(strengthOf(true)).toBe(0.5);
  });

  it('measures scroll as a fraction of the page', () => {
    expect(scrollOf(0, 1000)).toBe(0);
    expect(scrollOf(500, 1000)).toBe(0.5);
    expect(scrollOf(2000, 1000)).toBe(1);
    expect(scrollOf(10, 0)).toBe(0);
  });

  it('turns a hex colour into GL floats', () => {
    expect(rgbOf(0xd4af37)).toEqual([212 / 255, 175 / 255, 55 / 255]);
    expect(rgbOf(0x000000)).toEqual([0, 0, 0]);
  });

  it('reads a hex colour token', () => {
    expect(hexOf(' #6a6457')).toBe(0x6a6457);
    expect(hexOf('#FAF9F6')).toBe(0xfaf9f6);
    expect(hexOf('rgb(1 2 3)')).toBeNull();
    expect(hexOf('')).toBeNull();
  });

  it('measures relative luminance as WCAG does', () => {
    expect(luminance(0xffffff)).toBeCloseTo(1);
    expect(luminance(0x000000)).toBe(0);
    expect(luminance(0x808080)).toBeCloseTo(0.2159, 4);
  });

  const ratio = (a: number, b: number): number => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

  it('lets the background under text move only as far as keeps every text colour at the ratio', () => {
    const page = luminance(0xfaf9f6);
    const texts = [0x6a6457, 0x8a6d1f];
    const room = guardRoom(0xfaf9f6, texts, 4.5);
    expect(room).toBeGreaterThan(0);
    expect(room).toBeLessThan(0.03);
    for (const text of texts) expect(ratio(luminance(text), page - room)).toBeGreaterThanOrEqual(4.5);
  });

  it('works the other way round on a dark page', () => {
    const page = luminance(0x0f0e0c);
    const texts = [0xa8a192, 0xd4af37];
    const room = guardRoom(0x0f0e0c, texts, 4.5);
    expect(room).toBeGreaterThan(0);
    for (const text of texts) expect(ratio(luminance(text), page + room)).toBeGreaterThanOrEqual(4.5);
  });

  it('allows no movement when a text colour already misses the ratio on the plain page', () => {
    expect(guardRoom(0xfaf9f6, [0xd4af37], 4.5)).toBe(0);
  });
});
