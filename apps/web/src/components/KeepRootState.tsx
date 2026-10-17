'use client';

import { useLayoutEffect } from 'react';

/** The attributes of <html> that React itself sets (the locale layout); every other one belongs to the scripts. */
const REACT_OWNED = new Set(['lang', 'dir', 'class']);

type RootState = { classes: string[]; attributes: [string, string][] };

/** What the scripts had put on <html> when the last page unmounted; null on the first page of the document. */
let handedOver: RootState | null = null;

/**
 * Switching language is a client-side navigation, but the new page mounts a new root layout, and React clears every
 * attribute of <html> when it takes the element over (React DOM's commitHostSingletonAcquisition). The page keeps its
 * own state there outside React: the theme and the layout classes the head script set before the first paint
 * (lib/theme-script.ts), and what the scenes set since (EngineProvider, GoldElement, ContactScene). This hands that
 * state from the page that leaves to the page that comes, in the same commit, so the new page's first paint already
 * has it: no flash of the other theme or of the stacked layout. `reactClasses` is the class list the layout renders.
 */
export function KeepRootState({ reactClasses }: { reactClasses: string }) {
  useLayoutEffect(() => {
    const html = document.documentElement;
    if (handedOver) {
      for (const [name, value] of handedOver.attributes)
        if (!html.hasAttribute(name)) html.setAttribute(name, value);
      html.classList.add(...handedOver.classes);
      handedOver = null;
    }
    return () => {
      const own = new Set(reactClasses.split(' '));
      handedOver = {
        classes: [...html.classList].filter((name) => !own.has(name)),
        attributes: [...html.attributes]
          .filter((a) => !REACT_OWNED.has(a.name))
          .map((a): [string, string] => [a.name, a.value]),
      };
    };
  }, [reactClasses]);
  return null;
}
