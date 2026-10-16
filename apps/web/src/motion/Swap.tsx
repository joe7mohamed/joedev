'use client';

import { useEffect, useRef, useState } from 'react';
import { runSwap } from './swapSequence';

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
    return runSwap(el, value, setShown);
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
