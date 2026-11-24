# GitHub Issues

Use the `gh` CLI. Check authentication first; if it fails, ask the user to run `gh auth login`.

```bash
gh auth status
```

## Read and search

```bash
gh issue view <n> --comments
gh issue list --search "<error text> in:title,body" --state all
gh issue list --label "type:bug" --state open
```

## Create

```bash
gh issue create \
  --title "<summary>" \
  --body-file /tmp/triage.md \
  --label "type:bug" \
  --label "sev:2" \
  --label "area:auth"
```

For an incident, use `--label "type:incident"` and `--label "sev:1"`.

## Update

```bash
gh issue comment <n> --body-file /tmp/triage.md
gh issue edit <n> --add-label "sev:2" --add-label "area:auth"
```

Create a missing label once:

```bash
gh label create "sev:2" --color FBCA04 --description "Major impact, no workaround"
```

## Labels

- `sev:1` … `sev:4`
- `type:bug`, `type:incident`
- `area:<name>`

## Links

Reference related work with `#<n>`. Close from the pull request body with `Closes #<n>`.
