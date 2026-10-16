'use client';

import { useEffect, useRef, useState } from 'react';

const OUT = 180;
const IN = 500;
const EASE = 'cubic-bezier(.2,.8,.2,1)';

/** Text that flips to a new value. Its resting style is always fully visible. */
export function Swap({
  value,
  as = 'span',
  className,
}: {
  value: string;
  as?: 'span' | 'div';
  className?: string;
}) {
  const [shown, setShown] = useState(value);
  const node = useRef<HTMLElement>(null);
  useEffect(() => {
    if (value === shown) return;
    const el = node.current;
    const still = !el || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !el.animate;
    if (still) {
      setShown(value);
      return;
    }
    for (const running of el.getAnimations()) running.cancel();
    const out = el.animate(
      [
        { transform: 'none', opacity: 1 },
        { transform: 'rotateX(-80deg) translateY(-35%)', opacity: 0 },
      ],
      { duration: OUT, easing: 'ease-in', fill: 'none' },
    );
    let cancelled = false;
    out.finished
      .then(() => {
        if (cancelled) return;
        setShown(value);
        el.animate(
          [
            { transform: 'rotateX(80deg) translateY(35%)', opacity: 0 },
            { transform: 'none', opacity: 1 },
          ],
          { duration: IN, easing: EASE, fill: 'none' },
        );
      })
      .catch(() => setShown(value));
    return () => {
      cancelled = true;
      out.cancel();
    };
  }, [value, shown]);
  const Tag = as;
  return (
    <Tag
      ref={node as never}
      className={className}
      style={{ display: 'inline-block', transformOrigin: '50% 60%' }}
    >
      {shown}
    </Tag>
  );
}
