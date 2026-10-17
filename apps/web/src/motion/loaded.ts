type Root = { classList: { contains(name: string): boolean } };
type Observer = { observe(target: never, options: MutationObserverInit): void; disconnect(): void };
type ObserverClass = new (callback: () => void) => Observer;

/**
 * Runs `start` when the loading screen has cleared, with the page-clock time (ms) the hero build starts from.
 * Without a loader that is 0, the clock's origin: the CSS build started with the first paint. While `html.loading`
 * is present the CSS build is held, so it starts when the class is removed, and `start` gets that moment.
 * Returns a cancel function; once called, `start` never runs.
 */
export function whenLoaded(
  start: (origin: number) => void,
  root: Root = document.documentElement,
  now: () => number = () => performance.now(),
  Watcher: ObserverClass = MutationObserver,
): () => void {
  if (!root.classList.contains('loading')) {
    start(0);
    return () => undefined;
  }
  const observer = new Watcher(() => {
    if (root.classList.contains('loading')) return;
    observer.disconnect();
    start(now());
  });
  observer.observe(root as never, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}
