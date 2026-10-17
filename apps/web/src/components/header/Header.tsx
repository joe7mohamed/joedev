import type { HomeContent, Locale } from '@zakydev/shared';
import { plain } from '@zakydev/shared/text';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { Mark } from '@/components/Mark';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu, type MenuItem } from './Menu';
import { MenuIcon, type MenuId } from './menu-icons';
import { PointerRing } from './PointerRing';
import { ScrollProgress } from './ScrollProgress';
import './header.css';

/** `brand` is the site's brand (site.brand), drawn as the lowercase wordmark beside the mark. */
type HeaderProps = { locale: Locale; nav: HomeContent['nav']; brand: string };

/** The fixed header (layer 5, above the scenes and the gold element): mark, section menu, language, theme. */
export function Header({ locale, nav, brand }: HeaderProps) {
  const ids: MenuId[] = ['work', 'process', 'about', 'contact'];
  const items: MenuItem[] = ids.map((id) => ({ id, label: nav[id], icon: <MenuIcon id={id} /> }));
  return (
    <header data-header>
      <a href="#main" className="skip">
        {nav.skip}
      </a>
      <a href="#hero" data-brand aria-label={brand}>
        <Mark size={32} />
        <span lang="en">{brand}</span>
      </a>
      <Menu items={items} label={plain(nav.sections)} />
      <div data-controls>
        <LanguageSwitch locale={locale} label={nav.switchLanguage} />
        <ThemeToggle label={nav.switchTheme}>
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
            <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M10 3a7 7 0 0 1 0 14z" fill="currentColor" />
          </svg>
        </ThemeToggle>
      </div>
      <ScrollProgress />
      <PointerRing />
    </header>
  );
}
