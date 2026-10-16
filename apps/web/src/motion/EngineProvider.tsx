'use client';

import { type ReactNode, useEffect } from 'react';
import { engine, type SceneId } from './engine';

const IDS: SceneId[] = ['hero', 'work', 'process', 'about', 'contact'];
const isSceneId = (id: string): id is SceneId => (IDS as string[]).includes(id);
const isEnhanced = (): boolean => document.documentElement.classList.contains('enhanced');

/** Turns enhanced mode on after hydration and off whenever the visitor asks for reduced motion. */
export function EngineProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    let enabledBefore = false;
    const fromHash = (): void => {
      const id = window.location.hash.slice(1);
      if (isSceneId(id)) engine.scrollToScene(id);
    };
    const apply = (): void => {
      const on = !query.matches;
      document.documentElement.classList.toggle('enhanced', on);
      if (!on) {
        engine.stop();
        return;
      }
      engine.start();
      if (enabledBefore) return;
      enabledBefore = true;
      document.dispatchEvent(new Event('zk:enhanced'));
      requestAnimationFrame(fromHash);
    };
    // keyboard focus must never land on a scene that is faded out; a scene that flows is left alone
    const onFocus = (event: FocusEvent): void => {
      const section = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-scene]');
      if (!section || !isEnhanced() || section.hasAttribute('data-unpinned') || !isSceneId(section.id))
        return;
      if (section.hasAttribute('data-faded') || section.dataset.state !== 'active')
        engine.scrollToScene(section.id, 0.3);
    };
    // a link to the hash already in the address fires no hashchange, so in-page links are handled here
    const onClick = (event: MouseEvent): void => {
      if (!isEnhanced() || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const id = link?.getAttribute('href')?.slice(1) ?? '';
      if (!isSceneId(id)) return;
      event.preventDefault();
      engine.scrollToScene(id);
      history.replaceState(null, '', `#${id}`);
    };
    apply();
    query.addEventListener('change', apply);
    window.addEventListener('hashchange', fromHash);
    document.addEventListener('focusin', onFocus);
    document.addEventListener('click', onClick);
    return () => {
      query.removeEventListener('change', apply);
      window.removeEventListener('hashchange', fromHash);
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('click', onClick);
      engine.stop();
      document.documentElement.classList.remove('enhanced');
    };
  }, []);
  return <>{children}</>;
}
