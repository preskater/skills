# GitLab issues and incidents

Use the `glab` CLI against the self-hosted instance.

## Authenticate

```bash
glab auth status
glab auth login --hostname "$GITLAB_HOST"
```

If `glab` is not configured, ask the user for the hostname. Never hardcode the hostname in this public repository.

## Read and search

```bash
glab issue view <n> --comments
glab issue list --search "<error text>" --all
glab issue list --label "type::bug"
```

## Create

```bash
glab issue create \
  --title "<summary>" \
  --description "$(cat /tmp/triage.md)" \
  --label "type::bug" \
  --label "severity::2" \
  --label "area::auth"
```

## Incidents

Use the Incident issue type when the project enables it. Otherwise label with `type::incident` and `severity::1`.

```bash
glab issue create \
  --title "Incident: <summary>" \
  --description "$(cat /tmp/triage.md)" \
  --label "type::incident" \
  --label "severity::1"
```

## Update

```bash
glab issue note <n> --message "$(cat /tmp/triage.md)"
glab issue update <n> --label "severity::2" --label "area::auth"
```

## Labels

Scoped labels: `severity::1` … `severity::4`, `type::bug`, `type::incident`, `area::<name>`.

## Links

Reference related work with `#<n>`. Close from the merge request description with `Closes #<n>`.
