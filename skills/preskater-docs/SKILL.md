---
name: preskater-docs
description: Write and update documentation: README, runbooks, API reference, and architecture map. Use when commands, behavior, operations, or onboarding change, or when asked to document a feature.
license: MIT
metadata:
  owner: platform
  version: "0.3.0"
---

# Documentation

Docs change with the code. A stale runbook is worse than none.

## Procedure

1. **Pick the document.** README for orientation, runbook for operations, ADR for decisions, API reference for contracts, architecture map for the system.
2. **Verify every command.** Run it, or mark it as unverified. Do not copy commands from memory.
3. **Write for the reader.** State the task, the prerequisites, the exact steps, and how to confirm success.
4. **Update the entry points.** README links, `AGENTS.md` commands, and the runbook index.
5. **Check the mechanics.** Links resolve, code fences declare a language, env vars are in `.env.example`, no secrets.
6. **Hand off.** Say what changed in the PR.

## Runbooks

A runbook must include: symptom, impact, first checks, mitigation, rollback, escalation, and the dashboards to open. Run the steps before publishing.

## Gotchas

- Do not document behavior that is not implemented.
- Do not duplicate `AGENTS.md`. Link to it.
- Screenshots age. Prefer commands and text.
- Public repositories: no internal hostnames, credentials, or customer data.
- If a command needs a tool the team does not have, say so and link the installation step.
