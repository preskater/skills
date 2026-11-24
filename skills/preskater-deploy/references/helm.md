# Helm for deployment

ArgoCD renders the chart. Use Helm locally to validate and to test in a local cluster; do not run `helm upgrade` against staging or production.

## Validate

```bash
helm lint charts/<app>
helm template <app> charts/<app> -f charts/<app>/values.staging.yaml >/dev/null
helm template <app> charts/<app> -f charts/<app>/values.staging.yaml \
  | kubectl apply --dry-run=server -f -
```

`--dry-run=server` catches schema and admission errors that client-side rendering misses.

## Values

- One file per environment: `values.staging.yaml`, `values.production.yaml`.
- Set the image by digest, not by mutable tag.
- Keep secrets out of values. Use External Secrets or Sealed Secrets.
- Set resource requests and limits, probes, and a `securityContext`.

## Hooks

ArgoCD runs Helm hooks, but a `PreSync` Job is easier to observe and wait on. For migrations, use the ArgoCD hook from `references/argocd.md`.

## Local install

```bash
helm upgrade --install <app> charts/<app> \
  --namespace <app>-local --create-namespace \
  -f charts/<app>/values.staging.yaml \
  --set image.digest=<local-image-digest>
```

Only against a local cluster context. See `references/local-kube.md`.
