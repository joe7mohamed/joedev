'use client';

import { useEffect, useState } from 'react';
import { whenLoaded } from '@/motion/loaded';
import { Swap } from '@/motion/Swap';
import { MOTION_OK, useMedia } from '@/motion/useMedia';

const EVERY_MS = 2400;

/**
 * The sentence with its rotating last word, which flips to the next one every 2.4 s. Without motion it shows
 * the first word, still. Every word sits invisibly in the same grid cell, so the widest one reserves the width
 * and the sentence never changes its line count while words flip. Assistive technology reads the sentence with
 * the first word; the flipping text is hidden from it.
 */
export function RotatingWord({ sentence, words }: { sentence: string; words: string[] }) {
  const moving = useMedia(MOTION_OK);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    setIndex(0);
    if (!moving || words.length < 2) return;
    let timer = 0;
    // it starts flipping once the loading screen has released the hero
    const stopWaiting = whenLoaded(() => {
      timer = window.setInterval(() => {
        if (!document.hidden) setIndex((i) => (i + 1) % words.length);
      }, EVERY_MS);
    });
    return () => {
      stopWaiting();
      window.clearInterval(timer);
    };
  }, [moving, words]);
  return (
    <>
      <span className="sr-only">{`${sentence} ${words[0] ?? ''}`}</span>
      <span aria-hidden="true">
        {sentence}{' '}
        <span data-rot>
          {words.map((w) => (
            <span key={w} data-sizer>
              {w}
            </span>
          ))}
          <Swap value={words[index] ?? ''} />
        </span>
      </span>
    </>
  );
}
