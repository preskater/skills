---
name: preskater-plan
description: Plan a code change before editing: confirm the issue, inspect the repository, compare approaches, list the files and a verification plan, then stop for approval. Use when starting a feature, bug fix, refactor, or migration, or when the user asks to plan, scope, design, or break down work.
license: MIT
metadata:
  owner: platform
  version: "0.2.0"
---

# Plan a change

Produce a written plan and stop. Do not edit files, create branches, or run migrations during planning.

## Inputs

- The request, plus an issue number or URL when one exists.
- `AGENTS.md` at the repo root, and any nested `AGENTS.md` closer to the code.

## Procedure

1. **Confirm the issue.**
   - If the request references an issue, read it first (GitHub: `gh issue view <n>`, GitLab: `glab issue view <n>`).
   - If there is no issue and the work is non-trivial (more than one file, or any schema, API, or auth change), draft a title and body and ask the user to create it. Do not create it yourself unless asked.
2. **Read the baseline.** Open the nearest `AGENTS.md`. Use its commands verbatim; do not invent scripts.
3. **Inspect the code.**
   - Entry points and data flow for the affected feature.
   - Existing patterns to copy: components, Server Actions, route handlers, tests.
   - The schema owner: `prisma/schema.prisma` or `supabase/migrations`. Never both.
   - Related tests and previous PRs that touched the same area.
4. **Compare approaches.** Offer two or three viable options with tradeoffs, then recommend one. Skip this for trivial changes.
5. **List the change surface.** Every file to create or modify, with a one-line purpose.
6. **Plan verification.** Name the Jest tests, Playwright flows, lint, typecheck, and build that prove the change. Say what needs manual checking.
7. **Call out risk and delivery impact.** Migration impact, auth and authorization changes, public API changes, rollout, rollback, and which environments, dashboards, and SLOs are affected.
8. **List open questions.** Anything you cannot settle from the repository.
9. **Stop.** Present the plan and ask for approval.

## Output

```markdown
## Goal

## Non-goals

## Acceptance criteria
- [ ] ...

## Success metrics
- ...

## Issue
#123 — title

## Approach
### Option A (recommended)
- tradeoff
### Option B
- tradeoff

## Files
- `path` — purpose

## Verification
- [ ] Jest: ...
- [ ] Playwright: ...
- [ ] lint / typecheck / build

## Risks and rollback

## Open questions
```

Keep it short enough to read in one screen for a small change.

## Scaling

- One-file fix with an obvious cause: a short paragraph and the verification command is enough.
- Cross-package, schema, auth, or API change: use the full structure and consider an ADR before implementation.
- Never produce a plan longer than the change warrants.

## Gotchas

- Do not plan around commands that `AGENTS.md` does not define. If a command is missing, ask.
- Do not assume a library is available. Check `package.json` and the workspace that owns it.
- If the plan needs a new dependency, name the workspace and the reason.
- If the change picks a data model, auth approach, infrastructure, or vendor, write an ADR before implementation with `preskater-adr`.
- If the schema changes, state which migration path owns it and who applies it. The agent never applies a migration.
