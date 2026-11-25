# Expo EAS build

## Profiles

Define production builds in `eas.json`:

```json
{
  "build": {
    "production": {
      "distribution": "store",
      "channel": "production",
      "environment": "production"
    }
  }
}
```

## Build

```bash
eas whoami
eas build --profile production --platform all --non-interactive --json
```

The JSON output contains the build IDs. Record them in the artifact manifest.

## Inspect

```bash
eas build:list --limit 10 --non-interactive
eas build:view <build-id> --json
```

## Over-the-air updates

Use `eas update` only when the release plan allows it:

```bash
eas update --branch production --message "fix: ..." --non-interactive
```

An OTA update skips store review. Treat it as a release: verify, observe, and keep a rollback path.

## Runtime

- `expo-observe` must be installed and configured at build time; see the `preskater-observe` skill.
- Native config changes require a new build, not an OTA update.
- Confirm the EAS project ID and account before building.
