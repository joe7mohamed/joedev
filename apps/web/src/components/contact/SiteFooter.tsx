import './contact.css';

type SiteFooterProps = { text: string };

/**
 * The page footer, spec 7's contentinfo landmark: after <main>, never inside it. It is the one-line foot of the gold
 * contact screen (spec 5.7); contact.css places it in flow or fixed at the screen's foot, by the scene's state.
 */
export function SiteFooter({ text }: SiteFooterProps) {
  return (
    <footer data-site-footer>
      <span lang="en" dir="ltr">
        {text}
      </span>
    </footer>
  );
}
