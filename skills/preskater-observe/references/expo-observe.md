# Expo Observe

Expo Observe collects startup, navigation, error, and session data from the Expo app. The EAS CLI can query the same data the dashboard shows.

## Runtime setup

```bash
npx expo install expo-observe
```

Configure at app startup:

```ts
import { Observe } from "expo-observe";

Observe.configure({
  environment: process.env.EXPO_PUBLIC_APP_ENV,
  sampleRate: 0.25,
  errorSampleRate: 1,
  networkTraces: true,
});
```

- `sampleRate` is deterministic per installation.
- `errorSampleRate` is a minimum; in-sample installations always send errors.
- Debug builds do not dispatch by default. `dispatchInDebug` is for testing only.
- Environment defaults to `NODE_ENV`; override it explicitly per build.

## CLI prerequisites

```bash
eas whoami
eas observe:versions --json --non-interactive
```

Every command accepts `--project-id`, `--json`, `--non-interactive`, `--days`, `--start`, `--end`, `--environment`, and `--platform`.

## Queries

```bash
eas observe:metrics-summary --days 7 --stat median --stat p90 --json --non-interactive
eas observe:metrics tti --sort slowest --days 7 --limit 20 --json --non-interactive
eas observe:routes --metric nav_tti --days 7 --json --non-interactive
eas observe:errors --severity fatal --days 7 --json --non-interactive
eas observe:errors --fingerprint <fingerprint> --json --non-interactive
eas observe:session <session-id> --json --non-interactive
eas observe:versions --days 14 --json --non-interactive
```

Compare the current app version against the previous one. Filter by `--environment production` when staging and production share a project.

## CI gate

```bash
eas observe:metrics-summary --metric tti --json --non-interactive
```

Parse the JSON and fail the job when a threshold is exceeded. Keep the threshold in the repository, not in a person's head.

## Gotchas

- Debug builds distort performance. Do not compare them to production.
- A custom `endpointUrl` sends OTLP to your own collector; the EAS commands then have no data.
- Data is grouped by environment. A missing environment tag makes comparisons meaningless.
- Some features require a specific Expo plan; a command can fail with an upgrade message.
- Session IDs are required in non-interactive mode.
