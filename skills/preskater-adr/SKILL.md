---
name: preskater-adr
description: Record an architecture decision with context, options, decision, consequences, and status. Use for data model, authentication, infrastructure, dependency, API contract, or vendor choices that are costly to reverse.
license: MIT
metadata:
  owner: platform
  version: "0.2.0"
---

# Architecture decision record

Write the decision while it is being made, not after.

## When to write one

- Data model or migration strategy
- Authentication or authorization
- Infrastructure: ArgoCD layout, cluster topology, registry
- A new framework, database, or managed service
- A public API or SDK contract
- Any decision that is costly to reverse

## Procedure

1. **Number and name it.** `docs/adr/NNNN-short-slug.md`, using the next free number.
2. **Context.** The forces, constraints, and what happens if nothing changes.
3. **Options.** At least two, with tradeoffs. Include "do nothing".
4. **Decision.** One option, stated plainly.
5. **Consequences.** What becomes easier, what becomes harder, and what must be revisited.
6. **Status.** `proposed`, `accepted`, `superseded by NNNN`, or `deprecated`.
7. **Link it.** From the plan, the PR, and any runbook it affects.

## Rules

- Never edit an accepted ADR to change the decision. Write a new one that supersedes it.
- Keep it under two pages.
- Record the decision, not the whole discussion.
- The plan's `preskater-plan` output should reference the ADR when one is required.

## Output

An ADR file plus a link in the plan and pull request.
