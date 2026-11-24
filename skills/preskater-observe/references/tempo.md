# Tempo

Use Tempo to follow a failing request from the log line to the trace and back.

## Search

TraceQL through the API:

```bash
curl -fsS --get "$TEMPO_URL/api/search" \
  --data-urlencode 'q={ resource.service.name = "<app>" && status = error }' \
  --data-urlencode 'limit=20'
```

By trace ID:

```bash
curl -fsS "$TEMPO_URL/api/traces/<trace-id>"
```

By tag:

```bash
curl -fsS --get "$TEMPO_URL/api/search" \
  --data-urlencode 'tags=service.name=<app> error=true'
```

## Reading a trace

- Find the first span that fails, not the last one that logs the failure.
- Check the span duration against the p95 from Prometheus.
- Note the trace ID and link it in the observation report or incident timeline.
- If logs carry `trace_id`, query Loki for that ID to get the full context.

## Gotchas

- Tempo is sampled. Absence of a trace does not mean the request succeeded.
- Missing service names mean instrumentation is incomplete; fix the resource attributes.
- Trace search over a long window is expensive. Narrow by time and service first.
- Do not copy full trace payloads that contain request bodies with personal data.
