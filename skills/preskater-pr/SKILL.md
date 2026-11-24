---
name: preskater-pr
description: Open a pull request or merge request for a completed change: self-review the diff, write the body with test evidence and risk, link the issue, and land it through review. Use when implementation and verification are done, or when asked to open a PR/MR, prepare a change for review, or merge.
license: MIT
metadata:
  owner: platform
  version: "0.1.0"
---

# Open a pull request or merge request

Run `preskater-verify` first. A PR without evidence is not ready.

## Preconditions

- A branch with the change.
- A linked issue.
- Verification output in hand.

## Procedure

1. **Sync with main.**

   ```bash
   git fetch origin
   git rebase origin/main
   ```

   Resolve conflicts, then rerun verification after the rebase.
2. **Self-review the diff.** Read `git diff origin/main...HEAD` as a reviewer would. Fix anything you would flag.
3. **Check the commits.**

   ```bash
   git log --oneline origin/main..HEAD
   ```

   Every message follows Conventional Commits. Squash fixups before opening.
4. **Push.**

   ```bash
   git push -u origin HEAD
   ```

5. **Detect the host.** Read `git remote -v`, then load `references/github.md` or `references/gitlab.md`.
6. **Write the body** with the template below. Fill every section; write "none" instead of deleting one.
7. **Open the PR/MR** against `main`, as a draft if CI or the change is still in progress.
8. **Watch CI.** Fix failures. Do not force-push over a review in progress without saying so.
9. **Merge** only when blocking findings are resolved and CI is green. Use the repository's merge method.

## Body template

```markdown
## What

## Why
Closes #<issue>

## How
- ...

## How tested
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npx turbo run build`
- [ ] `npm run test:e2e` — flow:
- Manual:

## Risk and rollback
- Risk:
- Rollback:

## Screenshots
<!-- UI changes only -->
```

## Rules

- One PR, one concern. Split unrelated changes.
- No secrets, customer data, or internal hostnames in the body.
- Do not merge your own PR when the repo requires another reviewer.
- Do not rewrite history after review starts without telling the reviewers.
- Do not change the merge method. Follow the repository setting.

## Gotchas

- A green CI run on an old commit proves nothing after a rebase.
- Draft PRs still consume review attention; say what is missing.
- If the diff includes a schema migration, call it out explicitly and name who applies it.
- If the branch is stacked on another, target that branch instead of `main` and say so.
