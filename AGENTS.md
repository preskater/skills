# Preskater engineering baseline

This file is the shared baseline for every Preskater repository. Copy it to a repo root as `AGENTS.md` and adapt the marked sections. Claude Code, Codex, and OpenCode all read `AGENTS.md`; keep `CLAUDE.md` only where an older Claude Code still needs it.

> This repository (the skills catalog) is documentation and scripts. Run `node scripts/validate.mjs` before committing.

## Product and repository map

<!-- Adapt: list the apps, services, and shared packages in this repo. -->
- `apps/web` — Next.js app (App Router)
- `apps/mobile` — Expo app (Expo Router)
- `packages/*` — shared TypeScript packages

Repositories use npm workspaces plus Turborepo, even when the repo holds a single app.

## Stack

- Next.js (App Router), React, TypeScript strict
- shadcn/ui + Tailwind CSS
- Prisma **or** Supabase for data (one per project, never both)
- better-auth for authentication
- Expo / React Native for mobile
- PostgreSQL

## Commands

Run tasks through Turborepo so local and CI behavior match.

```bash
npm install
npm run dev                 # turbo run dev
npm run lint                # turbo run lint
npm run typecheck           # turbo run typecheck
npm run test                # Jest
npm run test:e2e            # Playwright
npx turbo run build
```

Useful filters:

```bash
npx turbo run test --filter=web
npm install <pkg> -w apps/web
```

## Workflow

Every non-trivial change follows this path:

1. **Issue** — the work is described in a GitHub issue (public repos) or a GitLab issue (private repos).
2. **Branch** — `git switch -c <type>/<issue>-<slug> main`, for example `feat/123-oauth-login`.
3. **Commits** — Conventional Commits, one logical change per commit.
4. **PR/MR** — open against `main`, link the issue.
5. **Review** — blocking findings resolved before merge.
6. **Merge** — merge method follows the repository setting.

## Commits

Follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/#specification).

```text
<type>(<scope>): <imperative summary>
```

- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Scopes: `web`, `mobile`, `db`, `auth`, `ui`, `config` (extend per repo).
- Body explains why, not what. Footers carry `Refs: #123`, `Closes: #123`, `BREAKING CHANGE:`.
- Breaking changes use `!` after the type/scope **and** a `BREAKING CHANGE:` footer.

## Code conventions

- TypeScript strict. No `any`; use `unknown` plus narrowing.
- Next.js: Server Components by default. Add `"use client"` only for interactivity, and keep it at the leaf.
- Mutations use Server Actions or route handlers. Validate input with zod on the server, even when the client already validated.
- Authorization is checked inside every Server Action and route handler. Middleware is not an authorization boundary.
- shadcn/ui components are vendored source. Compose them; do not edit `components/ui` ad hoc. Use Tailwind tokens, not arbitrary hex values.
- better-auth owns sessions. Never hand-roll session, JWT, or password logic.
- Expo: Expo Router, no Node built-ins in mobile code, shared packages must be isomorphic.

## Data and migrations

One schema owner per repository.

- **Prisma projects:** `prisma/schema.prisma` is the source of truth. The agent generates the migration with `npx prisma migrate dev --create-only`; the `<app>-migrate` image applies it during deploy. Never run `prisma migrate deploy` or `prisma db push` from a laptop.
- **Supabase projects:** `supabase/migrations` is the source of truth, managed manually with the Supabase CLI. Never run `supabase db push` against a shared or production project from an agent session.
- Do not introduce the second migration path into a repo.
- If Supabase RLS is enabled, every table exposed through the API needs policies and tests.

## Delivery

Artifacts are built with `preskater-build`, versioned by `preskater-release`, and deployed with `preskater-deploy`.

- Web images and Helm charts are pushed to `<registry>`.
- Mobile builds use EAS profiles.
- Image references use digests, never `latest`.
- Kubernetes manifests are packaged as Helm charts under `charts/<app>`.

```bash
docker compose up -d --wait          # local services
helm lint charts/<app>
helm template <app> charts/<app> -f charts/<app>/values.staging.yaml >/dev/null
argocd app diff <app>-staging
argocd app sync <app>-staging
argocd app wait <app>-staging --health --sync
eas build --profile production --platform all
eas observe:metrics-summary --json --non-interactive
```

## Environments

| Environment | Runs | Deploy path |
| --- | --- | --- |
| local | Docker Compose, plus kind/k3d/minikube for charts | Direct and disposable |
| staging | Kubernetes | ArgoCD `<app>-staging` |
| production | Kubernetes | ArgoCD `<app>-production` |

Staging exists for every app. Production changes need explicit approval.

## Deploy policy

- ArgoCD is the only staging and production deploy path. Never run `kubectl apply`, `helm install`, or `helm upgrade` against them.
- Migrations run as the `<app>-migrate` PreSync Job. Never run them from a laptop.
- Confirm `argocd context` and `kubectl config current-context` before any action.
- Roll back by reverting the GitOps commit or with `argocd app rollback`. Database migrations are forward-only.

## Release

- Semver follows Conventional Commits.
- Update `CHANGELOG.md` and `Chart.yaml` for every release.
- Release candidates (`-rc.N`) go to staging before the final tag.
- Mobile store submission is a manual step after the EAS build.

## Observability

- Backend and web: Grafana, Prometheus, Loki, and Tempo.
- Mobile: Expo Observe, queried with `eas observe:*`.
- Annotate every deploy in Grafana.
- Check golden signals and SLO burn before declaring success.
- Use the already-authenticated `kubectl`, `argocd`, `grafana`, and `eas` CLIs. Never print tokens or kubeconfig.

## On-call

- S1 and S2 incidents follow `preskater-incident`; postmortems follow `preskater-postmortem`.
- Status updates: S1 every 15 minutes, S2 every 30-60.

## Testing

- Jest for units and integration.
- Playwright for end-to-end web flows.
- Keep Playwright specs out of Jest's roots.
- A behavior change ships with the test that proves it.

## Security and environment

- Never commit secrets. Update `.env.example` when adding a variable.
- Only `NEXT_PUBLIC_` and `EXPO_PUBLIC_` variables reach the browser or app bundle. Everything else is server-only.
- Supabase service-role keys are server-only.
- Report suspected vulnerabilities privately, not in a public issue.

## Definition of done

- [ ] Issue linked
- [ ] Tests added or updated
- [ ] `npm run lint`, `npm run typecheck`, `npm run test`, and `npx turbo run build` pass
- [ ] Relevant Playwright flow passes
- [ ] Docs, `.env.example`, and changelog updated
- [ ] Security review for auth, data, infrastructure, or dependency changes
- [ ] Release checklist completed for production changes
- [ ] PR/MR body filled with test evidence and risk

## Gotchas

- Turborepo is used even for single-app repos. Run tasks through `turbo` so caching and CI match.
- npm workspaces: install dependencies in the owning workspace with `npm install <pkg> -w <workspace>`. Root installs are for shared tooling only.
- Prisma Client must be regenerated after every schema change.
- Prisma on edge runtimes needs a driver adapter.
- Supabase and Prisma migrations can diverge silently. Check which one owns the schema before adding a migration.
- Expo and Next.js use different public env prefixes.
- Generated files (`prisma/generated`, `.next`, `dist`, `node_modules`) are never edited by hand.
- ArgoCD is the only staging and production deploy path. A Git commit to environment values is a deploy when auto-sync is enabled.
- Docker Compose is local only. Test the Helm chart in a local cluster before release.
- The migration Job must finish before the app rolls out. A sync without a healthy PreSync hook is a failed deploy.
- EAS Observe ignores debug builds by default. Do not compare debug metrics to production.
- A Grafana dashboard that was never updated after a new failure mode is a blind spot, not a signal.
