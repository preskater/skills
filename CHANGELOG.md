# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Ten skills closing the DevOps loop:
  - `preskater-build` — Docker images, Helm charts, and EAS builds
  - `preskater-release` — semver, changelog, chart versions, release candidates, go/no-go
  - `preskater-deploy` — ArgoCD GitOps promotion with Helm, migration gates, and rollback
  - `preskater-observe` — Grafana golden signals and Expo Observe for mobile
  - `preskater-incident` — active incident command
  - `preskater-postmortem` — blameless review with owned action items
  - `preskater-adr` — architecture decision records
  - `preskater-docs` — README, runbooks, API, and architecture docs
  - `preskater-instrument` — Next.js OpenTelemetry, Grafana Alloy, and Expo Observe
  - `preskater-security-review` — authz, secrets, supply chain, and Kubernetes hardening
- Next.js OpenTelemetry setup and Grafana Alloy pipeline references
- Delivery, environment, release, observability, and on-call sections in `AGENTS.md`
- Templates for release, deploy records, incidents, postmortems, ADRs, and runbooks
- Validator check that `install.sh` bundles match `catalog.json`
- `delivery` bundle alongside updated `engineer`, `reviewer`, `on-call`, and `architect` bundles
- Existing skills now hand off across the full loop, with acceptance criteria and delivery impact in planning

- Initial catalog: `preskater-plan`, `preskater-implement`, `preskater-verify`, `preskater-review`, `preskater-triage`, and `preskater-pr`
- Baseline `AGENTS.md` for product repositories using Next.js, shadcn/ui, Prisma or Supabase, better-auth, Expo, and Postgres
- `scripts/install.sh` with bundles, dry-run, force, and uninstall
- `scripts/validate.mjs` for portable frontmatter, references, and catalog consistency
- Host-specific references for GitHub Issues/PRs and self-hosted GitLab
- Human-facing plan, pull request, and triage templates
- CI: validator on Node 22/24/26, installer smoke tests on Ubuntu and macOS, markdownlint, shellcheck, and Conventional Commit PR titles
- Weekly link checking and grouped Dependabot updates for GitHub Actions
- Open-source community files: issue templates, pull request template, code of conduct, security policy, support guide, governance, and changelog

[Unreleased]: https://github.com/preskater/skills/commits/main
