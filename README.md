# ZakyDev

Personal site of Youssef Zaky. Monorepo: `apps/web` (Next.js) and `packages/shared`
(content and schemas). An API service joins `apps/` in a later phase.

    nvm use            # Node 24 from .nvmrc (bundles npm 11)
    npm ci
    npm run dev        # web on :3000
    npm run lint && npm run typecheck && npm test && npm run build

Design: `DESIGN.md`. Spec and plans: `docs/superpowers/`. Visual reference: `docs/prototype/home-v23/`.
