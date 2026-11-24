# Docker Compose for local testing

Compose is for local development and smoke tests. It is not a production parity environment and is never a deploy target.

## Start

```bash
docker compose -f compose.yaml up -d --build
docker compose ps
docker compose logs -f <service>
```

## Health

```bash
curl -fsS http://localhost:3000/health
```

Prefer a healthcheck in `compose.yaml` and wait for `healthy`:

```bash
docker compose up -d --wait
```

## Migrations

If Compose includes the migrate image, run it as a one-shot:

```bash
docker compose run --rm <app>-migrate
```

The production equivalent is the ArgoCD `PreSync` Job. Do not copy Compose commands into staging or production.

## Stop

```bash
docker compose down
docker compose down -v   # also removes volumes; destroys local data
```

## Gotchas

- Compose networking and DNS differ from Kubernetes. A service name that works here may not resolve in the cluster.
- Local images are not the artifacts you deploy. Build and tag the real image for the cluster test.
- Secrets in a local `.env` file stay out of Git.
