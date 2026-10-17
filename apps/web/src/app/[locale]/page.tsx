import { getHome, isLocale } from '@zakydev/shared';
import { notFound } from 'next/navigation';
import { About } from '@/components/about/About';
import { BackgroundLoader } from '@/components/background/BackgroundLoader';
import { Contact } from '@/components/contact/Contact';
import { SiteFooter } from '@/components/contact/SiteFooter';
import { Header } from '@/components/header/Header';
import { Hero } from '@/components/hero/Hero';
import { Loader } from '@/components/loader/Loader';
import { Process } from '@/components/process/Process';
import { shotUrls } from '@/components/work/screenshot';
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
      <BackgroundLoader />
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
          <About content={c.about} />
        </Scene>
        <Scene id="contact" length={1.5} tail={0}>
          <Contact content={c.contact} locale={locale} />
        </Scene>
      </main>
      <SiteFooter text={c.contact.footer} />
      <Loader images={shotUrls(c.projects.map((p) => p.image))} />
    </EngineProvider>
  );
}
