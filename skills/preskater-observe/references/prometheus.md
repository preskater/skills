# Prometheus

Use the Prometheus HTTP API directly, or through Grafana's datasource proxy. Metric names vary per app; confirm them in the dashboard panels before trusting a query.

## Endpoints

```bash
curl -fsS "$PROMETHEUS_URL/api/v1/query?query=<promql>"
curl -fsS "$PROMETHEUS_URL/api/v1/query_range?query=<promql>&start=<rfc3339>&end=<rfc3339>&step=60s"
curl -fsS "$PROMETHEUS_URL/api/v1/alerts"
curl -fsS "$PROMETHEUS_URL/api/v1/rules"
```

## Golden signals

Request rate:

```promql
sum(rate(http_requests_total[5m])) by (service)
```

5xx ratio:

```promql
sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
/
sum(rate(http_requests_total[5m])) by (service)
```

p95 latency:

```promql
histogram_quantile(
  0.95,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service)
)
```

Saturation:

```promql
sum(rate(container_cpu_usage_seconds_total{container!=""}[5m])) by (pod)
sum(container_memory_working_set_bytes{container!=""}) by (pod)
```

Database connections:

```promql
pg_stat_activity_count{datname="<db>"}
```

## SLO burn

If recording rules exist, use them:

```promql
slo:error_budget_burn_rate:ratio5m{service="<app>"}
```

Otherwise compute the ratio directly and compare it to the SLO target.

## Compare windows

Query the deploy window and an equal window immediately before it. Report absolute values and the delta, not only a percentage.

## Gotchas

- A metric that disappears after a deploy is a signal. Check for renamed labels or a broken scrape.
- `rate()` needs at least two samples. A five-minute window can be empty on low traffic.
- Cardinality explosions come from unbounded labels such as user ID or URL path.
