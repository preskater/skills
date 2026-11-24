---
name: preskater-verify
description: Run the repository's real checks and report evidence: lint, typecheck, Jest, Playwright, and the Turborepo build. Use before opening a pull request, after implementation, or when asked whether a change works or passes.
license: MIT
metadata:
  owner: platform
  version: "0.2.0"
---

# Verify a change

Never claim a change works without command output. Report what ran, what passed, and what did not run.

## Procedure

1. **Read the commands.** Use the values in the nearest `AGENTS.md`. Fall back to `package.json` scripts and `turbo.json`.
2. **Scope the run.**
   - Changed workspace only: `npx turbo run lint typecheck test --filter=<workspace>`
   - Shared or cross-cutting change: run at the repo root.
3. **Run in this order.**
   1. `npm run lint`
   2. `npm run typecheck`
   3. `npm run test` (Jest)
   4. `npx turbo run build`
   5. `npm run test:e2e` (Playwright) when a user flow changed
4. **Fix and rerun.** After a failure, fix the cause and rerun that step. Do not loop more than three times on the same failure; report it instead.
5. **Check what tests miss.** For UI changes, run the app or the Playwright flow. For schema changes, confirm the migration file exists and was not applied.
6. **Run conditional checks.**
   - Security-sensitive change: run `preskater-security-review`.
   - Performance-sensitive change: run the relevant benchmark or load test.
   - User-facing UI: run the Playwright flow and check accessibility.
7. **Report.**

## Forbidden

- `supabase db push` or `supabase db reset --linked`
- `prisma migrate deploy` or `prisma db push`
- Skipping, muting, or `.only`-ing tests to get green
- Updating snapshots without reading the diff

## Output

```markdown
## Verification
| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | pass |
| Types | `npm run typecheck` | pass |
| Unit | `npm run test` | 42 passed |
| Build | `npx turbo run build` | pass |
| E2E | `npm run test:e2e` | not run — no user flow changed |

## Not verified
- ...
```

## Gotchas

- Jest and Playwright can pick up each other's files. Check the config before assuming a suite ran.
- A Turborepo cache hit is not a fresh run. Use `--force` when validating cache-sensitive changes.
- A green build does not mean the feature works. Say what you actually exercised.
- A build check is not a build artifact. If the release needs an image or chart, run `preskater-build`.
- If a check cannot run because of missing credentials or services, say so explicitly instead of omitting it.
