import { type BrowserContext, expect, type Page } from '@playwright/test';
import { gotoScene, settle, test } from './helpers';

/**
 * AA guard over the WebGL background (spec 5.8; deferred from Task 11). Text that sits directly on the background,
 * with no surface of its own, must reach 4.5:1 (3:1 when large) against what is really rendered around its glyphs:
 * the shader, the page-colour halo and anything else behind them. Method of Task 11's measurement (task-11-report.md,
 * "Fix round (pre-review)"): one shot of the page with every text fill transparent, one glyph mask per layer of
 * non-overlapping elements, and per element the background pixels within RING px of its glyphs. The darkest of them
 * (the worst contrast) decides: spec 5.8, never below AA. WCAG's understanding of 1.4.3 counts a halo that fills the
 * letters' counters as the text's background.
 * The shader runs on software GL only with `?bg=soft`, and `?freeze=1` holds its clock still.
 */

/**
 * The scene positions of Task 11's shoot (hero, first project, first step, the ring at mid-loop), and the last step,
 * where the build drawing shows its LIVE badge.
 */
const SCENES: Array<[string, number]> = [
  ['hero', 0],
  ['work', 0.167],
  ['process', 0.23],
  ['process', 0.95],
  ['about', 0.5],
];
/** Background pixels this close to a glyph (Chebyshev distance) count. */
const RING = 1;
/** The share of a ring's pixels that may fall short: none. */
const TAIL = 0;
const GLYPH = '#f0f';
/** A background this opaque is the text's own surface; anything lighter is a veil the shader shows through. */
const OPAQUE = 0.95;
/** Text fills off: HTML text by its colour, SVG text by its fill and stroke. */
const NO_TEXT =
  '*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important} text,tspan{fill:transparent!important;stroke:transparent!important}';

type Item = {
  i: number;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rgb: number[];
  large: boolean;
  svg: boolean;
};
type Result = { text: string; contrast: number; need: number; svg: boolean } | null;

/**
 * Every text element on screen with the shader behind it, HTML and SVG `<text>` alike; marks each with `data-ci`. A
 * surface counts as the text's own background only when it is (nearly) opaque: translucent veils (the diagram card,
 * the tool chips, the fact cards) are measured through, as rendered.
 */
const collect = (page: Page): Promise<Item[]> =>
  page.evaluate((opaque) => {
    const onBackground = (el: Element): boolean => {
      for (let e: Element | null = el; e && e !== document.body; e = e.parentElement) {
        const s = getComputedStyle(e);
        const alpha = s.backgroundColor.match(/[\d.]+/g);
        if (alpha && (alpha.length < 4 ? 1 : Number(alpha[3])) >= opaque) return false;
        if (s.backgroundImage !== 'none' && e !== document.documentElement) return false;
      }
      return true;
    };
    /** SVG text paints with `fill`, at the drawing's scale. */
    const svgScale = (el: Element): number =>
      el instanceof SVGGraphicsElement ? (el.getScreenCTM()?.a ?? 1) : 1;
    const opacity = (el: Element): number => {
      let o = 1;
      for (let e: Element | null = el; e; e = e.parentElement) o *= Number(getComputedStyle(e).opacity);
      return o;
    };
    const items: Item[] = [];
    for (const el of document.querySelectorAll('main *, header *')) {
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim())) continue;
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      if (r.width < 2 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
      // hidden, fading out of view, or on a surface of its own: the shader is not what is behind it
      if (s.visibility !== 'visible' || opacity(el) < 0.9 || !onBackground(el)) continue;
      const svg = el instanceof SVGElement;
      const fill = svg
        ? s.fill
        : s.webkitTextFillColor && !s.webkitTextFillColor.endsWith(', 0)')
          ? s.webkitTextFillColor
          : s.color;
      const size = Number.parseFloat(s.fontSize) * svgScale(el);
      const i = items.length;
      el.setAttribute('data-ci', String(i));
      items.push({
        i,
        text: el.textContent?.trim().slice(0, 28) ?? '',
        ...{ x: r.left, y: r.top, w: r.width, h: r.height },
        rgb: (fill.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number),
        large: size >= 24 || (Number(s.fontWeight) >= 700 && size >= 18.66),
        svg,
      });
    }
    return items;
  }, OPAQUE);

/** Elements whose boxes overlap go into different layers, so each glyph mask holds only its own glyphs. */
const layersOf = (items: Item[]): Item[][] => {
  const near = (a: Item, b: Item): boolean =>
    a.x - 4 < b.x + b.w + 4 && b.x - 4 < a.x + a.w + 4 && a.y - 4 < b.y + b.h + 4 && b.y - 4 < a.y + a.h + 4;
  const layers: Item[][] = [];
  for (const it of items) {
    const layer = layers.find((l) => l.every((o) => !near(o, it)));
    if (layer) layer.push(it);
    else layers.push([it]);
  }
  return layers;
};

/** Per element: the contrast its ring of background pixels reaches at the TAIL percentile. Runs in a blank page. */
const analyse = (helper: Page, glyphs: Buffer, scene: Buffer, items: Item[]): Promise<Result[]> =>
  helper.evaluate(
    async ([g64, b64, boxes, ring, tail]) => {
      const load = async (b: string) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b}`;
        await img.decode();
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const x = c.getContext('2d') as CanvasRenderingContext2D;
        x.drawImage(img, 0, 0);
        return { w: c.width, h: c.height, d: x.getImageData(0, 0, c.width, c.height).data };
      };
      const [G, B] = await Promise.all([load(g64), load(b64)]);
      const lin = (byte: number) => {
        const v = byte / 255;
        return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };
      const lum = (r: number, g: number, b: number) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      return boxes.map((bx) => {
        const x0 = Math.max(0, Math.floor(bx.x) - 3);
        const y0 = Math.max(0, Math.floor(bx.y) - 3);
        const W = Math.min(G.w, Math.ceil(bx.x + bx.w) + 3) - x0;
        const H = Math.min(G.h, Math.ceil(bx.y + bx.h) + 3) - y0;
        if (W <= 0 || H <= 0) return null;
        const mask = new Uint8Array(W * H);
        for (let y = 0; y < H; y++)
          for (let x = 0; x < W; x++) {
            const k = ((y0 + y) * G.w + x0 + x) * 4;
            mask[y * W + x] =
              (G.d[k] ?? 0) > 170 && (G.d[k + 2] ?? 0) > 170 && (G.d[k + 1] ?? 255) < 100 ? 1 : 0;
          }
        const lt = lum(bx.rgb[0] ?? 0, bx.rgb[1] ?? 0, bx.rgb[2] ?? 0);
        const ratios: number[] = [];
        const touches = (x: number, y: number) => {
          for (let dy = -ring; dy <= ring; dy++)
            for (let dx = -ring; dx <= ring; dx++) {
              const xx = x + dx;
              const yy = y + dy;
              if (xx >= 0 && xx < W && yy >= 0 && yy < H && mask[yy * W + xx]) return true;
            }
          return false;
        };
        for (let y = 0; y < H; y++)
          for (let x = 0; x < W; x++) {
            if (mask[y * W + x] || !touches(x, y)) continue;
            const k = ((y0 + y) * B.w + x0 + x) * 4;
            const lb = lum(B.d[k] ?? 0, B.d[k + 1] ?? 0, B.d[k + 2] ?? 0);
            ratios.push((Math.max(lt, lb) + 0.05) / (Math.min(lt, lb) + 0.05));
          }
        // no glyphs found: nothing to measure
        if (ratios.length === 0) return null;
        ratios.sort((a, b) => a - b);
        return {
          text: bx.text,
          contrast: ratios[Math.floor(ratios.length * tail)] ?? 0,
          need: bx.large ? 3 : 4.5,
          svg: bx.svg,
        };
      });
    },
    [glyphs.toString('base64'), scene.toString('base64'), items, RING, TAIL] as const,
  );

/** The shots one scene position needs, and every element's result. */
const measureScene = async (page: Page, helper: Page): Promise<Result[]> => {
  await settle(page);
  // looping CSS animations (the gold element's bob, the drawings) are cancelled to their resting style, as the visual
  // snapshots' `animations: 'disabled'` does: a decoration in motion passing over a label (the map pin's drop) is not
  // the label's background, and the same frame is measured in every run
  await page.evaluate(() => {
    for (const a of document.getAnimations())
      if (a.effect?.getComputedTiming().iterations === Infinity) a.cancel();
  });
  const items = await collect(page);
  const bare = await page.addStyleTag({ content: NO_TEXT });
  const scene = await page.screenshot({ scale: 'css' });
  await bare.evaluate((el) => (el as Element).remove());
  const results: Result[] = [];
  for (const layer of layersOf(items)) {
    const selector = layer.map((it) => `[data-ci="${it.i}"],[data-ci="${it.i}"]::before`).join(',');
    const paint = await page.addStyleTag({
      content: `${NO_TEXT} *,*::before,*::after{text-shadow:none!important;caret-color:transparent!important} ${selector}{color:${GLYPH}!important;-webkit-text-fill-color:${GLYPH}!important;fill:${GLYPH}!important}`,
    });
    results.push(...(await analyse(helper, await page.screenshot({ scale: 'css' }), scene, layer)));
    await paint.evaluate((el) => (el as Element).remove());
  }
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('[data-ci]')) el.removeAttribute('data-ci');
  });
  return results;
};

// device pixels as CSS pixels, as in Task 11's measurement: the glyph boxes and the shots then share one grid
test.use({ deviceScaleFactor: 1 });

const blankPage = async (context: BrowserContext): Promise<Page> => {
  const helper = await context.newPage();
  await helper.goto('about:blank');
  return helper;
};

for (const path of ['/', '/ar']) {
  for (const theme of ['dark', 'light']) {
    test(`text on the background keeps AA contrast: ${path} ${theme}`, async ({ page, context }) => {
      test.setTimeout(120_000);
      await page.addInitScript((t) => localStorage.setItem('zk-theme', t), theme);
      await page.goto(`${path}?bg=soft&freeze=1`);
      const canvas = page.locator('canvas[data-bg]');
      await expect(canvas).toHaveCount(1, { timeout: 10_000 });
      const noWebGL = await canvas.evaluate((el) => (el as HTMLCanvasElement).hidden === true);
      // a local browser without WebGL skips; in CI the guard must really run, so a missing shader fails there
      expect(noWebGL && Boolean(process.env.CI), 'the shader runs in CI').toBe(false);
      test.skip(noWebGL, 'no WebGL in this browser');
      const helper = await blankPage(context);
      const below: string[] = [];
      let checked = 0;
      let drawn = 0;
      for (const [id, f] of SCENES) {
        await gotoScene(page, id, f);
        for (const r of await measureScene(page, helper)) {
          if (!r) continue;
          checked++;
          if (r.svg) drawn++;
          if (r.contrast < r.need) below.push(`${id}: "${r.text}" ${r.contrast.toFixed(2)} < ${r.need}`);
        }
      }
      expect(checked, 'text elements measured').toBeGreaterThan(10);
      expect(drawn, 'SVG text measured (the diagram labels, the LIVE badge)').toBeGreaterThan(0);
      expect(below).toEqual([]);
    });
  }
}
