# Helm chart

## Chart layout

```text
charts/<app>/
├── Chart.yaml
├── values.yaml
├── values.staging.yaml
├── values.production.yaml
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    ├── ingress.yaml
    ├── migrate-job.yaml
    └── networkpolicy.yaml
```

## Version fields

```yaml
apiVersion: v2
name: <app>
version: 0.2.0        # chart version
appVersion: "1.4.2"   # application version
```

Bump `version` on every chart change. Bump `appVersion` when the image changes.

## Validate and package

```bash
helm lint charts/<app>
helm template <app> charts/<app> -f charts/<app>/values.staging.yaml >/dev/null
helm package charts/<app> --destination dist/
```

Push to an OCI registry when the chart is distributed:

```bash
helm push dist/<app>-<chart-version>.tgz oci://<registry>/charts
```

## Values

- Keep one file per environment. Do not branch inside templates for environment behavior.
- Set the image by digest in staging and production.
- Never put secrets in values files. Use External Secrets or Sealed Secrets.
- Set resource requests and limits explicitly.

## Migration hook

Prefer an ArgoCD `PreSync` Job over a Helm hook so ArgoCD can report its status. See the `preskater-deploy` skill for the hook.
