import type { HomeContent, Locale } from '@zakydev/shared';
import { plain } from '@zakydev/shared/text';
import { type CSSProperties, Fragment } from 'react';
import { icons } from '@/components/icons';
import { MixedText } from '@/components/MixedText';
import { ContactScene } from './ContactScene';
import { CopyEmail } from './CopyEmail';
import './contact.css';

type ContactProps = { content: HomeContent['contact']; locale: Locale };
type ProfileProps = { href: string; name: string; icon: string };

/** Place and time zone, languages, reply promise (prototype app.js 255). */
const META_ICONS = [icons.Pin, icons.Globe, icons.Clock];
const EMAIL_ID = 'contact-email';
const step = (i: number): CSSProperties => ({ '--i': i }) as CSSProperties;

/** A profile link; its brand icon is a single-colour mask (DESIGN.md), hidden from assistive technology. */
function Profile({ href, name, icon }: ProfileProps) {
  const mask = `url(/icons/${icon}.svg) center / contain no-repeat`;
  return (
    <a data-profile href={href} target="_blank" rel="noopener me" lang="en" dir="ltr">
      <span data-profile-icon aria-hidden="true" style={{ mask, WebkitMask: mask }} />
      <span data-profile-name>{name}</span>
    </a>
  );
}

/**
 * Contact (spec 5.7): on the gold screen, in dark ink and centred, the label, the question rising word by word, one
 * sentence, the email typing itself in, "Copy email", the two profiles and three facts; the one-line footer is the
 * page's own (SiteFooter). The
 * address is always real text in a `mailto:` link; the typing is only a clip over it.
 */
export function Contact({ content, locale }: ContactProps) {
  // a fixed sentence: its words never reorder, so their position is a stable key
  const words = content.heading.split(/\s+/).map((word, i) => ({ word, key: `${i}:${word}` }));
  const meta = [content.meta[0], content.meta[1], plain(content.meta[2])];
  return (
    <ContactScene>
      <div data-contact-main>
        <p data-label style={step(0)}>
          {content.label}
        </p>
        <h2 data-contact-heading>
          {words.map(({ word, key }, i) => (
            <Fragment key={key}>
              {i > 0 ? ' ' : null}
              <span data-word style={step(i)}>
                <span>{word}</span>
              </span>
            </Fragment>
          ))}
        </h2>
        <p data-contact-sentence style={step(1)}>
          {content.sentence}
        </p>
        <p data-contact-email style={step(2)}>
          <a
            id={EMAIL_ID}
            data-email
            href={`mailto:${content.email}`}
            lang="en"
            dir="ltr"
            style={{ '--n': content.email.length } as CSSProperties}
          >
            {content.email}
          </a>
        </p>
        <div data-contact-actions style={step(3)}>
          <CopyEmail email={content.email} label={content.copy} copied={content.copied} target={EMAIL_ID} />
          <Profile href={content.github} name={content.githubLabel} icon="github" />
          <Profile href={content.linkedin} name={content.linkedinLabel} icon="linkedin" />
        </div>
        <ul data-contact-meta style={step(4)}>
          {meta.map((text, i) => {
            const Icon = META_ICONS[i] ?? icons.Pin;
            return (
              <li key={text}>
                <Icon />
                <span>
                  <MixedText text={text} locale={locale} />
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </ContactScene>
  );
}
