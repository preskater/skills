---
name: preskater-observe
description: Observe a release with Grafana golden signals and SLO burn for backend and web, plus Expo Observe metrics and crashes for mobile. Use after deploy, during a watch window, or when asked whether a release is healthy.
license: MIT
metadata:
  owner: platform
  version: "0.2.0"
---

# Observe a release

Report evidence. Do not declare success from a green sync or a single dashboard.

## Procedure

1. **Set the window.** Deploy start and end, plus an equal window before it as baseline. Use the Grafana deployment annotation when present.
2. **Backend and web.**
   - Firing alerts in Grafana.
   - Request rate, 5xx rate, p95/p99 latency, saturation: CPU, memory, connections, queue depth.
   - Loki error patterns, new messages, and volume versus baseline.
   - Tempo traces for the top errors.
   - SLO burn rate for the window.

   Load `references/grafana.md`, `references/prometheus.md`, `references/loki.md`, and `references/tempo.md`.
3. **Mobile.**

   ```bash
   eas observe:versions --json --non-interactive
   eas observe:metrics-summary --metric tti --metric cold_launch --json --non-interactive
   eas observe:errors --severity fatal --days 1 --json --non-interactive
   eas observe:routes --metric nav_tti --days 1 --json --non-interactive
   ```

   Compare the current version with the previous one. Load `references/expo-observe.md`.
4. **Decide.**
   - **Roll back** — new error class, SLO burn beyond budget, crash rate up, or saturation with user impact.
   - **Hold** — ambiguous signal; keep watching and name the next check.
   - **Proceed** — signals within baseline and no new errors.
5. **Report.**

## Output

```markdown
## Observation
| Signal | Baseline | Current | Verdict |
| --- | --- | --- | --- |
| 5xx rate | | | |
| p99 latency | | | |
| Saturation | | | |
| Mobile crashes | | | |

## Alerts firing
## New errors
## Verdict
Roll back / hold / proceed, with evidence.
```

## Gotchas

- Traffic seasonality can look like a regression. Compare the same weekday and hour where possible.
- Low traffic makes rates noisy. Prefer counts and absolute errors over percentages alone.
- A missing deploy annotation means the comparison is unreliable. Add it first.
- EAS Observe does not dispatch debug builds by default. Do not compare debug data to production.
- Sampling is deterministic per installation; check `sampleRate` before extrapolating.
- A single spike is not an incident. Require a sustained signal or user impact.
- Never print tokens or full request bodies when quoting logs.
