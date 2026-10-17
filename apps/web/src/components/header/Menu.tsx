'use client';

import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { currentScene, sceneState } from '@/motion/current';
import { engine, type SceneFrame, type SceneId } from '@/motion/engine';
import type { MenuId } from './menu-icons';
import './menu.css';

/** `icon` is the item's drawing (menu-icons), rendered on the server (Header). */
export type MenuItem = { id: MenuId; label: string; icon: ReactNode };
type MenuProps = { items: MenuItem[]; label: string };

/** The about ring has nearly filled the screen with gold from this point of its tail (spec 5.2). */
const ON_GOLD_OUT = 0.6;

/** The current menu item is the current scene; the hero means no current item. */
const currentOf = (frames: Map<SceneId, SceneFrame>, y: number): MenuId | null => {
  const id = currentScene(frames, y);
  return id && id !== 'hero' ? id : null;
};

/**
 * The section menu. Marks the section in view with `aria-current` and a gold marker that follows it (or, with a
 * mouse, the hovered item), shows progress through that section, and tells the header when it sits on gold.
 * Clicks need no handler here: EngineProvider turns every in-page scene link into a scene jump.
 */
export function Menu({ items, label }: MenuProps) {
  const nav = useRef<HTMLElement>(null);
  const hovered = useRef<MenuId | null>(null);
  const [current, setCurrent] = useState<MenuId | null>(null);
  const currentRef = useRef(current);
  const placeLater = useRef<() => void>(() => undefined);

  // the marker goes where the target link is, measured in the frame after its state changed
  useEffect(() => {
    const el = nav.current;
    if (!el) return;
    const place = (): void => {
      const target = hovered.current ?? currentRef.current;
      const link = target ? el.querySelector<HTMLElement>(`a[href="#${target}"]`) : null;
      el.toggleAttribute('data-marked', Boolean(link));
      if (!link) return;
      // offsets are physical (left to right) in both directions, so the marker is placed physically too
      el.style.setProperty('--marker-x', `${link.offsetLeft}px`);
      el.style.setProperty('--marker-w', `${link.offsetWidth}px`);
    };
    let frame = 0;
    const later = (): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    placeLater.current = later;
    const enter = (event: PointerEvent): void => {
      const link = (event.target as Element).closest?.<HTMLAnchorElement>('a[href^="#"]');
      // the stacked page has no current section, so it has no marker either
      if (event.pointerType !== 'mouse' || !link || !document.documentElement.classList.contains('enhanced'))
        return;
      hovered.current = link.hash.slice(1) as MenuId;
      later();
    };
    const leave = (): void => {
      hovered.current = null;
      later();
    };
    // fonts and the phone layout change link widths
    const resize = new ResizeObserver(later);
    resize.observe(el);
    el.addEventListener('pointerover', enter);
    el.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(frame);
      placeLater.current = () => undefined;
      resize.disconnect();
      el.removeEventListener('pointerover', enter);
      el.removeEventListener('pointerleave', leave);
    };
  }, []);
  useEffect(() => {
    currentRef.current = current;
    placeLater.current();
  }, [current]);

  useLayoutEffect(() => {
    const el = nav.current;
    const header = el?.closest('header');
    if (!el || !header) return;
    let progress = '';
    const unsubscribe = engine.subscribe((frames, scroll) => {
      const next = currentOf(frames, scroll.y);
      setCurrent(next);
      const value = next ? (frames.get(next)?.progress ?? 0).toFixed(3) : '0';
      if (value !== progress) {
        progress = value;
        el.style.setProperty('--section-p', value);
      }
      const onGold =
        (frames.get('about')?.out ?? 0) > ON_GOLD_OUT || sceneState(frames.get('contact')) === 'active';
      if (header.hasAttribute('data-on-gold') !== onGold) {
        if (onGold) header.setAttribute('data-on-gold', 'true');
        else header.removeAttribute('data-on-gold');
      }
    });
    // in the stacked layout no scene is current; the engine is stopped and reports nothing
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reset = (): void => {
      if (!reduced.matches) return;
      hovered.current = null;
      progress = '';
      for (const name of ['--section-p', '--marker-x', '--marker-w']) el.style.removeProperty(name);
      el.removeAttribute('data-marked');
      setCurrent(null);
      header.removeAttribute('data-on-gold');
    };
    reduced.addEventListener('change', reset);
    return () => {
      unsubscribe();
      reduced.removeEventListener('change', reset);
    };
  }, []);

  return (
    <nav ref={nav} aria-label={label} data-menu>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-label={item.label}
          aria-current={item.id === current ? 'true' : undefined}
        >
          {item.icon}
          <span>{item.label}</span>
        </a>
      ))}
      <i data-marker aria-hidden="true" />
    </nav>
  );
}
