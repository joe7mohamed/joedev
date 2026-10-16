import { getHome, isLocale } from '@zakydev/shared';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header/Header';
import { TempWorkSlot } from '@/components/work/TempWorkSlot';
import { EngineProvider } from '@/motion/EngineProvider';
import { GoldElement } from '@/motion/GoldElement';
import { Scene } from '@/motion/Scene';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = getHome(locale, { requireConfirmed: process.env.REQUIRE_CONFIRMED === '1' });
  return (
    <EngineProvider>
      <Header locale={locale} nav={c.nav} />
      <GoldElement />
      <main id="main">
        <Scene id="hero" length={2} tail={0.5}>
          <div data-fade>
            <h1 className="text-[clamp(2.6rem,11vw,10rem)]">
              {c.hero.headline.map((line) => line.map((w) => w.t).join(' ')).join(' ')}
            </h1>
          </div>
        </Scene>
        <Scene id="work" length={3.2} tail={0.4}>
          <div data-fade>
            <h2 className="text-4xl">{c.work.label}</h2>
            <TempWorkSlot />
          </div>
        </Scene>
        <Scene id="process" length={2.6} tail={0.3}>
          <div data-fade>
            <h2 className="text-4xl">{c.process.label}</h2>
          </div>
        </Scene>
        <Scene id="about" length={2.15} tail={0.25}>
          <div data-fade>
            <h2 className="text-4xl">{c.about.heading}</h2>
          </div>
        </Scene>
        <Scene id="contact" length={1.5} tail={0}>
          <div data-fade>
            <h2 className="text-4xl">{c.contact.heading}</h2>
            <p className="mt-8">
              <a href={`mailto:${c.contact.email}`} className="underline decoration-gold underline-offset-4">
                {c.contact.email}
              </a>
            </p>
          </div>
        </Scene>
      </main>
    </EngineProvider>
  );
}
