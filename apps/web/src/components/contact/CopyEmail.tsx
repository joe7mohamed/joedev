'use client';

import { useEffect, useRef, useState } from 'react';

type CopyEmailProps = {
  email: string;
  label: string;
  copied: string;
  /** The id of the element that holds the address as text: the fallback selects it. */
  target: string;
};

/** How long the button says "Copied" before it returns to its label. */
const CONFIRM_MS = 1600;

/** Selects the address so the visitor can copy it themselves; says nothing, because nothing was copied. */
const selectAddress = (target: string): void => {
  const node = document.getElementById(target);
  const selection = window.getSelection();
  if (!node || !selection) return;
  const range = document.createRange();
  range.selectNodeContents(node);
  selection.removeAllRanges();
  selection.addRange(range);
};

/**
 * "Copy email" (spec 5.7): writes the address to the clipboard inside the click. On success the label reads
 * "Copied" for 1.6 s and a polite live region says so; when the clipboard is refused or missing (an insecure
 * context, a denied permission) the address is selected instead and the label stays as it was.
 */
export function CopyEmail({ email, label, copied, target }: CopyEmailProps) {
  const [done, setDone] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const confirm = (): void => {
    window.clearTimeout(timer.current);
    setDone(true);
    timer.current = window.setTimeout(() => setDone(false), CONFIRM_MS);
  };
  const copy = (): void => {
    const clipboard = navigator.clipboard as Clipboard | undefined;
    if (typeof clipboard?.writeText !== 'function') {
      selectAddress(target);
      return;
    }
    try {
      clipboard.writeText(email).then(confirm, () => selectAddress(target));
    } catch {
      selectAddress(target);
    }
  };

  return (
    <>
      <button type="button" data-button="solid" data-copy onClick={copy}>
        {done ? copied : label}
      </button>
      <span className="sr-only" aria-live="polite">
        {done ? copied : ''}
      </span>
    </>
  );
}
