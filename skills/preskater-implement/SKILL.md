---
name: preskater-implement
description: Implement an approved plan in small verified increments: create the issue branch, write code and tests together, follow repository conventions, and commit with Conventional Commits. Use after a plan is approved, or when the user asks to implement, build, make, or code the change.
license: MIT
metadata:
  owner: platform
  version: "0.2.0"
---

# Implement a change

Requires an approved plan. If there is none, run `preskater-plan` first.

## Preconditions

- The issue number, or an explicit reason there is none.
- An approved plan.
- A clean working tree before creating the branch.

## Procedure

1. **Create the branch.**

   ```bash
   git switch main && git pull
   git switch -c <type>/<issue>-<slug>
   ```

   `<type>` matches the Conventional Commit type. Example: `fix/412-session-expiry`.
2. **Work in increments.** For each step of the plan:
   - Read the surrounding code before editing.
   - Match the existing pattern instead of introducing a new one.
   - Add or update the test with the behavior.
   - Run the narrowest relevant check after each increment.
3. **Handle the schema explicitly.**
   - Prisma: edit `prisma/schema.prisma`, then run `npx prisma migrate dev --create-only --name <name>` to generate the migration file. Stop there. The `<app>-migrate` image applies it. Never run `prisma migrate deploy` or `prisma db push`.
   - Supabase: scaffold with `supabase migration new <name>` and write the SQL. Never run `supabase db push`.
4. **Keep the diff honest.** No unrelated refactors, formatting sweeps, or dependency upgrades.
5. **Commit.** One logical change per commit, Conventional Commits.

   ```bash
   git add -p
   git commit -m "feat(web): add passkey sign-in"
   ```

   Use `-p` so unrelated edits stay out.
6. **Verify.** Run `preskater-verify`, or the commands in `AGENTS.md`.
7. **Report.** Summarize what changed, what deviated from the plan and why, and what remains.

## Rules

- Do not push or merge to `main` directly.
- Do not rewrite published history.
- Do not disable lint rules or type checks to get green.
- Do not add a dependency without naming the workspace and the reason.
- Do not edit generated directories such as `prisma/generated`, `.next`, or `dist`.
- If the plan is wrong, stop and say so. Return to `preskater-plan`.

## Output

```markdown
## Implemented
- ...

## Deviations
- ...

## Verification
- command — result

## Follow-ups
- ...
```
