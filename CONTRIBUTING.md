# Contributing a skill

All participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). Report vulnerabilities through the [security policy](SECURITY.md), never a public issue. Project roles and decision making are described in [GOVERNANCE.md](GOVERNANCE.md).

## Principles

- **One coherent unit of work.** If a skill needs another skill to make sense, merge them or split differently.
- **Start from real expertise.** Extract from a task that actually happened, including the corrections you made. Do not ask a model to invent generic best practices.
- **Add what the agent lacks.** Omit explanations of things a capable model already knows.
- **Front-load the description.** Codex may shorten descriptions under context pressure; Claude truncates the listing. The first sentence must carry the use case.
- **Keep `SKILL.md` under 500 lines.** Move detail to `references/`, and say when to load it.
- **Match specificity to fragility.** Prescribe exact commands for fragile steps; explain intent where several approaches are valid.

## Anatomy

```text
skills/preskater-example/
├── SKILL.md          # required
├── references/       # optional, loaded on demand
└── assets/           # optional templates and static files
```

File references must stay one level deep and use relative paths from the skill directory.

## Frontmatter

```yaml
---
name: preskater-example
description: Do the thing and say when to use it. Use when the user asks for the thing, mentions relevant keywords, or needs the workflow before shipping.
license: MIT
metadata:
  owner: platform
  version: "0.1.0"
---
```

Rules:

- `name` matches the directory exactly: lowercase, digits, single hyphens, at most 64 characters, `preskater-` prefix.
- `description` is 1–1024 characters and answers **what** and **when**, with trigger words first.
- Portable core only. No Claude-only fields (`context`, `agent`, `disable-model-invocation`, `allowed-tools`, `hooks`, `paths`, `shell`), no OpenCode-only metadata, no `` !`command` `` injection, no absolute paths.
- `license: MIT`.
- `metadata.owner` and `metadata.version` are required by this catalog.

## Authoring workflow

1. Do the task once with an agent. Note the steps that worked and where you corrected it.
2. Draft `SKILL.md` with the standard sections: when to use, procedure, output, gotchas, scaling.
3. Write 5–10 prompts that should activate it and 3–5 that should not.
4. Test in all three harnesses. A skill that only works in one is not done.
5. Open an issue, branch, and PR following the repository workflow.

## Pull requests

- Title follows Conventional Commits. The `pr-title` check enforces it.
- Use the [pull request template](.github/PULL_REQUEST_TEMPLATE.md).
- Link the issue with `Closes #<n>`.
- Keep the change to one skill or one concern.
- Keep commits atomic. Squash fixups before review.

## Review checklist

- [ ] Activates on the intended prompt and stays quiet on adjacent ones.
- [ ] Procedure is ordered and has no hidden prerequisites.
- [ ] Every command exists in `AGENTS.md` or is explicitly discovered first.
- [ ] Output format is concrete enough to compare across people.
- [ ] Gotchas are specific to this stack, not general advice.
- [ ] No secrets, internal hostnames, or customer data.
- [ ] `node scripts/validate.mjs` passes.
- [ ] `npx --yes markdownlint-cli2@0.24.2` passes.
- [ ] Tested in Claude Code, Codex, and OpenCode.

## Versioning

Version lives in `metadata.version` and `catalog.json`.

- **Major** — output contract or workflow steps change incompatibly.
- **Minor** — new step, new gotcha, new supported case.
- **Patch** — wording, typos, clarity.

Add an entry to `catalog.json` for every new skill and keep the bundle lists current.

## Deprecating

Mark the skill deprecated in its description and `catalog.json`, keep it for one minor release, then remove it and note the replacement in the PR.

## Releasing

1. Bump `version` in `catalog.json` and in each changed skill's `metadata.version`.
2. Move the `Unreleased` entries in `CHANGELOG.md` under the new version.
3. Open a PR titled `chore(release): vX.Y.Z` and merge it to `main`.
4. Tag the merge commit and push the tag:

   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

5. The release workflow validates the catalog and publishes notes. It fails if the tag is not on `main`.
