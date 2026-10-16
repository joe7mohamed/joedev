import { dirOf, getHome, isLocale, LOCALES } from '@zakydev/shared';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { body, bodyAr, display, displayAr, mono } from '@/lib/fonts';
import { themeScript } from '@/lib/theme-script';
import '../globals.css';

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { seo } = getHome(locale);
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://zakydev.com'),
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
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
