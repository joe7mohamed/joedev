/** The address as people type it: host and path, without the scheme or a trailing slash. */
export const addressOf = (href: string): string => {
  const url = new URL(href);
  return `${url.host}${url.pathname === '/' ? '' : url.pathname}`;
};
