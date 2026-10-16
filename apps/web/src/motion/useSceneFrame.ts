'use client';

import { useEffect, useRef } from 'react';
import { engine, type SceneFrame, type SceneId, type ScrollInfo } from './engine';

export function useSceneFrame(id: SceneId, callback: (frame: SceneFrame, scroll: ScrollInfo) => void): void {
  const latest = useRef(callback);
  latest.current = callback;
  useEffect(
    () =>
      engine.subscribe((frames, scroll) => {
        const frame = frames.get(id);
        if (frame) latest.current(frame, scroll);
      }),
    [id],
  );
}
