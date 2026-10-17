/*
 * Static pages, no user-supplied content, no third-party scripts. Scripts need 'unsafe-inline': nonces force dynamic
 * rendering, and the inline RSC payload scripts of static App Router pages (self.__next_f.push) change per build and
 * cannot be hashed. Adding any hash would make browsers ignore 'unsafe-inline' and break those scripts.
 * Reasoning and the revisit condition: docs/DEPLOY.md, "Content-Security-Policy".
 */
const scriptSrc = "script-src 'self' 'unsafe-inline'";
const rest = [
  "img-src 'self' data: blob:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];

/**
 * The Content-Security-Policy header for a `NODE_ENV`. Only `next dev` adds 'unsafe-eval', which React's development
 * tooling needs; every other build ships the policy above unchanged.
 */
export const contentSecurityPolicy = (nodeEnv: string | undefined): string =>
  ["default-src 'self'", nodeEnv === 'development' ? `${scriptSrc} 'unsafe-eval'` : scriptSrc, ...rest].join(
    '; ',
  );
