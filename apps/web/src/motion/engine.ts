import { sceneProgress } from './math';

export type SceneId = 'hero' | 'work' | 'process' | 'about' | 'contact';
export type SceneFrame = {
  id: SceneId;
  progress: number;
  body: number;
  out: number;
  top: number;
  end: number;
  viewport: number;
  sticky: HTMLElement;
};
export type ScrollInfo = { y: number; velocity: number };
type Listener = (frames: Map<SceneId, SceneFrame>, scroll: ScrollInfo) => void;

const scenes = new Map<SceneId, { section: HTMLElement; sticky: HTMLElement }>();
const listeners = new Set<Listener>();
const frames = new Map<SceneId, SceneFrame>();
let raf = 0;
let running = false;
let dirty = true;
let lastY = 0;
let velocity = 0;
const FIRST: SceneId = 'hero';
const LAST: SceneId = 'contact';

/**
 * `before` until the section's top reaches the viewport top, `active` while it still has travel left, `after`
 * once the next scene has taken over. The first scene is already active while content above it (the header)
 * is still in view; the last stays active at the very bottom of the page.
 */
const stateOf = (id: SceneId, top: number, past: number): 'before' | 'active' | 'after' => {
  if (top > 0 && id !== FIRST) return 'before';
  return past > 0 || (id === LAST && past >= -1) ? 'active' : 'after';
};

/**
 * Height the pinned scene needs for its content. Measured from the children's offsets, because an
 * `overflow: clip` box reports scrollHeight === clientHeight, and offsets ignore animated transforms.
 */
const needed = (sticky: HTMLElement): number => {
  const children = [...sticky.children] as HTMLElement[];
  if (children.length === 0) return 0;
  const top = Math.min(...children.map((child) => child.offsetTop));
  const bottom = Math.max(...children.map((child) => child.offsetTop + child.offsetHeight));
  const style = getComputedStyle(sticky);
  return bottom - top + Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
};

/** A scene is pinned only while its content fits; otherwise it flows naturally (large text, short screens). */
const fitScenes = (): void => {
  for (const { section, sticky } of scenes.values()) {
    section.removeAttribute('data-unpinned');
    if (needed(sticky) > sticky.clientHeight + 1) section.setAttribute('data-unpinned', 'true');
  }
};

const tick = (): void => {
  raf = 0;
  if (!running) return;
  const y = window.scrollY;
  velocity += (y - lastY - velocity) * 0.2;
  lastY = y;
  for (const [id, { section, sticky }] of scenes) {
    const box = section.getBoundingClientRect();
    const viewport = sticky.clientHeight || window.innerHeight;
    const r = sceneProgress(box.top, box.height, viewport, Number(section.dataset.tail ?? 0) * viewport);
    section.style.setProperty('--p', r.body.toFixed(4));
    section.style.setProperty('--out', r.out.toFixed(4));
    section.style.setProperty('--full', r.progress.toFixed(4));
    const past = box.bottom - viewport; // > 0 while this scene still has travel left
    section.dataset.state = stateOf(id, box.top, past);
    frames.set(id, {
      id,
      ...r,
      top: box.top + y,
      end: box.top + y + box.height - viewport,
      viewport,
      sticky,
    });
  }
  for (const listener of listeners) listener(frames, { y, velocity });
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
  fitScenes();
  onScroll();
};
const onVisibility = (): void => {
  if (!document.hidden) onScroll();
};

export const engine = {
  register(id: SceneId, section: HTMLElement, sticky: HTMLElement): () => void {
    scenes.set(id, { section, sticky });
    onResize();
    return () => {
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
  scrollToScene(id: SceneId, bodyFraction = 0.06): void {
    const scene = scenes.get(id);
    if (!scene) return;
    const viewport = scene.sticky.clientHeight || window.innerHeight;
    const travel = Math.max(0, scene.section.offsetHeight - viewport);
    const body = Math.max(0, travel - Number(scene.section.dataset.tail ?? 0) * viewport);
    window.scrollTo({ top: scene.section.offsetTop + body * bodyFraction, behavior: 'smooth' });
  },
  start(): void {
    if (running) return;
    running = true;
    lastY = window.scrollY;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    document.fonts?.ready.then(onResize).catch(() => undefined);
    onResize();
  },
  stop(): void {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    for (const { section } of scenes.values()) {
      for (const name of ['--p', '--out', '--full']) section.style.removeProperty(name);
      section.removeAttribute('data-state');
      section.removeAttribute('data-unpinned');
    }
  },
};
