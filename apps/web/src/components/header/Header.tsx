import { type HomeContent, type Locale, plain } from '@zakydev/shared';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { Mark } from '@/components/Mark';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu, type MenuItem } from './Menu';
import { PointerRing } from './PointerRing';
import { ScrollProgress } from './ScrollProgress';
import './header.css';

type HeaderProps = { locale: Locale; nav: HomeContent['nav'] };

/** The fixed header (layer 5, above the scenes and the gold element): mark, section menu, language, theme. */
export function Header({ locale, nav }: HeaderProps) {
  const items: MenuItem[] = [
    { id: 'work', label: nav.work },
    { id: 'process', label: nav.process },
    { id: 'about', label: nav.about },
    { id: 'contact', label: nav.contact },
  ];
  return (
    <header data-header>
      <a href="#main" className="skip">
        {nav.skip}
      </a>
      <a href="#hero" data-brand aria-label="ZakyDev">
        <Mark size={32} />
        <span>zakydev</span>
      </a>
      <Menu items={items} label={plain(nav.sections)} />
      <div data-controls>
        <LanguageSwitch locale={locale} label={nav.switchLanguage} />
        <ThemeToggle label={nav.switchTheme} />
      </div>
      <ScrollProgress />
      <PointerRing />
    </header>
  );
}
