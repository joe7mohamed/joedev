import { whenLoaded } from './loaded';
import { clamp, sceneProgress } from './math';

export type SceneId = 'hero' | 'work' | 'process' | 'about' | 'contact';
export type SceneFrame = {
  id: SceneId;
  progress: number;
  body: number;
  out: number;
  top: number;
  end: number;
  viewport: number;
  /** False while the scene flows at natural height because its content does not fit one viewport. */
  pinned: boolean;
  /** Changes whenever the scenes are measured again (resize, fonts, content size), so cached layout can refresh. */
  layout: number;
  sticky: HTMLElement;
};
export type ScrollInfo = { y: number; velocity: number };
type Listener = (frames: Map<SceneId, SceneFrame>, scroll: ScrollInfo) => void;
type State = 'before' | 'active' | 'after';

/** Layout measured outside the frame loop; `tick` only does arithmetic on it. */
type Geometry = {
  top: number;
  height: number;
  viewport: number;
  tail: number;
  unpinned: boolean;
  afterUnpinned: boolean;
  beforeUnpinned: boolean;
};
type Entry = {
  section: HTMLElement;
  sticky: HTMLElement;
  geometry: Geometry;
  written: Map<string, string | null>;
};

const FIRST: SceneId = 'hero';
const LAST: SceneId = 'contact';
/** Content fades in over the first 4% of the body and out over the first 35% of the tail (home.css). */
const ENTER = 0.04;
const EXIT = 0.35;

const scenes = new Map<SceneId, Entry>();
const listeners = new Set<Listener>();
const frames = new Map<SceneId, SceneFrame>();
let raf = 0;
let refitRaf = 0;
let running = false;
let dirty = true;
let lastY = 0;
let velocity = 0;
let layout = 0;
let observer: ResizeObserver | null = null;
let stopWaiting: () => void = () => undefined;

/** The loading screen covers the page: nothing on screen to update, so nothing is written (spec 5.1). */
const held = (): boolean => document.documentElement.classList.contains('loading');

/**
 * Pinned scenes: `before` until the section's top reaches the viewport top, `active` while it still has travel
 * left, `after` once the next scene has taken over. The first scene is already active while content above it
 * (the header) is still in view; the last stays active at the very bottom of the page. A scene that flows is
 * active while any part of it is on screen.
 */
const stateOf = (id: SceneId, top: number, g: Geometry): State => {
  if (g.unpinned) {
    if (top + g.height <= 0) return 'after';
    return top <= g.viewport ? 'active' : 'before';
  }
  if (top > 0 && id !== FIRST) return 'before';
  const past = top + g.height - g.viewport; // > 0 while this scene still has travel left
  return past > 0 || (id === LAST && past >= -1) ? 'active' : 'after';
};

/** Whether the scene's content is effectively invisible (see the fades in home.css). */
const fadedOut = (id: SceneId, body: number, out: number, g: Geometry): boolean => {
  if (g.unpinned) return false;
  const entering = id !== FIRST && !g.afterUnpinned && body < ENTER;
  const leaving = id !== LAST && !g.beforeUnpinned && out > EXIT;
  return entering || leaving;
};

/**
 * Height the pinned scene needs for its content. Measured from the children's offsets, which ignore animated
 * transforms: under `overflow: clip`, scrollHeight on this centred flex box ignores overflow into the padding
 * area and leading-edge overflow, so it cannot see content pushed under the header zone or the bottom padding.
 */
const needed = (sticky: HTMLElement): number => {
  const children = [...sticky.children] as HTMLElement[];
  if (children.length === 0) return 0;
  const top = Math.min(...children.map((child) => child.offsetTop));
  const bottom = Math.max(...children.map((child) => child.offsetTop + child.offsetHeight));
  const style = getComputedStyle(sticky);
  return bottom - top + Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
};

/**
 * A scene is pinned only while its content fits; otherwise it flows naturally (large text, short screens).
 * Then every scene's geometry is measured once, so the frame loop never reads layout.
 */
const fitScenes = (): void => {
  layout += 1;
  const viewports = new Map<SceneId, number>();
  for (const [id, { section, sticky }] of scenes) {
    section.removeAttribute('data-unpinned');
    const viewport = sticky.getBoundingClientRect().height || window.innerHeight;
    viewports.set(id, viewport);
    if (needed(sticky) > viewport + 1) section.setAttribute('data-unpinned', 'true');
  }
  for (const [id, entry] of scenes) {
    const { section } = entry;
    const box = section.getBoundingClientRect();
    const viewport = viewports.get(id) ?? window.innerHeight;
    const previous = section.previousElementSibling;
    const next = section.nextElementSibling;
    const beforeUnpinned =
      !section.hasAttribute('data-unpinned') && (next?.hasAttribute('data-unpinned') ?? false);
    // a pinned scene right before one that flows keeps its content until that one scrolls in (home.css)
    if (beforeUnpinned) section.setAttribute('data-next-unpinned', 'true');
    else section.removeAttribute('data-next-unpinned');
    entry.geometry = {
      top: box.top + window.scrollY,
      height: box.height,
      viewport,
      tail: Number(section.dataset.tail ?? 0) * viewport,
      unpinned: section.hasAttribute('data-unpinned'),
      afterUnpinned: previous?.hasAttribute('data-unpinned') ?? false,
      beforeUnpinned,
    };
  }
};

/** Writes an inline custom property or attribute only when its value changed; `null` removes it. */
const write = (entry: Entry, name: string, value: string | null): void => {
  if (entry.written.get(name) === value) return;
  entry.written.set(name, value);
  const { section } = entry;
  if (name.startsWith('--')) {
    if (value === null) section.style.removeProperty(name);
    else section.style.setProperty(name, value);
  } else if (value === null) section.removeAttribute(name);
  else section.setAttribute(name, value);
};

const notify = (scroll: ScrollInfo): void => {
  for (const listener of listeners) {
    try {
      listener(frames, scroll);
    } catch (error) {
      // one failing island must not stop the others (spec 6.5)
      if (process.env.NODE_ENV !== 'production') console.error(error);
    }
  }
};

const tick = (): void => {
  raf = 0;
  if (!running) return;
  // the frame after the release catches up (start: whenLoaded)
  if (held()) {
    dirty = true;
    return;
  }
  const y = window.scrollY;
  velocity += (y - lastY - velocity) * 0.2;
  lastY = y;
  for (const [id, entry] of scenes) {
    const g = entry.geometry;
    const top = g.top - y;
    const r = sceneProgress(top, g.height, g.viewport, g.tail);
    write(entry, '--p', r.body.toFixed(4));
    write(entry, '--out', r.out.toFixed(4));
    write(entry, '--full', r.progress.toFixed(4));
    write(entry, 'data-state', stateOf(id, top, g));
    write(entry, 'data-faded', fadedOut(id, r.body, r.out, g) ? 'true' : null);
    frames.set(id, {
      id,
      ...r,
      top: g.top,
      end: g.top + g.height - g.viewport,
      viewport: g.viewport,
      pinned: !g.unpinned,
      layout,
      sticky: entry.sticky,
    });
  }
  notify({ y, velocity });
  if (Math.abs(velocity) > 0.05 || dirty) {
    dirty = false;
    schedule();
  }
};
const schedule = (): void => {
  if (!raf && running) raf = requestAnimationFrame(tick);
};
const onScroll = (): void => {
  dirty = true;
  schedule();
};
const onResize = (): void => {
  if (!running) return;
  fitScenes();
  onScroll();
};
/** Size changes (fonts, content, the address bar) refit at most once per animation frame. */
const onObservedResize = (): void => {
  if (refitRaf || !running) return;
  refitRaf = requestAnimationFrame(() => {
    refitRaf = 0;
    onResize();
  });
};
const onVisibility = (): void => {
  if (!document.hidden) onScroll();
};
const observe = (entry: Entry): void => {
  observer?.observe(entry.section);
  observer?.observe(entry.sticky);
};

const EMPTY: Geometry = {
  top: 0,
  height: 0,
  viewport: 0,
  tail: 0,
  unpinned: false,
  afterUnpinned: false,
  beforeUnpinned: false,
};

export const engine = {
  register(id: SceneId, section: HTMLElement, sticky: HTMLElement): () => void {
    const entry: Entry = { section, sticky, geometry: EMPTY, written: new Map() };
    scenes.set(id, entry);
    if (running) observe(entry);
    onResize();
    return () => {
      observer?.unobserve(section);
      observer?.unobserve(sticky);
      scenes.delete(id);
      frames.delete(id);
    };
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    onScroll();
    return () => listeners.delete(listener);
  },
  invalidate: onScroll,
  /** Scrolls so that the scene's body equals the fraction; a scene that flows is reached at its top. */
  scrollToScene(id: SceneId, bodyFraction = 0.06): void {
    const scene = scenes.get(id);
    if (!scene) return;
    const g = scene.geometry;
    const body = g.unpinned ? 0 : Math.max(0, g.height - g.viewport - g.tail);
    window.scrollTo({ top: g.top + body * clamp(bodyFraction), behavior: 'smooth' });
  },
  start(): void {
    if (running) return;
    running = true;
    lastY = window.scrollY;
    observer = new ResizeObserver(onObservedResize);
    for (const entry of scenes.values()) observe(entry);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    document.fonts?.ready.then(onResize).catch(() => undefined);
    onResize();
    stopWaiting = whenLoaded(onScroll);
  },
  stop(): void {
    running = false;
    stopWaiting();
    if (raf) cancelAnimationFrame(raf);
    if (refitRaf) cancelAnimationFrame(refitRaf);
    raf = 0;
    refitRaf = 0;
    observer?.disconnect();
    observer = null;
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    for (const entry of scenes.values()) {
      for (const name of ['--p', '--out', '--full', 'data-state', 'data-faded']) write(entry, name, null);
      entry.section.removeAttribute('data-unpinned');
      entry.section.removeAttribute('data-next-unpinned');
      entry.written.clear();
    }
  },
};
