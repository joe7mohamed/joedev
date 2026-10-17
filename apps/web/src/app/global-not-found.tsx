import type { Metadata } from 'next';
import { Mark } from '@/components/Mark';
import '@/fonts/display';
import { body, mono } from '@/lib/fonts';
import { themeScript } from '@/lib/theme-script';
import './globals.css';

export const metadata: Metadata = { title: '404 | ZakyDev' };

export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr" className={[body.variable, mono.variable].join(' ')} suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static string defined in this repo, must run before paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <main className="grid min-h-svh place-items-center gap-6 p-6">
          <a href="/" aria-label="ZakyDev">
            <Mark size={48} />
          </a>
          <h1 className="font-display text-5xl">404</h1>
        </main>
      </body>
    </html>
  );
}
