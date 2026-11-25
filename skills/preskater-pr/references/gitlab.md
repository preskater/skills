# GitLab merge requests

Use the `glab` CLI against the self-hosted instance already configured in `glab`.

```bash
glab auth status
```

Never hardcode the hostname in this public repository.

## Open

```bash
glab mr create \
  --source-branch "$(git branch --show-current)" \
  --target-branch main \
  --title "<type>(<scope>): <summary>" \
  --description "$(cat /tmp/pr.md)"
```

Draft:

```bash
glab mr create --draft --title "..." --description "$(cat /tmp/pr.md)"
```

## Inspect

```bash
glab mr view <n>
glab mr diff <n>
glab ci status
```

## Review

```bash
glab mr approve <n>
glab mr note <n> --message "Blocking: ..."
```

## Merge

```bash
glab mr merge <n> --squash --remove-source-branch
glab mr merge <n> --merge --remove-source-branch
```

Use the project's configured method. Confirm required approvals before merging.

## Links

- `Closes #<n>` in the description closes the issue on merge.
- `Refs #<n>` links related work without closing.
