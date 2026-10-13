
# MOTION-AND-LIBRARIES.md

## A) Effect → tool

| Effect | Tool | Reason |
|---|---|---|
| Focus, hover, cursor, dock | CSS | Small, direct state changes |
| Dialog/sheet entrances | tw-animate-css | shadcn state attributes |
| Reveal, stagger, presence | Motion | Coordinated DOM animation |
| Magnetism, tilt, rail | Motion values | Avoid frame-by-frame React renders |
| Route crossfade | React ViewTransition | Native snapshots |
| Theme circle | CSS + browser View Transition API | Clip snapshot, preserve layout |
| Core | R3F | Procedural geometry |
| Reading, validation, reduced-motion transforms | None | Immediate comprehension |

Use `motion/react`, `m`, and LazyMotion; never mix a second animation runtime. [Motion reference](https://motion.dev/docs/react-lazy-motion).

## B) File layout

Under `apps/web/src`: `app/globals.css`; `lib/motion.ts`; `components/ui`; `features/{hero,os,terminal,projects,contact}`. Pages remain Server Components; interaction lives in client leaves. Messages/MDX remain inside `apps/web`; shared schemas contain no React. Browser→Next Server Actions→NestJS API.

Pinned system: Next 16.3, React 19.3, Tailwind 4.3, shadcn 4, Motion 13, R3F 9/drei 10, cmdk, next-intl 4, next-themes, content-collections; NestJS 12.

### `app/globals.css`

Import once. Font variables come from `next/font`.

```css
@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:where(.dark,.dark *));

:root {
  --gold-200:#F0D27A; --gold-300:#E5C158;
  --gold-400:#D4AF37; --gold-500:#B8962E;
  --gold-600:#A67C00; --gold-700:#8A6D1F; --gold-800:#7A5F14;
  --background:#FAF9F6; --surface:#FFFFFF; --elevated:#FFFFFF;
  --border:#E4E0D6; --foreground:#14120E; --muted-foreground:#625E55;
  --accent:#8A6D1F; --accent-strong:#7A5F14;
  --accent-graphic:#A67C00; --ring:var(--accent-graphic);
  --accent-fill:#D4AF37; --accent-ink:#0F0E0C;
  --accent-line:#D4AF37b3;
  --success:oklch(.52 .14 150); --destructive:oklch(.52 .20 25);
  --surface-glass:color-mix(in srgb,var(--surface) 72%,transparent);
  --shadow-chrome:0 8px 32px #00000029;
  --shadow-window:0 24px 64px #0000003d;
  --radius:10px;
}
.dark {
  --background:#0F0E0C; --surface:#171613; --elevated:#211F1A;
  --border:#2A2823; --foreground:#F6F4EF; --muted-foreground:#A8A49A;
  --accent:#D4AF37; --accent-strong:#E5C158;
  --accent-graphic:#D4AF37; --accent-line:#D4AF378c;
  --success:oklch(.72 .14 150); --destructive:oklch(.62 .20 25);
  --shadow-chrome:0 8px 32px #00000052;
  --shadow-window:0 24px 64px #0000007a;
}
@theme inline {
  --color-background:var(--background);
  --color-surface:var(--surface);
  --color-elevated:var(--elevated);
  --color-border:var(--border);
  --color-foreground:var(--foreground);
  --color-muted-foreground:var(--muted-foreground);
  --color-accent:var(--accent);
  --color-accent-strong:var(--accent-strong);
  --color-accent-graphic:var(--accent-graphic);
  --color-accent-line:var(--accent-line);
  --color-accent-fill:var(--accent-fill);
  --color-accent-ink:var(--accent-ink);
  --color-ring:var(--ring);
  --color-success:var(--success);
  --color-destructive:var(--destructive);
  --color-primary:var(--accent-fill);
  --color-primary-foreground:var(--accent-ink);
  --color-card:var(--surface);
  --color-card-foreground:var(--foreground);
  --color-popover:var(--elevated);
  --color-popover-foreground:var(--foreground);
  --color-secondary:var(--surface);
  --color-secondary-foreground:var(--foreground);
  --color-muted:var(--elevated);
  --color-accent-foreground:var(--accent-ink);
  --font-sans:var(--font-geist);
  --font-mono:var(--font-geist-mono);
  --radius-sm:6px; --radius-md:var(--radius);
  --radius-lg:14px; --radius-xl:20px; --radius-window:16px;
}
body { background:var(--background); color:var(--foreground); }
:lang(ar) { font-family:var(--font-plex-arabic),sans-serif; letter-spacing:0; }
@media (max-width:767px) {
  [data-reveal] { transform:none!important; }
}
```

Restyle shadcn’s default `bg-accent` selections to `bg-surface` with foreground text and an accent-graphic indicator.

### `lib/motion.ts`

Append snippet 3 here. Move hook exports here; keep JSX in component files.

```ts
'use client';
import {useRef,type PointerEvent} from 'react';
import {
  useMotionValue,useSpring,useTransform,useScroll,useReducedMotion
} from 'motion/react';

export const stagger=(count:number)=>({
  hidden:{},
  visible:{transition:{staggerChildren:count<=6?.04:0}}
});

function usePointerPair(limit:number) {
  const reduced=useReducedMotion();
  const x=useMotionValue(0), y=useMotionValue(0);
  const sx=useSpring(x,{stiffness:260,damping:24});
  const sy=useSpring(y,{stiffness:260,damping:24});
  const reset=()=>{x.set(0);y.set(0);};
  return {
    x:sx,y:sy,onPointerLeave:reset,onBlur:reset,
    onPointerMove(e:PointerEvent<HTMLElement>) {
      if(reduced!==false || innerWidth<768 ||
        !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
      const r=e.currentTarget.getBoundingClientRect();
      const clamp=(v:number)=>Math.max(-1,Math.min(1,v));
      x.set(clamp((e.clientX-r.left)/r.width*2-1)*limit);
      y.set(clamp((e.clientY-r.top)/r.height*2-1)*limit);
    }
  };
}
export function useMagnetic(){return usePointerPair(6);}
export function usePointerTilt(){
  const p=usePointerPair(4);
  const rotateX=useTransform(p.y,v=>-v);
  return {
    rotateX,rotateY:p.x,onPointerMove:p.onPointerMove,
    onPointerLeave:p.onPointerLeave,onBlur:p.onBlur
  };
}
export function useScrollRail(){
  const ref=useRef<HTMLDivElement>(null);
  const {scrollYProgress}=useScroll({
    target:ref,offset:['start end','end start']
  });
  const scaleY=useTransform(scrollYProgress,[0,1],[0,1]);
  const reduced=useReducedMotion();
  return {ref,scaleY:reduced?1:scaleY};
}
```

These hooks combine [springs](https://motion.dev/docs/react-use-spring) and [scroll motion values](https://motion.dev/docs/react-use-scroll).

### `features/hero/HeroCore.tsx`

Structure: server Hero→poster/client gate→error boundary→Suspense→HeroCore→Canvas→Scene.

Gate before importing: WebGL2, viewport≥768, no reduced motion, no Save-Data, `(deviceMemory??8)>=4`. Schedule import at idle or 1500ms, whichever occurs first; cancel both on exit/unmount, reschedule on re-entry. Runtime reduced-motion changes restore the poster.

Canvas: `dpr={[1,1.5]}`, `frameloop="demand"`, `gl={{powerPreference:'low-power',antialias:true}}`. Scene uses snippet 10; every frame callback checks `active`.

Sphere material: `<MeshTransmissionMaterial color="#171613" transmission={.85} thickness={.8} roughness={.18} ior={1.45} samples={4} resolution={128} backside={false} chromaticAberration={0} distortion={0} />`. Use one directional light, procedural Environment, LineSegments lattice, no postprocessing. [Material reference](https://drei.docs.pmnd.rs/shaders/mesh-transmission-material).

Use Float with `enabled={active&&!docked}`, `autoInvalidate={false}`, `speed={.4}`, `floatIntensity={.15}`. PerformanceMonitor mounts only while active; `onDecline` lowers DPR to 1; `flipflops={2}`/`onFallback` restores poster. [Float](https://drei.docs.pmnd.rs/staging/float), [monitor](https://drei.docs.pmnd.rs/performances/performance-monitor).

Dock targets: Interface `[-1.3,0,0]`, Logic `[0,0,0]`, Data `[1.3,0,0]`; sphere recedes to z=−1, scale .65. In `useFrame`, lerp preallocated vectors using `1-Math.exp(-10*Math.min(delta,.05))`. Hover/HTML toggle changes targets; no canvas click actions. Preserve poster until first successful frame; errors/context loss restore it.

## C) Ten snippets

Client examples belong under `Preferences`→`MotionRoot`. Snippets 5–7 import the preceding hooks.

### 1. LazyMotion

```tsx
'use client';
import {LazyMotion,domAnimation} from 'motion/react';
import type {ReactNode} from 'react';
export function MotionRoot({children}:{children:ReactNode}){
  return <LazyMotion features={domAnimation} strict>
    {children}
    <noscript><style>{`
      [data-reveal]{opacity:1!important;transform:none!important}
    `}</style></noscript>
  </LazyMotion>;
}
```

### 2. Reduced-motion configuration

```tsx
'use client';
import {MotionConfig} from 'motion/react';
import {ThemeProvider} from 'next-themes';
import type {ReactNode} from 'react';
export function Preferences({children}:{children:ReactNode}){
  return <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <MotionConfig reducedMotion="user">{children}</MotionConfig>
  </ThemeProvider>;
}
```

MotionConfig disables transform animation; CSS and hook policies cover other effects. [Reference](https://www.motion.dev/docs/react-motion-config).

### 3. fadeUp

```ts
import type {Variants} from 'motion/react';
export const fadeUp:Variants={
  hidden:{opacity:0,y:12},
  visible:{opacity:1,y:0,transition:{
    duration:.6,ease:[.22,1,.36,1]
  }}
};
```

### 4. Staggered list

```tsx
'use client';
import {m} from 'motion/react';
import {fadeUp,stagger} from '@/lib/motion';
export function RevealList({items}:{items:string[]}){
  return <m.ul initial="hidden" whileInView="visible"
    viewport={{once:true,amount:.15}} variants={stagger(items.length)}>
    {items.map(item=><m.li data-reveal key={item}
      variants={fadeUp}>{item}</m.li>)}
  </m.ul>;
}
```

### 5. Magnetic button

```tsx
'use client';
import {m} from 'motion/react';
import {useMagnetic} from '@/lib/motion';
export function MagneticButton({label}:{label:string}){
  const {x,y,...events}=useMagnetic();
  return <button type="button" {...events}
    className="h-11 rounded-md bg-accent-fill px-4 text-accent-ink">
    <m.span data-motion className="inline-block" style={{x,y}}>
      {label}
    </m.span>
  </button>;
}
```

### 6. Pointer tilt

```tsx
'use client';
import {m} from 'motion/react';
import type {ReactNode} from 'react';
import {usePointerTilt} from '@/lib/motion';
export function Tilt({children}:{children:ReactNode}){
  const {rotateX,rotateY,...events}=usePointerTilt();
  return <div {...events} style={{perspective:800}}>
    <m.div data-motion style={{rotateX,rotateY}}>{children}</m.div>
  </div>;
}
```

### 7. Scroll rail

```tsx
'use client';
import {m} from 'motion/react';
import type {ReactNode} from 'react';
import {useScrollRail} from '@/lib/motion';
export function Rail({children}:{children:ReactNode}){
  const {ref,scaleY}=useScrollRail();
  return <div ref={ref} className="relative ps-6">
    <m.div aria-hidden className="absolute inset-y-0 start-0 w-px bg-accent-graphic"
      style={{scaleY,transformOrigin:'top'}}/>
    {children}
  </div>;
}
```

### 8. Next 16.3 ViewTransition

No experimental flag; Next navigation activates React transitions. [Next guide](https://nextjs.org/docs/app/guides/view-transitions).

```tsx
import {ViewTransition,type ReactNode} from 'react';
export function Shell({header,dock,children}:{
  header:ReactNode;dock:ReactNode;children:ReactNode
}){
  return <>
    <header style={{viewTransitionName:'header'}}>{header}</header>
    <ViewTransition name="page"><main>{children}</main></ViewTransition>
    <div style={{viewTransitionName:'dock'}}>{dock}</div>
  </>;
}
```

Append globally:

```css
::view-transition-group(*) { animation-duration:200ms; }
::view-transition-group(page),
::view-transition-group(header),
::view-transition-group(dock) { animation:none; }
::view-transition-old(header),::view-transition-old(dock) { display:none; }
::view-transition-new(header),::view-transition-new(dock) { animation:none; }
::view-transition-old(root),::view-transition-new(root) {
  animation:none; mix-blend-mode:normal;
}
.theme-reveal * { view-transition-name:none!important; }
@media (prefers-reduced-motion:reduce) {
  [data-motion],[data-reveal] { transform:none!important; }
  .terminal-cursor,.skeleton { animation:none!important; }
  ::view-transition-group(*) { animation:none!important; }
  ::view-transition-old(*),::view-transition-new(*) {
    animation-duration:120ms!important;
  }
}
```

### 9. Theme circular reveal

Pass localized labels; reserve space until mounted. [next-themes](https://github.com/pacocoursey/next-themes).

```tsx
'use client';
import {useEffect,useRef,useState,type MouseEvent} from 'react';
import {flushSync} from 'react-dom';
import {useTheme} from 'next-themes';
export function ThemeToggle({light,dark}:{light:string;dark:string}){
  const {resolvedTheme,setTheme}=useTheme();
  const [mounted,setMounted]=useState(false);
  const busy=useRef(false);
  useEffect(()=>setMounted(true),[]);
  if(!mounted) return <span className="inline-block size-11"/>;
  async function toggle(e:MouseEvent<HTMLButtonElement>){
    if(busy.current) return;
    const next=resolvedTheme==='dark'?'light':'dark';
    const apply=()=>flushSync(()=>setTheme(next));
    if(!document.startViewTransition ||
      matchMedia('(prefers-reduced-motion:reduce)').matches){
      apply();return;
    }
    const b=e.currentTarget.getBoundingClientRect();
    const x=e.detail?e.clientX:b.left+b.width/2;
    const y=e.detail?e.clientY:b.top+b.height/2;
    const r=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
    const root=document.documentElement;
    busy.current=true;root.classList.add('theme-reveal');
    try {
      const transition=document.startViewTransition(apply);
      await transition.ready;
      await root.animate({
        clipPath:[`circle(0px at ${x}px ${y}px)`,
          `circle(${r}px at ${x}px ${y}px)`]
      },{duration:320,easing:'cubic-bezier(.22,1,.36,1)',
        pseudoElement:'::view-transition-new(root)'}).finished;
      await transition.finished;
    } catch {} finally {
      root.classList.remove('theme-reveal');busy.current=false;
    }
  }
  return <button className="size-11" onClick={toggle}
    aria-label={resolvedTheme==='dark'?light:dark}>◐</button>;
}
```

### 10. Canvas pause hook

Call inside Scene, passing the outer hero ref. Demand rendering requires explicit invalidation. [R3F reference](https://r3f.docs.pmnd.rs/advanced/scaling-performance).

```ts
'use client';
import {useEffect,useState,type RefObject} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
export function useCanvasPause(target:RefObject<HTMLElement|null>){
  const [active,setActive]=useState(false);
  const invalidate=useThree(s=>s.invalidate);
  useEffect(()=>{
    let visible=false;
    const sync=()=>setActive(visible&&!document.hidden);
    const observer=new IntersectionObserver(([entry])=>{
      visible=entry.isIntersecting;sync();
    });
    if(target.current) observer.observe(target.current);
    document.addEventListener('visibilitychange',sync);
    return ()=>{
      observer.disconnect();
      document.removeEventListener('visibilitychange',sync);
    };
  },[target]);
  useEffect(()=>{if(active) invalidate();},[active,invalidate]);
  useFrame(()=>{if(active) invalidate();});
  return active;
}
```

## D) Performance budgets

Measure production bundles with Next’s bundle analyzer; sum gzip dependencies, not just entry chunks. Initial home JS≤180kB; complete deferred 3D≤180kB; poster≤60kB.

Lighthouse CI: three mobile runs per locale; median Performance≥.95, Accessibility/Best Practices/SEO=1, LCP≤2000ms, CLS≤.05, TBT≤200ms. Measure INP separately through interaction traces/field p75≤200ms.

Eligible-device traces: first frame≤800ms after import; steady 60fps; zero continuous offscreen rendering. Verify blocked gates request no 3D. Test navigation, locale switch, history, reduced motion; disable route transitions if any fail.

## E) RTL and Arabic

Use logical layout and DOM reading order. Flip semantic X entrances/arrows; preserve physical pointer coordinates, Y movement, rotation, and mark orientation. Arabic reveals use whole words, never characters; preserve shaping and spaces. Terminal chrome/commands remain LTR; output uses `dir="auto"`. Use `numberingSystem:'latn'` with next-intl; isolate Latin identifiers using `<bdi>`.

## F) Anti-patterns

- No per-component CSS files.
- No width/height animation.
- No animated box-shadow.
- No scroll-jacking or Lenis.
- No preloader.
- No GSAP.
- No `framer-motion` imports.
- No xterm.
- No Spline.
- No eager WebGL imports.
- No React state updates per frame.
- No hidden essential content or character-split Arabic.
