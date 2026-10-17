import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { dirOf, getHome, isLocale, LOCALES, type Locale } from '@zakydev/shared';
import satori from 'satori';
import { FULL } from '@/components/Mark';
import { OG_SIZE, OG_TYPE } from '@/lib/og';

/*
 * The sharing image, rendered at build time with satori + resvg instead of next/og: the satori inside Next 16.4 can
 * neither join Arabic letters nor lay out right to left. Fonts are committed TTFs (assets/og, OFL), read from disk.
 */

const PAD = 80;
const MARK = 64;
/** The dark theme's tokens (globals.css); satori cannot read CSS variables. */
const COLOR = { ground: '#0F0E0C', ink: '#F3EFE6', gold: '#D4AF37', muted: '#A8A192' };
/** Per locale: the face and the headline's size, line height and tracking (as in hero.css; satori draws nothing for
 * `letter-spacing: normal`, so Arabic says 0em). */
const TYPE: Record<Locale, { family: string; size: number; lineHeight: number; tracking: string }> = {
  en: { family: 'Fraunces', size: 104, lineHeight: 1, tracking: '-0.035em' },
  ar: { family: 'Amiri', size: 76, lineHeight: 1.32, tracking: '0em' },
};

const font = (file: string) => readFile(join(process.cwd(), 'assets/og', file));
const [fraunces, amiri, geistMono] = await Promise.all([
  font('Fraunces72pt-SemiBold.ttf'),
  font('Amiri-Bold.ttf'),
  font('GeistMono-Regular.ttf'),
]);
const FONTS = [
  { name: 'Fraunces', data: fraunces, weight: 600, style: 'normal' },
  { name: 'Amiri', data: amiri, weight: 700, style: 'normal' },
  { name: 'Geist Mono', data: geistMono, weight: 400, style: 'normal' },
] as const;

// Route handlers get no params from the layout, so without this the card would render on request, not at build time.
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));
export const size = OG_SIZE;
export const contentType = OG_TYPE;
// Alt text is per locale, which a module-level `alt` cannot be, so the page lists this image itself
// (lib/og.ts sharingMetadata). generateImageMetadata could carry it, but Next 16.4 then renders the card on request
// instead of at build time: its generated generateStaticParams fills only the image id, never [locale].

function Card({ locale }: { locale: Locale }) {
  const { hero, site } = getHome(locale);
  const type = TYPE[locale];
  // satori shifts a padded right-to-left box by its padding, so only the headline rows carry `dir`, and the column
  // is pushed to the start side (the right in Arabic) by alignment instead
  const start = dirOf(locale) === 'rtl' ? 'flex-end' : 'flex-start';
  const stroke = {
    fill: 'none',
    strokeWidth: FULL.width,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        // satori's default is content-box, which would add the padding to the full height
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: start,
        padding: PAD,
        background: COLOR.ground,
        color: COLOR.ink,
      }}
    >
      <svg width={MARK} height={MARK} viewBox="0 0 64 64" aria-hidden="true">
        <path d={FULL.upper} stroke={COLOR.ink} {...stroke} />
        <path d={FULL.lower} stroke={COLOR.gold} {...stroke} />
      </svg>
      {/* one box per word: satori orders whole boxes right to left, but not inline runs inside one line */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: start,
          fontFamily: type.family,
          fontSize: type.size,
        }}
      >
        {hero.headline.map((line) => (
          <div
            key={line.map((w) => w.t).join(' ')}
            dir={dirOf(locale)}
            style={{
              display: 'flex',
              columnGap: '0.24em',
              lineHeight: type.lineHeight,
              letterSpacing: type.tracking,
            }}
          >
            {line.map((word) => (
              <span key={word.t} style={{ color: word.gold ? COLOR.gold : COLOR.ink }}>
                {word.t}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', fontFamily: 'Geist Mono', fontSize: 30, color: COLOR.muted }}>
        {site.domain}
      </div>
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const svg = await satori(<Card locale={isLocale(locale) ? locale : 'en'} />, {
    ...OG_SIZE,
    fonts: FONTS.map((f) => ({ ...f })),
  });
  const png = new Resvg(svg, { font: { loadSystemFonts: false } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'content-type': OG_TYPE } });
}
