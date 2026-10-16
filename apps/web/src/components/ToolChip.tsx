import type { CSSProperties } from 'react';

const SLUG: Record<string, string> = {
  'Next.js': 'nextdotjs',
  React: 'react',
  TypeScript: 'typescript',
  NestJS: 'nestjs',
  PostgreSQL: 'postgresql',
  'PostgreSQL · RLS': 'postgresql',
  Docker: 'docker',
  Prisma: 'prisma',
  Redis: 'redis',
  'GitHub Actions': 'githubactions',
  'Tailwind CSS': 'tailwindcss',
  'Vercel AI SDK': 'vercel',
  Vercel: 'vercel',
  MySQL: 'mysql',
  Supabase: 'supabase',
  'Supabase Realtime': 'supabase',
  Vitest: 'vitest',
  Playwright: 'playwright',
};

export function ToolChip({ name }: { name: string }) {
  const slug = SLUG[name];
  return (
    <li
      dir="ltr"
      className="inline-flex items-center gap-2 rounded-full border border-hair px-3 py-1 font-mono text-[12.5px]"
    >
      {slug ? (
        <span
          aria-hidden="true"
          className="size-3.5 bg-accent"
          style={
            {
              mask: `url(/icons/${slug}.svg) center / contain no-repeat`,
              WebkitMask: `url(/icons/${slug}.svg) center / contain no-repeat`,
            } as CSSProperties
          }
        />
      ) : null}
      {name}
    </li>
  );
}
