# How to run these plans in a new session

Open a new Claude Code session in this repository and paste the prompt below.
Run Phase 0 to the end before starting Phase 1.

## Prompt for Phase 0

```
Work in /home/joe/projects/joedev on branch rebuild/zakydev.

Read, in this order:
1. docs/superpowers/specs/2026-10-13-zakydev-home-design.md
2. DESIGN.md
3. docs/superpowers/plans/2026-10-13-phase-0-foundation.md

Then execute the Phase 0 plan task by task with the superpowers:subagent-driven-development
skill (use superpowers:executing-plans if subagents are not available). Follow every step
as written: write the failing test first, see it fail, implement, see it pass, commit.

Rules:
- Before installing any framework, look up its current documentation and adapt config
  syntax to the installed version; record versions in docs/VERSIONS.md.
- Never weaken or delete a test to make it pass. If a step in the plan is wrong, stop and
  tell me what is wrong and what you propose.
- No secrets in the repository. Do not commit to main. Push the branch after each task.
- Task 7 (deployment) needs my hosting access: stop there and ask me.
- When a task is done, tell me in two or three plain sentences what now works and what
  you verified.
```

## Prompt for Phase 1

```
Work in /home/joe/projects/joedev on branch rebuild/zakydev. Phase 0 is complete.

Read, in this order:
1. docs/superpowers/specs/2026-10-13-zakydev-home-design.md (all of it)
2. DESIGN.md
3. docs/superpowers/plans/2026-10-13-phase-1-home.md

Start the visual reference and keep it open while you work:
  python3 -m http.server 8765 --directory docs/prototype/home-v23
  http://localhost:8765/index.html   (?lang=ar  ?theme=light  ?intro=1)

Then execute the Phase 1 plan task by task with the superpowers:subagent-driven-development
skill. For every visual task, compare your result with the prototype at 1440x900 and
390x844, in English and Arabic, dark and light, and match it before committing.

Rules:
- The prototype is the reference for look, copy, timing and motion only. Follow spec
  sections 6.4 and 10 for structure; do not copy its CSS or script.
- No animation library and no three.js. No third-party requests at runtime.
- Never weaken or delete a test to make it pass. If the plan is wrong, stop and tell me.
- All copy comes from packages/shared. Do not invent text or numbers.
- Do not commit to main. Push the branch after each task.
- Task 14 needs me: stop there, give me the deployed link and the list of open items
  from spec section 12.
- After each task, tell me in plain sentences what now works, what you checked by eye,
  and anything that differs from the prototype.
```

## Before production

The owner still has to: confirm the items in spec section 12, read the Arabic copy, and
rotate the MongoDB Atlas password that was committed in the old `DEPLOYMENT.md` (it is
still in this repository's public history).
