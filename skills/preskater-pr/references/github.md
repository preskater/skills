# GitHub pull requests

Use the `gh` CLI.

```bash
gh auth status
```

## Open

```bash
gh pr create \
  --base main \
  --head "$(git branch --show-current)" \
  --title "<type>(<scope>): <summary>" \
  --body-file /tmp/pr.md
```

Draft:

```bash
gh pr create --draft --base main --title "..." --body-file /tmp/pr.md
```

## Inspect

```bash
gh pr view <n>
gh pr diff <n>
gh pr checks <n>
```

## Review

```bash
gh pr review <n> --approve
gh pr review <n> --request-changes --body "Blocking: ..."
gh pr review <n> --comment --body "..."
```

## Merge

```bash
gh pr merge <n> --squash --delete-branch
gh pr merge <n> --merge --delete-branch
gh pr merge <n> --rebase --delete-branch
```

Use the repository's configured method. Do not override it.

## Links

- `Closes #<n>` in the body closes the issue on merge.
- `Refs #<n>` links related work without closing.
