# ArgoCD

ArgoCD reconciles the cluster to the GitOps repository. The agent changes Git; ArgoCD deploys.

## Context and target

```bash
argocd context
kubectl config current-context
argocd app list
argocd app get <app>-<env>
```

Stop if the context or application name does not match the intended environment.

## Inspect before sync

```bash
argocd app get <app>-<env> -o json
argocd app diff <app>-<env>
argocd app history <app>-<env>
```

Check whether auto-sync is enabled:

```bash
argocd app get <app>-<env> -o json \
  | jq '.spec.syncPolicy.automated'
```

- If auto-sync is on, commit to Git and wait for the new revision.
- If auto-sync is off, sync explicitly after reviewing the diff.

## Sync and wait

```bash
argocd app sync <app>-<env> --timeout 600
argocd app wait <app>-<env> --health --sync --timeout 600
```

`Healthy` and `Synced` are separate conditions. Require both.

## Migration PreSync Job

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: <app>-migrate
  annotations:
    argocd.argoproj.io/hook: PreSync
    argocd.argoproj.io/hook-delete-policy: BeforeHookCreation
spec:
  backoffLimit: 1
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migrate
          image: registry.example.com/<app>-migrate:<version>
```

The hook keeps the last Job for logs. Check it after sync:

```bash
kubectl -n <namespace> get jobs
kubectl -n <namespace> logs job/<app>-migrate
```

The app rollout must not start until the Job succeeds.

## Rollback

Preferred: revert the Git commit and let ArgoCD reconcile.

Immediate:

```bash
argocd app history <app>-<env>
argocd app rollback <app>-<env> <revision>
argocd app wait <app>-<env> --health --sync --timeout 600
```

Database migrations are forward-only. Roll back the app, then ship a corrective migration.

## Gotchas

- `argocd app sync` uses the latest Git revision, which may be newer than the one you reviewed.
- A `Synced` app can still be `Degraded`. Check both.
- Do not use `--force` unless you understand the resource replacement it causes.
- Production sync needs explicit approval, even when the CLI allows it.
