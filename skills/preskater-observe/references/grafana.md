# Grafana

Use the already-authenticated Grafana CLI or HTTP API on the machine. Read-only access is enough for observation.

## Connection

Prefer the configured CLI:

```bash
grafanactl config check
grafanactl resources get dashboards
```

If only HTTP is available, use environment variables supplied by the operator. Never print the token.

```bash
curl -fsS -H "Authorization: Bearer $GRAFANA_TOKEN" "$GRAFANA_URL/api/search?query=..."
```

## Alert state

```bash
curl -fsS -H "Authorization: Bearer $GRAFANA_TOKEN" \
  "$GRAFANA_URL/api/alertmanager/grafana/api/v2/alerts"
```

Grafana-managed rules:

```bash
curl -fsS -H "Authorization: Bearer $GRAFANA_TOKEN" \
  "$GRAFANA_URL/api/v1/provisioning/alert-rules"
```

## Dashboards

```bash
curl -fsS -H "Authorization: Bearer $GRAFANA_TOKEN" "$GRAFANA_URL/api/search?query=<app>"
curl -fsS -H "Authorization: Bearer $GRAFANA_TOKEN" "$GRAFANA_URL/api/dashboards/uid/<uid>"
```

Read the panel queries to learn the metric names. Do not guess them.

## Query a datasource

The datasource proxy works when Prometheus or Loki is not directly reachable:

```bash
curl -fsS -X POST -H "Authorization: Bearer $GRAFANA_TOKEN" \
  -H "Content-Type: application/json" \
  "$GRAFANA_URL/api/ds/query" \
  -d '{"queries":[{"refId":"A","datasource":{"type":"prometheus","uid":"<uid>"},"expr":"...","instant":true}],"from":"now-1h","to":"now"}'
```

## Deploy annotations

Mark the deploy window so dashboards can be compared:

```bash
curl -fsS -X POST -H "Authorization: Bearer $GRAFANA_TOKEN" \
  -H "Content-Type: application/json" \
  "$GRAFANA_URL/api/annotations" \
  -d '{"text":"deploy <app> <version>","tags":["deploy","<app>"],"time":<epoch-ms>}'
```

## Gotchas

- Teams and folders can hide dashboards from a service account. Confirm the token's scope.
- A dashboard can be correct while its data source is stale. Check the data source and time range.
- Public snapshot links leak service names and labels. Do not create them for internal incidents.
