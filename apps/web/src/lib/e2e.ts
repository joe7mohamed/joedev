/**
 * Test-only switches for end-to-end builds (`NEXT_PUBLIC_E2E=1`, set by the Playwright web server and by CI).
 * Next inlines the variable at build time, so in any other build `isE2E` is the constant `false` and the code it
 * guards is dropped from the bundle.
 */
export const isE2E = process.env.NEXT_PUBLIC_E2E === '1';

/** A query parameter of the current URL in an E2E build; always null otherwise. */
export const param = (name: string): string | null =>
  isE2E && typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get(name) : null;
