# Grafana Alloy

Alloy is Grafana's OpenTelemetry Collector distribution. It receives OTLP from the app and writes traces to Tempo, metrics to Prometheus or Mimir, and logs to Loki.

## Pipeline

```text
app -> OTLP receiver -> memory limiter -> Kubernetes attributes -> batch
                                                          ├-> tail sampling -> Tempo
                                                          ├-> Prometheus exporter -> remote write
                                                          └-> Loki exporter -> Loki
```

## Minimal configuration

```alloy
otelcol.receiver.otlp "default" {
  grpc {
    endpoint = "0.0.0.0:4317"
  }
  http {
    endpoint = "0.0.0.0:4318"
  }
  output {
    metrics = [otelcol.processor.memory_limiter.default.input]
    logs    = [otelcol.processor.memory_limiter.default.input]
    traces  = [otelcol.processor.memory_limiter.default.input]
  }
}

otelcol.processor.memory_limiter "default" {
  check_interval = "1s"
  limit          = "400MiB"
  spike_limit    = "100MiB"
  output {
    metrics = [otelcol.processor.k8sattributes.default.input]
    logs    = [otelcol.processor.k8sattributes.default.input]
    traces  = [otelcol.processor.k8sattributes.default.input]
  }
}

otelcol.processor.k8sattributes "default" {
  auth_type = "serviceAccount"
  extract {
    metadata = [
      "k8s.namespace.name",
      "k8s.pod.name",
      "k8s.deployment.name",
    ]
  }
  output {
    metrics = [otelcol.processor.batch.default.input]
    logs    = [otelcol.processor.batch.default.input]
    traces  = [otelcol.processor.batch.default.input]
  }
}

otelcol.processor.batch "default" {
  timeout         = "5s"
  send_batch_size = 8192
  output {
    metrics = [otelcol.exporter.prometheus.default.input]
    logs    = [otelcol.exporter.loki.default.input]
    traces  = [otelcol.processor.tail_sampling.default.input]
  }
}

otelcol.processor.tail_sampling "default" {
  decision_wait = "10s"
  policy {
    name = "errors"
    type = "status_code"
    status_code {
      status_codes = ["ERROR"]
    }
  }
  policy {
    name = "slow"
    type = "latency"
    latency {
      threshold_ms = 1000
    }
  }
  policy {
    name = "baseline"
    type = "probabilistic"
    probabilistic {
      sampling_percentage = 10
    }
  }
  output {
    traces = [otelcol.exporter.otlp.tempo.input]
  }
}

otelcol.exporter.otlp "tempo" {
  client {
    endpoint = "tempo.observability.svc:4317"
    tls {
      insecure = true
    }
  }
}

otelcol.exporter.prometheus "default" {
  forward_to = [prometheus.remote_write.default.receiver]
}

prometheus.remote_write "default" {
  endpoint {
    url = "http://mimir.observability.svc:9009/api/v1/push"
  }
}

otelcol.exporter.loki "default" {
  forward_to = [loki.write.default.receiver]
}

loki.write "default" {
  endpoint {
    url = "http://loki.observability.svc:3100/loki/api/v1/push"
  }
}
```

Validate with `alloy fmt` and deploy first to staging.

## Kubernetes

- Run Alloy as a Deployment behind a Service named `alloy` in the `observability` namespace.
- Expose 4317 and 4318 only inside the cluster.
- Point the app at `http://alloy.observability.svc:4318`.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: otlp-to-alloy
  namespace: observability
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: alloy
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              observability-ingest: "true"
      ports:
        - protocol: TCP
          port: 4317
        - protocol: TCP
          port: 4318
```

Label the application namespaces with `observability-ingest: "true"`.

## Sampling

- Keep all errors and slow traces.
- Sample success traces at the collector, not the SDK, so errors are not dropped before classification.
- Re-evaluate percentages when traffic grows. Tail sampling needs memory for buffered traces.

## Prometheus notes

- Grafana Mimir accepts remote write directly.
- Plain Prometheus needs `--web.enable-remote-write-receiver`.
- Set `external_labels` or resource attributes so metrics carry `deployment.environment`.

## Gotchas

- OTLP gRPC and HTTP are different ports. Publish both or standardize on one.
- A tail-sampling processor holds traces for `decision_wait`; memory limits must account for it.
- Without Kubernetes attributes, every trace looks like it came from `alloy`.
- A missing NetworkPolicy makes the app drop spans silently. Test with one request.
- Do not expose the OTLP receiver through an Ingress.
