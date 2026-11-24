# Preskater skills

Shared [Agent Skills](https://agentskills.io) that make planning, implementation, verification, review, triage, and pull requests work the same way across Claude Code, Codex, and OpenCode.

One catalog, one process, three harnesses.

[![CI](https://github.com/preskater/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/preskater/skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-6-blue.svg)](catalog.json)

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
| `engineer` | plan, implement, verify, review, pr |
| `reviewer` | review, verify |
| `on-call` | triage, implement, verify, pr |
| `architect` | plan, review |
| `all` | all six (default) |

```bash
./scripts/install.sh --bundle reviewer
./scripts/install.sh --dry-run
./scripts/install.sh --uninstall
```

## Skills

| Skill | Purpose |
| --- | --- |
| `preskater-plan` | Plan a change and stop for approval |
| `preskater-implement` | Execute an approved plan in small, tested commits |
| `preskater-verify` | Run the real checks and report evidence |
| `preskater-review` | Severity-ranked review against the issue |
| `preskater-triage` | Triage bugs and incidents, write the issue |
| `preskater-pr` | Open a PR/MR with evidence and land it |

## How the pieces fit

```text
issue -> branch -> commits -> PR/MR -> review -> merge
```

- `AGENTS.md` is the per-repo baseline: stack, commands, conventions, gotchas.
- The skills encode the process above and read `AGENTS.md` for repo facts.
- `preskater-triage` and `preskater-plan` anchor work to an issue.
- `preskater-pr` detects GitHub or self-hosted GitLab from `git remote -v` and loads the matching commands.

**Skills advise; gates enforce.** The CI validator and the PR/MR template are what produce consistency. The skills make the good path the easy path.

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
├── templates/                 # human-facing plan, PR, and triage templates
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
