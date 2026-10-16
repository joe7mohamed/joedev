'use client';

import { type ReactNode, useEffect } from 'react';
import { engine, type SceneId } from './engine';

const IDS: SceneId[] = ['hero', 'work', 'process', 'about', 'contact'];

/** Turns enhanced mode on after hydration and off whenever the visitor asks for reduced motion. */
export function EngineProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fromHash = (): void => {
      const id = window.location.hash.slice(1) as SceneId;
      if (IDS.includes(id)) engine.scrollToScene(id);
    };
    const apply = (): void => {
      const on = !query.matches;
      document.documentElement.classList.toggle('enhanced', on);
      if (on) {
        engine.start();
        document.dispatchEvent(new Event('zk:enhanced'));
        requestAnimationFrame(fromHash);
      } else engine.stop();
    };
    // keyboard focus must never land on a scene that is faded out
    const onFocus = (event: FocusEvent): void => {
      const section = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-scene]');
      if (
        section &&
        section.dataset.state !== 'active' &&
        document.documentElement.classList.contains('enhanced')
      )
        engine.scrollToScene(section.id as SceneId, 0.3);
    };
    apply();
    query.addEventListener('change', apply);
    window.addEventListener('hashchange', fromHash);
    document.addEventListener('focusin', onFocus);
    return () => {
      query.removeEventListener('change', apply);
      window.removeEventListener('hashchange', fromHash);
      document.removeEventListener('focusin', onFocus);
      engine.stop();
      document.documentElement.classList.remove('enhanced');
    };
  }, []);
  return <>{children}</>;
}
