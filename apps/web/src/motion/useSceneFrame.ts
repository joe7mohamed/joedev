'use client';

import { useLayoutEffect, useRef } from 'react';
import { engine, type SceneFrame, type SceneId, type ScrollInfo } from './engine';

export function useSceneFrame(id: SceneId, callback: (frame: SceneFrame, scroll: ScrollInfo) => void): void {
  const latest = useRef(callback);
  latest.current = callback;
  // subscribed before paint: the engine's first frame (EngineProvider) reaches it before anything is painted
  useLayoutEffect(
    () =>
      engine.subscribe((frames, scroll) => {
        const frame = frames.get(id);
        if (frame) latest.current(frame, scroll);
      }),
    [id],
  );
}
