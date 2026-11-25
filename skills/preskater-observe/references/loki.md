# Loki

Query logs through the Loki HTTP API or Grafana. Use labels first, then filter the stream.

## Endpoint

```bash
curl -fsS --get "$LOKI_URL/loki/api/v1/query_range" \
  --data-urlencode 'query={namespace="production", app="<app>"} |= "error"' \
  --data-urlencode "start=$(date -u -v-1H +%s)000000000" \
  --data-urlencode "end=$(date -u +%s)000000000" \
  --data-urlencode 'limit=200'
```

On Linux, use `date -u -d '1 hour ago' +%s` instead of the macOS `-v` form.

## Common queries

Errors for one service:

```logql
{namespace="production", app="<app>"} |= "error"
```

Count errors over time:

```logql
sum(count_over_time({app="<app>"} |= "error" [5m]))
```

Structured JSON logs:

```logql
{app="<app>"} | json | level="error"
```

New messages after a deploy:

```logql
{app="<app>"} |= "panic" or "timeout" or "ECONNREFUSED"
```

## Workflow

1. Start with the `app` and `namespace` labels.
2. Filter with `|=` for text, `|~` for a regex, and `!=` to exclude noise.
3. Use `json` or `logfmt` parsing only after the stream is narrow.
4. Compare the log volume and message set to the same window before the deploy.

## Gotchas

- High-cardinality label selectors scan too much. Keep the label set small.
- Logs can be sampled or dropped under load. A quiet log is not proof of health.
- Do not paste raw log lines that contain tokens, cookies, or customer data.
- Timestamps are nanoseconds; a seconds value returns nothing.
