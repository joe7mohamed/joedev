import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy } from './csp';

/** The policy the site ships (docs/DEPLOY.md, "Content-Security-Policy"), byte for byte. */
const SHIPPED =
  "default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; " +
  "style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; object-src 'none'; " +
  "frame-ancestors 'none'; base-uri 'self'; form-action 'self'";

describe('contentSecurityPolicy', () => {
  it('is the shipped policy, without eval, outside development', () => {
    expect(contentSecurityPolicy('production')).toBe(SHIPPED);
    expect(contentSecurityPolicy('test')).toBe(SHIPPED);
    expect(contentSecurityPolicy(undefined)).toBe(SHIPPED);
    expect(contentSecurityPolicy('production')).not.toContain('unsafe-eval');
  });

  it("allows eval for React's development tooling in development only", () => {
    expect(contentSecurityPolicy('development')).toBe(
      SHIPPED.replace("script-src 'self' 'unsafe-inline'", "script-src 'self' 'unsafe-inline' 'unsafe-eval'"),
    );
  });
});
