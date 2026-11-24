# Next.js OpenTelemetry

Next.js instruments its own server spans. You add the SDK and an exporter.

## Install

```bash
npm install @vercel/otel @opentelemetry/sdk-logs @opentelemetry/api-logs @opentelemetry/instrumentation
```

## Default setup

Create `instrumentation.ts` at the **root of the Next.js app**:

```ts
// apps/web/instrumentation.ts
import { registerOTel } from '@vercel/otel'

export function register() {
  registerOTel({ serviceName: 'web' })
}
```

If the app uses `src/`, put the file in `src/instrumentation.ts`. Do not put it in `app/` or at the monorepo root.

## Runtime configuration

```text
OTEL_EXPORTER_OTLP_ENDPOINT=http://alloy.observability.svc:4318
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_SERVICE_NAME=web
OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production,service.version=1.4.2
```

The endpoint is read at runtime. A value present only during `next build` will not reach the collector.

## Manual NodeSDK

Use this only when `@vercel/otel` does not expose what you need.

```ts
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./instrumentation.node')
  }
}
```

```ts
// instrumentation.node.ts
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'

const sdk = new NodeSDK({
  resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: 'web' }),
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
})

sdk.start()
```

- `NodeSDK` is Node-only. Edge runtime requires `@vercel/otel`.
- Use `BatchSpanProcessor`. The guide's `SimpleSpanProcessor` is for examples.
- Do not also call `registerOTel`; that duplicates spans.

## Custom spans

Create them while handling a request, not at module load:

```ts
import { trace } from '@opentelemetry/api'

const tracer = trace.getTracer('web')

export async function charge(orderId: string) {
  return tracer.startActiveSpan('billing.charge', async (span) => {
    try {
      return await chargeOrder(orderId)
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({ code: 2, message: 'charge failed' })
      throw error
    } finally {
      span.end()
    }
  })
}
```

## Error capture

Next.js can export `onRequestError` from `instrumentation.ts` for server errors. Check the installed Next.js version, then forward the error to your logger and the active span. Never include request bodies or headers in the report.

## Default spans

Next.js emits spans such as `BaseServer.handleRequest`, `AppRender.getBodyResult`, and `AppRender.fetch`. Useful attributes include `next.span_type`, `next.route`, and `next.rsc`.

- `NEXT_OTEL_VERBOSE=1` exposes more spans.
- `NEXT_OTEL_FETCH_DISABLED=1` disables automatic fetch spans when you instrument fetch yourself.

## Verify

1. Start Alloy and the Tempo backend locally.
2. Run the app with the OTLP endpoint pointing at Alloy.
3. Request a page.
4. Find the root span `GET /path` in Tempo and confirm child spans and `service.name`.
5. Confirm a log line contains the same trace ID.

## Gotchas

- Spans created inside `register()` become separate root traces. Create request spans in page, route handler, or action code.
- A standalone Docker image still needs `instrumentation.ts` in the app root at build time.
- A blocked egress NetworkPolicy makes the app look healthy while dropping every span.
- Sampling at the SDK hides errors that tail sampling could have kept. Prefer tail sampling in Alloy.
- Attribute values are indexed and exported. Treat them as data you are allowed to publish.
