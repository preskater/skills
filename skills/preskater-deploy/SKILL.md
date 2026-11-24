---
name: preskater-deploy
description: Deploy through ArgoCD and Helm: promote staging to production, run the migration job, verify rollout health, and roll back safely. Use when deploying, promoting a release, or rolling back.
license: MIT
metadata:
  owner: platform
  version: "0.2.0"
---

# Deploy with ArgoCD

ArgoCD is the only staging and production deploy path. Docker Compose is for local testing, and Helm charts are validated against a local cluster before release.

## Hard rules

- Never run `kubectl apply`, `helm upgrade`, or `helm install` against staging or production.
- Confirm `argocd context` and `kubectl config current-context` before every action.
- Production sync needs explicit human approval. Staging can be automated.
- Migrations run only through the `<app>-migrate` PreSync Job.
- Deploy an image digest, never `latest`.

## Procedure

1. **Preflight.**

   ```bash
   argocd context
   kubectl config current-context
   argocd app get <app>-<env>
   ```

   Confirm the environment, image digest, chart version, and migration image. Stop if any is ambiguous.
2. **Validate locally.**

   ```bash
   helm lint charts/<app>
   helm template <app> charts/<app> -f values/<env>.yaml \
     | kubectl apply --dry-run=server -f -
   ```

   Load `references/local-kube.md` to install the chart in a local cluster and smoke test it.
3. **Update the GitOps values.** Set the image to the digest in the environment values file, then commit or open the PR. The GitOps repository is the source of truth.
4. **Diff before sync.**

   ```bash
   argocd app diff <app>-<env>
   ```

   Read the diff. Stop if it includes unrelated resources.
5. **Sync and wait.**

   ```bash
   argocd app sync <app>-<env>
   argocd app wait <app>-<env> --health --sync --timeout 600
   ```

   If the Application auto-syncs, wait for the new revision instead of triggering a sync.
6. **Verify the migration.**

   ```bash
   kubectl -n <namespace> get jobs
   kubectl -n <namespace> logs job/<app>-migrate
   ```

   The app must not roll out before the migration completes. Load `references/argocd.md`.
7. **Smoke test.** Hit the health and readiness endpoints and the critical user flow.
8. **Promote.** Staging first, observe with `preskater-observe`, then repeat for production with approval.
9. **Annotate and observe.** Mark deploy start and end in Grafana, then run `preskater-observe`.
10. **Record.** Fill `templates/deploy-record.md`.

## Rollback

- Preferred: revert the GitOps commit and let ArgoCD reconcile.
- Immediate: `argocd app rollback <app>-<env> <revision>`.
- Verify health and smoke again.
- Migrations are forward-only. Roll back the app, then ship a corrective migration.

## Output

A deploy record with environment, digests, ArgoCD revision, sync ID, migration result, smoke output, and rollback status.

## Gotchas

- `argocd app sync` can apply a newer Git revision than the one you reviewed. Check `argocd app history`.
- A successful sync is not a successful deploy. Wait for health and run smoke tests.
- Helm hook Jobs are deleted according to `hook-delete-policy`; do not rely on old logs.
- Local Compose is not production parity. Test the chart in a local cluster.
- If the Application auto-syncs, a Git commit can deploy without a human. Confirm approval before committing production values.
- Never paste kubeconfig, tokens, or secret values into logs or the PR.
- Never deploy from an unmerged branch or a mutable tag.
