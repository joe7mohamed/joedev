# Installed versions

Recorded from `npm ls --workspaces --include-workspace-root --depth 0`. Append a section in every task that installs something.
`.npmrc` sets `min-release-age=3`, so a version published in the last three days resolves to the previous release.

| Tool | Version |
| --- | --- |
| Node | 24.20.0 |
| npm | 11.19.0 |

## Task 1: monorepo root

| Package | Installed | Where |
| --- | --- | --- |
| @biomejs/biome | 2.5.15 | root devDependency |
| turbo | 2.11.7 | root devDependency (2.11.8 was too new for min-release-age) |
| typescript | 7.0.2 | root devDependency |
| @zakydev/config | 0.0.0 | workspace `packages/config` |

No dependency reported an unreviewed install script (`npm install-scripts ls`), so no `allowScripts` entry was added.

## Task 2: shared package locales

| Package | Installed | Where |
| --- | --- | --- |
| zod | 4.6.7 | dependency of `packages/shared` |
| vitest | 5.0.4 | devDependency of `packages/shared` (5.0.5 was too new for min-release-age) |
| vite | 8.3.4 | devDependency of `packages/shared`, peer of vitest |
| @types/node | 26.6.5 | devDependency of `packages/shared` |
| typescript | 7.0.2 | devDependency of `packages/shared` (also at root) |
| @zakydev/config | 0.0.0 | devDependency `*` of `packages/shared` |
