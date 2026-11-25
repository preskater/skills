# Docker image

## Dockerfile

- Multi-stage: dependencies, build, runtime.
- `npm ci` against the committed lockfile.
- Runtime stage runs as a non-root user with `NODE_ENV=production` and no dev dependencies.
- Next.js: set `output: "standalone"`, then copy `.next/standalone`, `.next/static`, and `public`.
- Pin the base image by digest, not only by tag.

## Build and push

```bash
docker buildx build \
  --platform linux/amd64 \
  --provenance=true \
  --sbom=true \
  -t "$REGISTRY/$APP:$VERSION" \
  -t "$REGISTRY/$APP:$GIT_SHA" \
  --push .
```

Capture the digest:

```bash
docker buildx imagetools inspect "$REGISTRY/$APP:$VERSION" \
  --format '{{json .Manifest.Digest}}'
```

Reference the digest in GitOps values:

```yaml
image:
  repository: registry.example.com/app
  digest: sha256:...
```

## Diagnostics

- **Build fails on a native module:** confirm the build stage has the toolchain, and that the runtime stage has the shared libraries.
- **Image is huge:** check that dev dependencies are not in the runtime stage and that `.dockerignore` excludes `node_modules`, `.next`, and `.git`.
- **`NEXT_PUBLIC_*` missing:** it is baked at build time; rebuild with the correct value.
- **Cache misses:** use `--cache-from` and a registry cache when CI supports it.
