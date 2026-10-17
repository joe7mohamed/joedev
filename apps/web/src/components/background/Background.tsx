'use client';

import { useEffect, useRef } from 'react';
import { param } from '@/lib/e2e';
import { currentScene } from '@/motion/current';
import { engine, type SceneFrame, type SceneId } from '@/motion/engine';
import { advance, easeSide, guardRoom, hexOf, pressOf, scrollOf, strengthOf, textSideOf } from './drift';
import { createRenderer, NO_GUARD, type Renderer, type Theme } from './shader';

/** Without scrolling, the slow drift is redrawn every 80 ms. */
const DRIFT_MS = 80;
/** A longer gap (a busy main thread, a throttled timer) never jumps the clock by more than this. */
const MAX_STEP = 0.25;
/** Rendered at a fraction of the screen's pixels: soft noise needs no more (spec 5.8). */
const MAX_RATIO = 1.5;
const SCALE = 0.6;
const PHONE = '(max-width: 860px)';

const themeOf = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

/** Text colours that sit on the background, read from the theme's tokens so they never drift from the CSS. */
const TEXT_TOKENS = ['--ink', '--muted', '--accent'];
const AA = 4.5;

/**
 * How far the light background under the words may move from the page colour (spec 5.8: never below AA). The dark
 * theme keeps its ridges; a page-colour halo protects its text instead (home.css), the smaller change.
 */
const guardOf = (theme: Theme): number => {
  if (theme === 'dark') return NO_GUARD;
  const style = getComputedStyle(document.documentElement);
  const page = hexOf(style.getPropertyValue('--bg'));
  const texts = TEXT_TOKENS.map((name) => hexOf(style.getPropertyValue(name)));
  const known = texts.filter((text): text is number => text !== null);
  // unreadable tokens: keep the words' half plain rather than risk the contrast
  if (page === null || known.length < texts.length) return 0;
  return guardRoom(page, known, AA);
};

/** The page's scroll length from the engine's geometry: the end of the scene that ends last. */
const lengthOf = (frames: Map<SceneId, SceneFrame>): number => {
  let end = 0;
  for (const frame of frames.values()) end = Math.max(end, frame.end);
  return end;
};

const sized = new WeakSet<HTMLCanvasElement>();

/**
 * Sizes the drawing buffer to the canvas's CSS size at the reduced pixel ratio, and the viewport with it. Only when
 * the size changed: reassigning clears and reallocates the buffer, and the phone's toolbar fires resizes all the time.
 * Returns whether it changed.
 */
const sizeBuffer = (canvas: HTMLCanvasElement, renderer: Renderer): boolean => {
  const box = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, MAX_RATIO) * SCALE;
  const width = Math.max(1, Math.round(box.width * ratio));
  const height = Math.max(1, Math.round(box.height * ratio));
  if (sized.has(canvas) && width === canvas.width && height === canvas.height) return false;
  sized.add(canvas);
  canvas.width = width;
  canvas.height = height;
  renderer.resize(width, height);
  return true;
};

/**
 * Calls `onChange` whenever the device pixel ratio changes without a window resize (a window moved to another
 * screen), re-arming its query for the new ratio each time. Returns a function that stops watching.
 */
const watchPixelRatio = (onChange: () => void): (() => void) => {
  let query = window.matchMedia('all');
  const fire = (): void => {
    onChange();
    arm();
  };
  const arm = (): void => {
    query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    query.addEventListener('change', fire, { once: true });
  };
  arm();
  return () => query.removeEventListener('change', fire);
};

/** Paints the current theme's palette, with its text guard. */
const paintTheme = (renderer: Renderer): void => {
  const theme = themeOf();
  renderer.paint(theme, guardOf(theme));
};

type Painter = {
  draw(): void;
  /** The slow drift: draws unless the engine has just drawn. */
  drift(): void;
  resize(): void;
  paint(): void;
  follow(frames: Map<SceneId, SceneFrame>, y: number, velocity: number): void;
  /** Restarts the clock so time spent hidden is not added to it. */
  resume(): void;
};

/** Holds the uniforms between draws and turns what the engine reports into them. */
const painter = (canvas: HTMLCanvasElement, renderer: Renderer): Painter => {
  const rtl = document.documentElement.dir === 'rtl';
  const phone = window.matchMedia(PHONE);
  let scene: SceneId | undefined;
  let y = 0;
  let velocity = 0;
  let length = 0;
  let time = 0;
  let side: number | null = null;
  let last = performance.now();
  let drawn = 0;

  const draw = (): void => {
    if (document.hidden) return;
    const now = performance.now();
    const dt = Math.min(MAX_STEP, (now - last) / 1000);
    last = now;
    drawn = now;
    time = advance(time, dt, velocity);
    const target = textSideOf(scene, rtl, phone.matches);
    side = side === null ? target : easeSide(side, target, dt);
    const calm = strengthOf(phone.matches);
    renderer.draw({ time, scroll: scrollOf(y, length), press: pressOf(velocity), side, calm });
  };
  return {
    draw,
    drift() {
      if (performance.now() - drawn >= DRIFT_MS * 0.75) draw();
    },
    resize() {
      if (sizeBuffer(canvas, renderer)) draw();
    },
    paint() {
      paintTheme(renderer);
      draw();
    },
    follow(frames, scrollY, scrollVelocity) {
      y = scrollY;
      velocity = scrollVelocity;
      scene = currentScene(frames, y);
      length = lengthOf(frames);
      draw();
    },
    resume() {
      last = performance.now();
    },
  };
};

/**
 * Draws on every engine tick and on a slow drift timer that runs only while the tab is visible. Returns a stop
 * function that removes every listener; `onLost` runs once if the GL context goes away.
 */
const run = (canvas: HTMLCanvasElement, renderer: Renderer, onLost: () => void): (() => void) => {
  const view = painter(canvas, renderer);
  let timer = 0;
  const visibility = (): void => {
    window.clearInterval(timer);
    if (document.hidden) return;
    view.resume();
    timer = window.setInterval(view.drift, DRIFT_MS);
    view.draw();
  };
  const unsubscribe = engine.subscribe((frames, scroll) => view.follow(frames, scroll.y, scroll.velocity));
  const unwatch = watchPixelRatio(view.resize);
  const stop = (): void => {
    window.clearInterval(timer);
    unsubscribe();
    unwatch();
    window.removeEventListener('resize', view.resize);
    window.visualViewport?.removeEventListener('resize', view.resize);
    document.removeEventListener('visibilitychange', visibility);
    document.removeEventListener('themechange', view.paint);
    canvas.removeEventListener('webglcontextlost', lost);
  };
  const lost = (): void => {
    stop();
    onLost();
  };
  window.addEventListener('resize', view.resize);
  // the phone's address bar changes the visual viewport without a window resize
  window.visualViewport?.addEventListener('resize', view.resize);
  document.addEventListener('visibilitychange', visibility);
  document.addEventListener('themechange', view.paint);
  canvas.addEventListener('webglcontextlost', lost);
  // palette first, then the size: the first draw already has both
  paintTheme(renderer);
  view.resize();
  visibility();
  return stop;
};

/**
 * The liquid gold background (spec 5.8): one fixed, decorative canvas behind everything. Where WebGL is missing or
 * only in software, the shader fails, or the context is lost, the canvas hides and the page's CSS gradient shows
 * (home.css).
 * Mounted only when motion is allowed (BackgroundLoader); unmounting releases the GL context.
 * Every run of the effect makes its own canvas: a released context cannot be had again from the same element, and
 * React may run the effect twice on one element (StrictMode, Fast Refresh).
 */
export default function Background() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const parent = host.current;
    if (!parent) return;
    const canvas = document.createElement('canvas');
    canvas.dataset.bg = '';
    canvas.setAttribute('aria-hidden', 'true');
    parent.append(canvas);
    const hide = (): void => {
      canvas.hidden = true;
    };
    // E2E builds only: `?bg=soft` lets the shader's own tests run it on the headless browser's software WebGL
    const renderer = createRenderer(canvas, param('bg') === 'soft');
    if (!renderer) hide();
    const stop = renderer ? run(canvas, renderer, hide) : undefined;
    return () => {
      stop?.();
      renderer?.release();
      canvas.remove();
    };
  }, []);
  return <div ref={host} data-bg-host />;
}
