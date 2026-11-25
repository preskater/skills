# Governance

This document describes how the Preskater skills catalog is maintained.

## Roles

**Contributor** — anyone who opens an issue, discussion, or pull request. No prior approval is needed to propose a change.

**Reviewer** — a contributor trusted to review pull requests in an area. Reviewers can approve changes but cannot merge them.

**Maintainer** — a member of `@preskater/maintainers`. Maintainers triage issues, merge pull requests, cut releases, and set direction.

## Decision making

Routine changes use **lazy consensus**: a pull request with one maintainer approval and green CI merges after 72 hours unless a maintainer objects.

Changes to this document, the license, or the set of maintainers require approval from two maintainers and a 7-day comment period.

## Skill lifecycle

| State | Meaning |
| --- | --- |
| Proposed | An issue using the new skill template |
| Draft | A pull request with `SKILL.md`, catalog entry, and trigger prompts |
| Stable | Merged and included in a tagged release |
| Deprecated | Marked in the description and `catalog.json`, kept for one minor release |

A skill reaches **stable** when it meets the bar in [CONTRIBUTING.md](CONTRIBUTING.md): portable frontmatter, passing validation, tested in Claude Code, Codex, and OpenCode, and accompanied by trigger prompts.

## Adding maintainers

A contributor becomes a maintainer after sustained, high-quality contributions and approval from two existing maintainers. Maintainers who become inactive for six months move to emeritus status.

## Changes to governance

Open a pull request against this file. Describe the problem, the proposed rule, and the effect on existing contributors.

## Code of conduct

Participation is governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Enforcement is handled privately by the maintainers.
