---
name: preskater-security-review
description: Security review a change: threat model, authentication and authorization, secrets, input validation, dependencies, container and Helm hardening, ArgoCD RBAC, Supabase RLS, and PII. Use for auth, data, infrastructure, dependency, or pre-release changes.
license: MIT
metadata:
  owner: platform
  version: "0.2.0"
---

# Security review

Findings are severity-ranked. This skill reviews; it does not rewrite unless asked.

## Procedure

1. **Scope and threat model.** What is the asset, who can reach it, and what is the worst outcome?
2. **Authentication and authorization.** better-auth sessions, Server Actions, route handlers, ArgoCD RBAC, Grafana roles. Middleware is not an authorization boundary.
3. **Input and output.** Server-side zod validation, parameterized queries, no raw SQL interpolation, safe rendering.
4. **Secrets.** No secrets in Git, Helm values, logs, or client bundles. Service-role keys are server-only. `.env.example` is current.
5. **Data.** Supabase RLS on every exposed table, with tests. PII minimized, retention defined, backup access restricted.
6. **Dependencies and supply chain.** Lockfile committed, `npm audit`, pinned actions, image digests, Trivy results.
7. **Containers and Helm.** Non-root, read-only root filesystem, dropped capabilities, resource limits, no privileged or hostPath, NetworkPolicy, Pod Security Standards, secrets through External Secrets or Sealed Secrets.
8. **Delivery.** ArgoCD project scoping, no wildcard repository access, production sync approval, audit logs.
9. **Report.**

## Output

```markdown
## Summary

## Blocking
- `file:line` — issue, impact, fix

## Should fix
- ...

## Nits
- ...

## Checks run
- ...
```

## Gotchas

- A secret in a private repository is still leaked. Rotate first, then remove it from history.
- `latest` tags and unpinned actions are supply-chain risk.
- A publicly shared Grafana link can leak metrics, labels, and service names.
- Suspected vulnerabilities go through private advisories, not this review or a public issue.
- Encryption in transit and at rest is table stakes; check it, but do not stop there.
