import { getHome, isLocale } from '@zakydev/shared';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { About } from '@/components/about/About';
import { BackgroundLoader } from '@/components/background/BackgroundLoader';
import { Contact } from '@/components/contact/Contact';
import { SiteFooter } from '@/components/contact/SiteFooter';
import { Header } from '@/components/header/Header';
import { Hero } from '@/components/hero/Hero';
import { JsonLd } from '@/components/JsonLd';
import { Loader } from '@/components/loader/Loader';
import { LoaderArt } from '@/components/loader/LoaderArt';
import { Process } from '@/components/process/Process';
import { shotUrls } from '@/components/work/screenshot';
import { Work } from '@/components/work/Work';
import { sharingMetadata } from '@/lib/og';
import { homeUrl } from '@/lib/site';
import { EngineProvider } from '@/motion/EngineProvider';
import { GoldElement } from '@/motion/GoldElement';
import { Scene } from '@/motion/Scene';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? sharingMetadata(locale) : {};
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = getHome(locale, { requireConfirmed: process.env.REQUIRE_CONFIRMED === '1' });
  return (
    <EngineProvider>
      <BackgroundLoader />
      <Header locale={locale} nav={c.nav} brand={c.site.brand} />
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
          <About content={c.about} locale={locale} />
        </Scene>
        <Scene id="contact" length={1.5} tail={0}>
          <Contact content={c.contact} locale={locale} />
        </Scene>
      </main>
      <SiteFooter text={c.contact.footer} locale={locale} />
      <Loader images={shotUrls(c.projects.map((p) => p.image))}>
        <LoaderArt />
      </Loader>
      <JsonLd content={c} url={homeUrl(locale)} />
    </EngineProvider>
  );
}
