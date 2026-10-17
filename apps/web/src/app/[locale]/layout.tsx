import { dirOf, getHome, isLocale, LOCALES } from '@zakydev/shared';
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { body, bodyAr, display, displayAr, mono } from '@/lib/fonts';
import { siteUrl } from '@/lib/site';
import { headScript } from '@/lib/theme-script';
import '../globals.css';
import './home.css';

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));
// `cover` lets the phone menu bar read the home-indicator inset (env(safe-area-inset-bottom)).
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

/** `blocking` is not in React's types yet. */
const RENDER_BLOCKING = { blocking: 'render' } as Record<string, string>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { seo } = getHome(locale);
  // the page adds the sharing card (Open Graph, Twitter): page.tsx
  return {
    metadataBase: new URL(siteUrl),
    title: seo.title,
    description: seo.description,
    alternates: { canonical: `/${locale}`, languages: { en: '/en', ar: '/ar', 'x-default': '/en' } },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const fonts = [
    display.variable,
    body.variable,
    mono.variable,
    ...(locale === 'ar' ? [displayAr.variable, bodyAr.variable] : []),
  ].join(' ');
  return (
    <html lang={locale} dir={dirOf(locale)} className={fonts} suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static string defined in this repo, must run before paint */}
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
        {/* The pinned hero is centred, so a first paint of a half-parsed hero would shift as the rest arrives: hold the
            first paint until the hero is parsed (where supported; elsewhere it is ignored) */}
        <link rel="expect" href="#work" {...RENDER_BLOCKING} />
      </head>
      <body>{children}</body>
    </html>
  );
}
