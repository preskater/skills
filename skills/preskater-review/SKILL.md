---
name: preskater-review
description: Review a pull request or merge request against its linked issue: correctness, security, authorization, data and migrations, concurrency, tests, and performance. Use when asked to review a PR/MR, a diff, or a branch before merge.
license: MIT
metadata:
  owner: platform
  version: "0.3.0"
---

# Review a change

Review the diff, not your memory of it. Findings are severity-ranked and actionable. Do not rewrite the code unless asked.

## Inputs

- PR/MR number, branch, or diff
- The linked issue
- The plan, if one exists

## Procedure

1. **Load the change.**
   - GitHub: `gh pr view <n>`, `gh pr diff <n>`
   - GitLab: `glab mr view <n>`, `glab mr diff <n>`
   - Otherwise: `git diff main...HEAD`
2. **Read the issue and the plan.** The diff must solve the stated problem and nothing unrelated.
3. **Read the tests first.** They show intent and coverage.
4. **Walk the checklist.** Record a finding whenever something is wrong.
5. **Check the workflow.** Branch name, commit messages, issue link, PR body, CI status.
6. **Rank the findings.**

## Checklist

### Correctness

- Does the change do what the issue asks, including edge cases?
- Are error paths handled, or do they throw raw errors at users?
- Are null, empty, and loading states covered?

### Security

- Is authorization checked in every Server Action and route handler?
- Is user input validated server-side with zod?
- Does any secret, token, or service-role key reach the client?
- Supabase RLS: does every touched table have policies and tests?

### Data

- Which schema owner is in play, Prisma or Supabase?
- Is the migration reversible, and does it preserve existing rows?
- Does any query scan a large table without an index?

### Delivery

- Is the image pinned by digest instead of a mutable tag?
- Are Helm values per environment, with secrets externalized?
- Does the migration run as a PreSync hook, and is it expand/contract?
- Are probes, resource limits, and `securityContext` set?
- Is the ArgoCD diff limited to the intended resources?

### Observability

- Are new failure modes covered by logs, metrics, traces, or alerts?
- Are the dashboard and deploy annotation updated for this change?

### Concurrency and state

- Race conditions on writes, double submits, stale reads.
- Idempotency for retries and webhooks.

### Tests

- Do tests prove behavior rather than implementation?
- Are failure cases covered?
- Is a Playwright flow needed for a user-visible change?

### Performance and compatibility

- Unnecessary client components, request waterfalls, or unbounded queries.
- Public API or SDK changes are additive or documented.

### Readability

- Does it follow the patterns already in the repo?
- Do names say what things are?

## Output

```markdown
## Summary
One paragraph: what the change does and whether it matches the issue.

## Blocking
- `file:line` — problem, why it matters, suggested fix

## Should fix
- ...

## Nits
- ...

## Verification
- What you ran, or what the author must run.
```

## Rules

- Every finding needs a location and a reason.
- No style opinions that the formatter or linter already enforces.
- If there are no blocking findings, say so plainly.
- Do not approve while CI is failing.

## Gotchas

- A large diff is not automatically a bad diff. Judge the change, not the line count.
- Generated files and lockfiles are noise unless the dependency change is the point.
- Check that the PR body's "how tested" matches what CI actually ran.
- Reviewing a migration means reviewing the SQL, not just the Prisma schema diff.
