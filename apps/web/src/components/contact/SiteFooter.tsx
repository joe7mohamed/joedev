import { MixedText } from '@/components/MixedText';
import './contact.css';

type SiteFooterProps = { text: string; locale: string };

/**
 * The page footer, spec 7's contentinfo landmark: after <main>, never inside it. It is the one-line foot of the gold
 * contact screen (spec 5.7); contact.css places it in flow or fixed at the screen's foot, by the scene's state. The
 * line is in the page's language; on the Arabic page its Latin runs (the brand) are marked as English.
 */
export function SiteFooter({ text, locale }: SiteFooterProps) {
  return (
    <footer data-site-footer>
      <MixedText text={text} locale={locale} />
    </footer>
  );
}
