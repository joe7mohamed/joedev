import { getHome, isLocale } from '@zakydev/shared';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header/Header';
import { Hero } from '@/components/hero/Hero';
import { Process } from '@/components/process/Process';
import { Work } from '@/components/work/Work';
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
          <Hero content={c.hero} projectImage={c.projects[0]?.image ?? ''} locale={locale} />
        </Scene>
        <Scene id="work" length={3.2} tail={0.4}>
          <Work work={c.work} projects={c.projects} />
        </Scene>
        <Scene id="process" length={2.6} tail={0.3}>
          <Process content={c.process} />
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
