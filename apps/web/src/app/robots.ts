import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

// a static export (npm run build:static) writes it as a file only when it is marked static; it always was
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${siteUrl}/sitemap.xml` };
}
