# Local Kubernetes validation

Test the chart in a disposable cluster before promoting it.

## Pick a tool

- `kind` — Kubernetes in Docker, closest to a real cluster.
- `k3d` — k3s in Docker, faster startup.
- `minikube` — useful with a VM driver.

Detect what is installed, then confirm the context before installing:

```bash
kubectl config current-context
```

## kind

```bash
kind create cluster --name <app>-test
kubectl config use-context kind-<app>-test
kind load docker-image "$REGISTRY/$APP:$VERSION" --name <app>-test
```

## k3d

```bash
k3d cluster create <app>-test
kubectl config use-context k3d-<app>-test
k3d image import "$REGISTRY/$APP:$VERSION" -c <app>-test
```

## minikube

```bash
minikube start -p <app>-test
kubectl config use-context <app>-test
minikube -p <app>-test image load "$REGISTRY/$APP:$VERSION"
```

## Install and smoke

```bash
helm upgrade --install <app> charts/<app> \
  --namespace <app>-local --create-namespace \
  -f charts/<app>/values.staging.yaml

kubectl -n <app>-local rollout status deployment/<app> --timeout=180s
kubectl -n <app>-local get pods,jobs
```

Port-forward and run the smoke test:

```bash
kubectl -n <app>-local port-forward svc/<app> 8080:80
curl -fsS http://localhost:8080/health
```

Test the migration Job and the rollback path here, not in staging.

## Cleanup

```bash
kind delete cluster --name <app>-test
k3d cluster delete <app>-test
minikube delete -p <app>-test
```

Never leave a test cluster running on a shared machine.
