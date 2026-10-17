'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { registerSlot } from '@/motion/gold';
import { useSceneFrame } from '@/motion/useSceneFrame';

/** The gold element's last job: the whole layer, square and solid, so the screen turns gold (spec 5.0). */
function useFlood(): void {
  useEffect(
    () =>
      registerSlot('contact', (_frame, layer) => ({
        x: 0,
        y: 0,
        w: layer.clientWidth,
        h: layer.clientHeight,
        radius: 0,
        fill: 1,
        round: 0,
        // the ring floods with gold early in the handoff, then grows to the edges (prototype app.js 438)
        fillBy: 0.35,
      })),
    [],
  );
}

/**
 * The entrance plays once, the first time the scene becomes active. It only adds a class: every animation it starts
 * fills backwards, so the content's resting state is always the visible one (spec 6.5).
 */
function usePlayOnce(): boolean {
  const [play, setPlay] = useState(false);
  useSceneFrame('contact', (frame) => {
    if (!play && frame.sticky.parentElement?.dataset.state === 'active') setPlay(true);
  });
  return play;
}

/**
 * Tells the page footer (SiteFooter, after <main>) how the scene stands, on <html>: `active` while the pinned scene is
 * the one on screen, `flowing` while it flows at natural height. The footer shows, or joins the flow, from that.
 */
function useSceneState(): void {
  useSceneFrame('contact', (frame) => {
    const section = frame.sticky.parentElement;
    const root = document.documentElement;
    const state = section?.hasAttribute('data-unpinned')
      ? 'flowing'
      : section?.dataset.state === 'active'
        ? 'active'
        : null;
    if (root.dataset.contactScene === (state ?? undefined)) return;
    if (state) root.dataset.contactScene = state;
    else delete root.dataset.contactScene;
  });
  useEffect(
    () => () => {
      delete document.documentElement.dataset.contactScene;
    },
    [],
  );
}

/**
 * The contact scene's behaviour around its content, which the server renders (Contact): the gold flood, the footer's
 * scene state and the one-time entrance.
 */
export function ContactScene({ children }: { children: ReactNode }) {
  useFlood();
  useSceneState();
  const play = usePlayOnce();
  return (
    <div data-fade data-contact data-play={play || undefined}>
      {children}
    </div>
  );
}
