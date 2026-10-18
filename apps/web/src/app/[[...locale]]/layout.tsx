import { DEFAULT_LOCALE, dirOf, getHome, LOCALES } from '@zakydev/shared';
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { preload } from 'react-dom';
import { KeepRootState } from '@/components/KeepRootState';
import { headlineFace } from '@/fonts/display';
import { body, bodyAr, mono } from '@/lib/fonts';
import { homePath, localeOf, segmentsOf } from '@/lib/home-path';
import { siteUrl } from '@/lib/site';
import { headScript } from '@/lib/theme-script';
import '../globals.css';
import './home.css';

// The two home pages: English at the root (no segment) and Arabic at /ar. Every other address, /en and /fr among
// them, is no page: a 404 (global-not-found.tsx), or the /en redirect, which runs before routing.
export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale: segmentsOf(locale) }));
// `cover` lets the phone menu bar read the home-indicator inset (env(safe-area-inset-bottom)).
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

/** `blocking` is not in React's types yet. */
const RENDER_BLOCKING = { blocking: 'render' } as Record<string, string>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string[] }>;
}): Promise<Metadata> {
  const locale = localeOf((await params).locale);
  if (!locale) return {};
  const { seo } = getHome(locale);
  // the page adds the sharing card (Open Graph, Twitter): page.tsx
  return {
    metadataBase: new URL(siteUrl),
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: homePath(locale),
      languages: { en: homePath('en'), ar: homePath('ar'), 'x-default': homePath(DEFAULT_LOCALE) },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale?: string[] }>;
}) {
  const locale = localeOf((await params).locale);
  if (!locale) notFound();
  // the headline's display face, this locale's only (fonts/display.ts)
  preload(headlineFace[locale], { as: 'font', type: 'font/woff2', crossOrigin: '' });
  const fonts = [body.variable, mono.variable, ...(locale === 'ar' ? [bodyAr.variable] : [])].join(' ');
  return (
    <html lang={locale} dir={dirOf(locale)} className={fonts} suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static string defined in this repo, must run before paint */}
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
        {/* The pinned hero is centred, so a first paint of a half-parsed hero would shift as the rest arrives: hold the
            first paint until the hero is parsed (where supported; elsewhere it is ignored) */}
        <link rel="expect" href="#work" {...RENDER_BLOCKING} />
      </head>
      <body>
        <KeepRootState reactClasses={fonts} />
        {children}
      </body>
    </html>
  );
}
