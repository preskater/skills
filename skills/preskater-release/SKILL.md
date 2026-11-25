---
name: preskater-release
description: Prepare and approve a release: derive semver from Conventional Commits, update the changelog and Helm chart version, cut a release candidate, run go/no-go, and tag. Use before deploy or when asked to release, version, or cut a candidate.
license: MIT
metadata:
  owner: platform
  version: "0.3.0"
---

# Release

Release prepares and approves a version. `preskater-deploy` delivers it.

## Procedure

1. **Find the last release.**

   ```bash
   git fetch --tags
   git describe --tags --abbrev=0
   git log <last-tag>..HEAD --oneline
   ```

2. **Compute the version.**
   - `!` or a `BREAKING CHANGE:` footer → major
   - `feat` → minor
   - everything else → patch

   State the reasoning and the commits that drove it.
3. **Update every place the version lives.**
   - `CHANGELOG.md` under a new heading
   - `Chart.yaml`: `version` for the chart, `appVersion` for the app
   - Published package versions
4. **Cut a release candidate first.** Tag `vX.Y.Z-rc.N`, deploy it to staging with `preskater-deploy`, and observe it with `preskater-observe`. Only then cut `vX.Y.Z`.
5. **Run go/no-go.**
   - [ ] Tests and security checks green
   - [ ] Migration reviewed and expand/contract
   - [ ] Rollback path tested or documented
   - [ ] On-call aware and change window confirmed
   - [ ] Release notes drafted
   - [ ] Capacity checked
6. **Tag and publish.**

   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z"
   git push origin vX.Y.Z
   ```

   Generate notes from Conventional Commits. Call out breaking changes and migrations.
7. **Hand off** to deploy. Do not deploy from this skill.

## Output

The completed release checklist, the tag, the version, and the notes.

## Gotchas

- Tags are immutable. Delete and re-tag only before anyone consumes them.
- A release candidate is not a production release. Do not skip staging.
- Mobile store submission is a separate manual step after the EAS build.
- A destructive migration is not a patch release without an explicit plan.
- Do not release from a branch that is not merged to `main`.
- Bump the chart `version` even when `appVersion` does not change.
