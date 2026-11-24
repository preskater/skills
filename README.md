# Preskater skills

Shared [Agent Skills](https://agentskills.io) that make planning, implementation, verification, review, triage, and pull requests work the same way across Claude Code, Codex, and OpenCode.

One catalog, one process, three harnesses.

[![CI](https://github.com/preskater/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/preskater/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-16-blue.svg)](catalog.json)

## Quick start

```bash
git clone https://github.com/preskater/skills.git
cd skills
./scripts/install.sh
```

The installer symlinks each skill into both user-level locations:

| Path | Read by |
| --- | --- |
| `~/.agents/skills/` | Codex (native), OpenCode (compatibility path) |
| `~/.claude/skills/` | Claude Code |

Per-skill symlinks are used, so personal skills and Claude's `synced/` directory keep working.

> **Windows:** use WSL2. The installer and symlink layout are POSIX-only.

### Verify discovery

```bash
ls -l ~/.agents/skills ~/.claude/skills
```

Then try it in each harness:

| Harness | Invoke directly |
| --- | --- |
| Claude Code | `/preskater-plan` |
| Codex | `$preskater-plan` or `/skills` |
| OpenCode | `@preskater-plan` |

Ask something that matches the description, for example: "Plan the change described in issue 123."

## Bundles

Install a subset to keep startup context small.

| Bundle | Skills |
| --- | --- |
| `engineer` | plan, adr, implement, docs, instrument, build, verify, security-review, review, pr |
| `reviewer` | review, security-review, verify |
| `delivery` | build, instrument, release, deploy, observe, security-review |
| `on-call` | triage, incident, observe, postmortem |
| `architect` | plan, adr, review, security-review |
| `all` | all sixteen (default) |

```bash
./scripts/install.sh --bundle reviewer
./scripts/install.sh --dry-run
./scripts/install.sh --uninstall
```

## Skills

| Skill | Purpose |
| --- | --- |
| `preskater-plan` | Plan a change and stop for approval |
| `preskater-adr` | Record an architecture decision |
| `preskater-implement` | Execute an approved plan in small, tested commits |
| `preskater-docs` | Write README, runbooks, API, and architecture docs |
| `preskater-instrument` | Instrument Next.js and Expo for OpenTelemetry and Alloy |
| `preskater-build` | Build Docker, Helm, and EAS artifacts |
| `preskater-verify` | Run the real checks and report evidence |
| `preskater-security-review` | Review auth, secrets, supply chain, and Kubernetes hardening |
| `preskater-review` | Severity-ranked review against the issue |
| `preskater-pr` | Open a PR/MR with evidence and land it |
| `preskater-release` | Version, approve, and tag a release candidate |
| `preskater-deploy` | Deploy through ArgoCD with Helm and migration gates |
| `preskater-observe` | Check Grafana signals and Expo Observe after a deploy |
| `preskater-triage` | Triage bugs and incidents, write the issue |
| `preskater-incident` | Run an active incident and keep the timeline |
| `preskater-postmortem` | Write a blameless postmortem with owned action items |

## How the pieces fit

```text
plan -> code -> build -> test -> release -> deploy -> operate -> observe -> feedback
 ^                                                                          |
 +--------------------------------------------------------------------------+
```

- `AGENTS.md` is the per-repo baseline: stack, commands, delivery policy, observability, conventions, gotchas.
- `preskater-plan` and `preskater-adr` anchor work to an issue and a decision.
- `preskater-implement`, `preskater-docs`, `preskater-instrument`, and `preskater-build` produce code, docs, telemetry, and artifacts.
- `preskater-verify` and `preskater-security-review` provide evidence.
- `preskater-pr` ends at merge and hands off to release.
- `preskater-release`, `preskater-deploy`, and `preskater-observe` cover the pipeline. ArgoCD is the only staging and production path; migrations run as a PreSync Job.
- `preskater-triage`, `preskater-incident`, and `preskater-postmortem` close the loop.

**Skills advise; gates enforce.** CI validation and required checks produce consistency. The skills make the good path the easy path.

## Delivery and operations

- **Instrument:** Next.js OpenTelemetry through `instrumentation.ts` and `@vercel/otel`, exported to Grafana Alloy; Expo Observe for mobile.
- **Build:** Docker images by digest, Helm charts, and EAS builds.
- **Release:** semver from Conventional Commits, changelog, `Chart.yaml` version and `appVersion`, release candidates.
- **Deploy:** ArgoCD + Helm, staging then production, `<app>-migrate` PreSync Job, smoke tests, rollback.
- **Observe:** Grafana, Prometheus, Loki, and Tempo for backend and web; `eas observe:*` for the Expo app.
- **Operate:** incident roles, comms cadence, and blameless postmortems.

Local uses Docker Compose, and Helm charts are tested against a local kind/k3d/minikube cluster before release.

## Repository layout

```text
.
├── AGENTS.md                  # baseline template for product repos
├── README.md
├── CONTRIBUTING.md            # how to author and version a skill
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── SUPPORT.md
├── GOVERNANCE.md
├── CHANGELOG.md
├── catalog.json               # machine-readable catalog and bundles
├── skills/
│   └── preskater-*/
│       ├── SKILL.md
│       └── references/        # host-specific commands
├── templates/                 # plan, PR, release, deploy, incident, postmortem, ADR, runbook
├── scripts/
│   ├── install.sh
│   └── validate.mjs
└── .github/
    ├── workflows/             # CI, release, PR title, labeler, link check
    ├── ISSUE_TEMPLATE/
    └── PULL_REQUEST_TEMPLATE.md
```

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the skill-authoring bar, then open an issue with the matching template.

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Governance](GOVERNANCE.md)
- [Support](SUPPORT.md)
- [Security policy](SECURITY.md)

Good first issues are labeled [`good first issue`](https://github.com/preskater/skills/labels/good%20first%20issue).

Validate before pushing:

```bash
node scripts/validate.mjs
npx --yes markdownlint-cli2@0.24.2
```

## Releases

Versions are tagged on `main` as `vX.Y.Z`. The release workflow validates the catalog, confirms the tag is on `main`, and publishes GitHub release notes from the commit history. See [CHANGELOG.md](CHANGELOG.md).

## Security

This repository is public. Keep internal hostnames, escalation contacts, customer data, and secrets out of it. Report vulnerabilities through [private advisories](SECURITY.md), never a public issue.

## License

MIT. See [LICENSE](LICENSE).
