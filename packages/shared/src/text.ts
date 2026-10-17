/**
 * A text of the content, either confirmed (a plain string) or still waiting for the owner's confirmation (`u()`).
 * Plain TypeScript with no imports: client components import this module through `@zakydev/shared/text`, so zod,
 * the schema and the content of both locales never reach the browser (spec line 32, the route-JS budget).
 */
export type Text = string | { text: string; unconfirmed: true };
export const u = (value: string): Text => ({ text: value, unconfirmed: true });
export const plain = (value: Text): string => (typeof value === 'string' ? value : value.text);
