---
name: preskater-triage
description: Triage a bug report or production incident: reproduce, assign severity S1-S4, find the owning area, search for duplicates, and write the triage note back to the issue. Use when a bug, outage, or incident report arrives, or when asked to triage, assess severity, route, or prioritize an issue.
license: MIT
metadata:
  owner: platform
  version: "0.1.0"
---

# Triage a bug or incident

Triage produces an issue that someone can act on. Do not fix the bug during triage unless it is a one-line mitigation for an active incident.

## Procedure

1. **Detect the tracker.** Read `git remote -v`.
   - `github.com` → GitHub Issues. Load `references/github.md`.
   - Any other host → self-hosted GitLab. Load `references/gitlab.md`.
2. **Read the report.** Identify expected behavior, actual behavior, environment, when it started, blast radius, and whether data or credentials are involved.
3. **Search for duplicates** using the observed error text and the affected feature. Link the canonical issue instead of creating another.
4. **Reproduce or gather evidence.** Use logs, traces, and a local attempt. If you cannot reproduce, say so and list the missing evidence.
5. **Assign severity.**
   - **S1** — outage, data loss or corruption, security breach, auth bypass, payment failure. Page the on-call and start mitigation now.
   - **S2** — major feature unusable, no workaround, broad impact. Fix next; notify the owner.
   - **S3** — degraded with a workaround, or a narrow blast radius. Schedule normally.
   - **S4** — cosmetic, documentation, minor annoyance.

   When in doubt between two levels, choose the higher one and say why.
6. **Find the owner.** Use `CODEOWNERS`, recent commits to the area, or the service map.
7. **Separate mitigation from fix.** State the fastest way to stop the bleeding, then the real fix.
8. **Write the note.** Post it to the issue and apply the labels. Do not close the issue.

## Output

```markdown
## Triage
- Severity: S2
- Area: web / auth
- Owner: @team
- Reproducible: yes
- Duplicate of: #123

## Observed

## Expected

## Evidence

## Hypothesis

## Mitigation

## Next action
```

## Gotchas

- An incident is not a normal bug. If users are affected now, mitigation comes before root cause.
- Never paste secrets, tokens, customer data, or full request bodies into a public issue.
- Severity is about impact, not effort. A one-line fix for an auth bypass is still S1.
- This catalog is public. Keep escalation contacts and private runbook links in the private repository.
- If the report lacks reproduction steps, say what you need instead of guessing.
