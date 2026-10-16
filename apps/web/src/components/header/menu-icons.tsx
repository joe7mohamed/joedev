import type { CSSProperties, ReactNode } from 'react';

export type MenuId = 'work' | 'process' | 'about' | 'contact';

/**
 * The four menu icons (prototype app.js 231–236). Their parts carry the hooks for the animations in
 * header.css: `data-pop` parts scale in one after another (`--i` is the order), `data-draw` paths draw
 * themselves, `data-flap` is the envelope flap. Never mirrored in right-to-left.
 */
function Frame({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const pop = (order: number) => ({ 'data-pop': true, style: { '--i': order } as CSSProperties });

const drawings: Record<MenuId, ReactNode> = {
  work: (
    <>
      <rect x="3" y="3" width="6" height="6" rx="1.5" {...pop(0)} />
      <rect x="11" y="3" width="6" height="6" rx="1.5" {...pop(1)} />
      <rect x="11" y="11" width="6" height="6" rx="1.5" {...pop(2)} />
      <rect x="3" y="11" width="6" height="6" rx="1.5" {...pop(3)} />
    </>
  ),
  process: (
    <>
      <circle cx="4.5" cy="5" r="2" {...pop(0)} />
      <path data-draw pathLength={1} d="M6.5 5h6a2.5 2.5 0 0 1 0 5h-5a2.5 2.5 0 0 0 0 5h6" />
      <circle cx="15.5" cy="15" r="2" {...pop(3)} />
    </>
  ),
  about: (
    <>
      <circle cx="10" cy="7" r="3.2" {...pop(0)} />
      <path data-draw pathLength={1} d="M3.5 17c.8-3.4 3.4-5 6.5-5s5.7 1.6 6.5 5" />
    </>
  ),
  contact: (
    <>
      <rect x="3" y="5" width="14" height="10" rx="2" />
      <path data-flap d="M3.5 6.5l6.5 5 6.5-5" />
    </>
  ),
};

export function MenuIcon({ id }: { id: MenuId }) {
  return <Frame>{drawings[id]}</Frame>;
}
