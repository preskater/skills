---
name: preskater-build
description: Build production artifacts: the Next.js Docker image, the Helm chart, and the Expo EAS build. Use when preparing a release, producing an artifact, or diagnosing a failed build.
license: MIT
metadata:
  owner: platform
  version: "0.2.0"
---

# Build artifacts

Produce artifacts. Do not deploy. `preskater-release` decides the version; this skill turns it into images, charts, and builds.

## Inputs

- Version `X.Y.Z` or `X.Y.Z-rc.N`
- Registry, image naming, chart path, and EAS project from `AGENTS.md`
- The commit on `main` or the release branch

## Procedure

1. **Preflight.** Confirm the tree is clean, the branch is correct, and the version is decided. Read the nearest `AGENTS.md`.
2. **Build the web image.**

   ```bash
   docker buildx build \
     --platform linux/amd64 \
     --provenance=true \
     --sbom=true \
     -t <registry>/<app>:<version> \
     -t <registry>/<app>:<sha> \
     --push .
   ```

   Capture the digest:

   ```bash
   docker buildx imagetools inspect <registry>/<app>:<version> \
     --format '{{json .Manifest.Digest}}'
   ```

3. **Package the Helm chart.**

   ```bash
   helm lint charts/<app>
   helm template <app> charts/<app> -f charts/<app>/values.staging.yaml >/dev/null
   helm package charts/<app> --destination dist/
   ```

   If charts use OCI:

   ```bash
   helm push dist/<app>-<chart-version>.tgz oci://<registry>/charts
   ```

4. **Build the mobile app.**

   ```bash
   eas build --profile production --platform all --non-interactive --json
   ```

   Record the build IDs and profile. Use `eas update` only when the release plan calls for an OTA update.
5. **Scan the image.**

   ```bash
   trivy image --severity HIGH,CRITICAL <registry>/<app>@<digest>
   ```

   Stop on critical findings unless the release explicitly accepts the risk.
6. **Record the manifest.**

## Output

| Artifact | Reference | Version | Digest or ID |
| --- | --- | --- | --- |
| Web image | `<registry>/<app>` | | |
| Helm chart | `dist/<app>-<chart>.tgz` | | |
| Expo build | `<profile>` | | |
| Expo update | `<channel>` | | |

## Gotchas

- Use `npm ci` and the committed lockfile. A build from a dirty tree is not reproducible.
- `NEXT_PUBLIC_*` and `EXPO_PUBLIC_*` are baked in at build time. Confirm the environment before building.
- Chart `version` and `appVersion` are different fields. Do not conflate them.
- EAS builds run on Expo infrastructure; `eas whoami` must be authenticated.
- Never build a production artifact from an unmerged branch.
- Never tag `latest`. Deployments reference a digest.
- Never push a tag or image tag that already exists with different content.
