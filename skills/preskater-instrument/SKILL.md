---
name: preskater-instrument
description: Instrument an app for observability: Next.js OpenTelemetry, OTLP export to Grafana Alloy, resource attributes, custom spans, and Expo Observe. Use when adding a service, before a first deploy, or when observe has no traces, logs, or metrics.
license: MIT
metadata:
  owner: platform
  version: "0.3.0"
---

# Instrument an app

`preskater-observe` can only read signals that exist. Set up telemetry before the first production deploy, and whenever a failure mode is invisible.

## Procedure

1. **Inventory.**
   - Runtimes: Next.js web, Expo mobile, workers, cron jobs.
   - Existing instrumentation, exporters, and environment variables.
   - Collector endpoint and environment name from `AGENTS.md`.
2. **Choose the SDK.**
   - Next.js: `@vercel/otel` by default.
   - Manual `NodeSDK` only when you need customization, and only for `NEXT_RUNTIME === 'nodejs'`.
   - Expo: `expo-observe`.
3. **Add the Next.js instrumentation file** at the app root:

   ```ts
   // apps/web/instrumentation.ts
   import { registerOTel } from '@vercel/otel'

   export function register() {
     registerOTel({ serviceName: 'web' })
   }
   ```

   Load `references/nextjs.md` for manual setup, edge constraints, error capture, and custom spans.
4. **Configure export with environment variables.**

   ```text
   OTEL_EXPORTER_OTLP_ENDPOINT=http://alloy.observability.svc:4318
   OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
   OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production,service.version=1.4.2
   ```

   Never hardcode an endpoint token or header. Inject from Helm values and Kubernetes secrets.
5. **Tag everything.** `service.name`, `deployment.environment`, and `service.version` are mandatory. Add pod and namespace through the collector. Never put user ID, email, or request bodies in span attributes.
6. **Instrument the mobile app.**

   ```ts
   import { Observe } from 'expo-observe'

   Observe.configure({
     environment: process.env.EXPO_PUBLIC_APP_ENV,
     errorSampleRate: 1,
   })
   ```

   See the `preskater-observe` reference for the full configuration.
7. **Add custom spans only where they answer a question.** Payments, auth, external calls, and queue handlers. Record exceptions and set error status. Do not create spans at module load or inside `register()`; they do not join request traces.
8. **Deploy the collector.** Grafana Alloy receives OTLP on 4317/4318, batches and tail-samples while keeping errors, and exports traces to Tempo, metrics to Prometheus, and logs to Loki. Load `references/grafana-alloy.md`.
9. **Verify locally.**
   - Run Alloy and the backend with Compose.
   - Send one request.
   - Confirm the root span `GET /path`, its child spans, the resource attributes, and a log line carrying the trace ID.
   - Set `NEXT_OTEL_VERBOSE=1` temporarily when the default spans are not enough.
10. **Hand off.** Run `preskater-observe` after the first deploy.

## Output

```markdown
## Instrumentation
| Runtime | SDK | Service name | Exporter | Verified |
| --- | --- | --- | --- | --- |
| web | @vercel/otel | web | Alloy → Tempo | yes |
| mobile | expo-observe | | EAS Observe | yes |

## Resource attributes

## Custom spans

## Collector

## Not instrumented
```

## Gotchas

- `instrumentation.ts` must be at the app root. In a monorepo that is `apps/web/`, not the repository root.
- `@vercel/otel` works on edge; manual `NodeSDK` does not.
- Use `BatchSpanProcessor` in production. `SimpleSpanProcessor` is a documentation shortcut.
- Do not initialize both `@vercel/otel` and a manual SDK; you get duplicate spans.
- OTLP environment variables must exist at runtime, not only at build time.
- Tail sampling must keep all errors. Sampling before classification hides incidents.
- NetworkPolicy must allow the app to reach the collector, and nothing else.
- Span attributes and logs are data. Never put secrets, tokens, or PII in them.
