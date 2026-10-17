import type { ReactNode } from 'react';

type IconProps = { className?: string };

/** One 20 x 20 line icon. Never mirrored in right-to-left, so it carries no direction of its own. */
const make = (paths: ReactNode) =>
  function Icon({ className }: IconProps) {
    return (
      <svg
        viewBox="0 0 20 20"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {paths}
      </svg>
    );
  };

export const icons = {
  // prototype app.js 171 pin
  Pin: make(
    <>
      <path d="M10 18s6-5.3 6-10a6 6 0 0 0-12 0c0 4.7 6 10 6 10z" />
      <circle cx="10" cy="8" r="2.2" />
    </>,
  ),
  // prototype app.js 172 cal
  Calendar: make(
    <>
      <rect x="3" y="4.5" width="14" height="12" rx="2" />
      <path d="M3 8.5h14M7 3v3M13 3v3" />
    </>,
  ),
  // prototype app.js 173 tag
  Tag: make(
    <>
      <path d="M3 10V4h6l8 8-6 6z" />
      <circle cx="7" cy="7.5" r="1" />
    </>,
  ),
  // prototype app.js 174 box
  Box: make(
    <>
      <path d="M10 2.5l7 4v7l-7 4-7-4v-7z" />
      <path d="M3 6.5l7 4 7-4M10 10.5v7" />
    </>,
  ),
  // prototype app.js 179 globe
  Globe: make(
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M3 10h14M10 3c2.5 2.5 2.5 11.5 0 14M10 3c-2.5 2.5-2.5 11.5 0 14" />
    </>,
  ),
  // prototype app.js 180 clock
  Clock: make(
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4.3l2.7 1.7" />
    </>,
  ),
  // prototype app.js 248 CODE
  Code: make(
    <>
      <path d="M7 6l-4 4 4 4M13 6l4 4-4 4M11.5 4l-3 12" />
    </>,
  ),
  // prototype app.js 249 PEN
  Pen: make(
    <>
      <path d="M4 16l1-4 9-9 3 3-9 9zM12.5 4.5l3 3" />
    </>,
  ),
  // prototype app.js 250 ROCKET
  Rocket: make(
    <>
      <path d="M10 2.5c3 2 4.5 5 4.5 8.500l-2 2h-5l-2-2c0-3.500 1.500-6.500 4.500-8.500zM8 15.500v2M12 15.500v2M10 15.500v2.500" />
      <circle cx="10" cy="8.500" r="1.500" />
    </>,
  ),
  // prototype app.js 258 LOOP_ICONS[0]
  Bulb: make(
    <>
      <path d="M10 2.800a5 5 0 0 0-3 9v2.200h6v-2.200a5 5 0 0 0-3-9zM8 17h4M10 9v5" />
    </>,
  ),
  // prototype app.js 261 LOOP_ICONS[3]
  Database: make(
    <>
      <ellipse cx="10" cy="5" rx="6" ry="2.300" />
      <path d="M4 5v10c0 1.300 2.700 2.300 6 2.300s6-1 6-2.300V5M4 10c0 1.300 2.700 2.300 6 2.300s6-1 6-2.300" />
    </>,
  ),
  // prototype app.js 262 LOOP_ICONS[4]
  CheckCircle: make(
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M6.800 10.200l2.200 2.200 4.200-4.600" />
    </>,
  ),
  // prototype app.js 278 (process station tick)
  Tick: make(<path d="M5.5 10.4l3 3 6-6.6" />),
  // prototype app.js 265 LOOP_ICONS[6]
  Pulse: make(
    <>
      <path d="M2 10h4l2-5 3.500 10 2-5H18" />
    </>,
  ),
  // prototype app.js none: not in prototype app.js (arrow up-right, authored for the visit/CTA links)
  Arrow: make(
    <>
      <path d="M6 14L14 6M7.5 6H14v6.5" />
    </>,
  ),
};
