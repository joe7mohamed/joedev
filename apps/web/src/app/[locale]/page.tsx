import { getHome, isLocale, plain } from '@zakydev/shared';
import { notFound } from 'next/navigation';
import { Mark } from '@/components/Mark';
import { ThemeToggle } from '@/components/ThemeToggle';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = getHome(locale, { requireConfirmed: process.env.REQUIRE_CONFIRMED === '1' });
  return (
    <>
      <header className="flex items-center gap-3 p-6">
        <Mark />
        <span className="font-medium">zakydev</span>
        <span className="ms-auto">
          <ThemeToggle label={c.nav.switchTheme} />
        </span>
      </header>
      <main className="px-6 py-24">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">
          {plain(c.hero.titles[0] ?? '')} · {c.hero.place}
        </p>
        <h1 className="mt-4 text-[clamp(2.6rem,11vw,10rem)]">
          {c.hero.headline.map((line) => line.map((w) => w.t).join(' ')).join(' ')}
        </h1>
        <p className="mt-8">
          <a href={`mailto:${c.contact.email}`} className="underline decoration-gold underline-offset-4">
            {c.contact.email}
          </a>
        </p>
      </main>
    </>
  );
}
