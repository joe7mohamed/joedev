'use client';

import { type CSSProperties, type ReactNode, useLayoutEffect, useRef } from 'react';
import { engine, type SceneId } from './engine';

export function Scene({
  id,
  length,
  tail = 0,
  label,
  children,
}: {
  id: SceneId;
  length: number;
  tail?: number;
  label?: string;
  children: ReactNode;
}) {
  const section = useRef<HTMLElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  // before paint, so the engine's first synchronous frame (EngineProvider) already includes this scene
  useLayoutEffect(() => {
    if (!section.current || !sticky.current) return;
    return engine.register(id, section.current, sticky.current);
  }, [id]);
  return (
    <section
      ref={section}
      id={id}
      data-scene
      data-tail={tail}
      aria-label={label}
      style={{ '--len': length } as CSSProperties}
    >
      <div ref={sticky} data-sticky>
        {children}
      </div>
    </section>
  );
}
