'use client';

import { useEffect, useRef, useState } from 'react';
import { currentScene } from '@/motion/current';
import { engine, type SceneFrame, type SceneId } from '@/motion/engine';
import { advance, easeSide, pressOf, scrollOf, strengthOf, textSideOf } from './drift';
import { createRenderer, type Renderer, type Theme } from './shader';

/** Without scrolling, the slow drift is redrawn every 80 ms. */
const DRIFT_MS = 80;
/** A longer gap (a busy main thread, a throttled timer) never jumps the clock by more than this. */
const MAX_STEP = 0.25;
/** Rendered at a fraction of the screen's pixels: soft noise needs no more (spec 5.8). */
const MAX_RATIO = 1.5;
const SCALE = 0.6;
const PHONE = '(max-width: 860px)';

const themeOf = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

/** The page's scroll length from the engine's geometry: the end of the scene that ends last. */
const lengthOf = (frames: Map<SceneId, SceneFrame>): number => {
  let end = 0;
  for (const frame of frames.values()) end = Math.max(end, frame.end);
  return end;
};

/** Sizes the drawing buffer to the canvas's CSS size at the reduced pixel ratio. */
const sizeBuffer = (canvas: HTMLCanvasElement): void => {
  const box = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, MAX_RATIO) * SCALE;
  canvas.width = Math.max(1, Math.round(box.width * ratio));
  canvas.height = Math.max(1, Math.round(box.height * ratio));
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
      sizeBuffer(canvas);
      renderer.resize(canvas.width, canvas.height);
      draw();
    },
    paint() {
      renderer.paint(themeOf());
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
  const stop = (): void => {
    window.clearInterval(timer);
    unsubscribe();
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
  view.paint();
  view.resize();
  visibility();
  return stop;
};

/**
 * The liquid gold background (spec 5.8): one fixed, decorative canvas behind everything. Where WebGL is missing,
 * the shader fails, or the context is lost, the canvas hides and the page's CSS gradient shows (home.css).
 * Mounted only when motion is allowed (BackgroundLoader); unmounting releases the GL context.
 */
export default function Background() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const renderer = createRenderer(el);
    if (!renderer) {
      setFailed(true);
      return;
    }
    const stop = run(el, renderer, () => setFailed(true));
    return () => {
      stop();
      renderer.release();
    };
  }, []);
  // biome-ignore lint/a11y/noAriaHiddenOnFocusable: a canvas without tabindex is not focusable; it is decoration (spec 7)
  return <canvas ref={canvas} data-bg aria-hidden="true" hidden={failed} />;
}
