---
name: preskater-incident
description: Run an active incident: declare severity, assign incident, communications, and operations roles, mitigate first, keep a timeline, and hand off cleanly. Use for S1/S2 outages, data loss, security events, or when triage escalates.
license: MIT
metadata:
  owner: platform
  version: "0.2.0"
---

# Run an incident

Triage classifies. This skill runs the response.

## Procedure

1. **Declare.** Confirm severity on the same S1-S4 scale as `preskater-triage`. Open and pin the incident issue or channel.
2. **Assign roles.** Incident Commander, Communications Lead, Operations Lead. The IC does not debug. In a small response one person may hold two roles, never all three.
3. **State the impact.** What is broken, who is affected, since when, and the current workaround.
4. **Mitigate first.** Roll back, disable the feature flag, scale, fail over, or restore from backup. Root cause comes later.
5. **Communicate on a cadence.** S1 every 15 minutes, S2 every 30-60. State impact, current action, and next update time. Use a status page for external impact.
6. **Keep the timeline.** Timestamp every signal and action in the incident issue. Use `templates/incident-timeline.md`.
7. **Hand off** with current state, open hypotheses, actions in flight, and the next update time.
8. **Resolve** when impact is gone and monitoring is stable for the agreed window. Schedule the postmortem.

## Output

Timeline, current status, mitigation, and next action.

## Gotchas

- Mitigation before diagnosis. A rollback at minute five beats a root cause at hour two.
- One incident commander. Parallel command makes it worse.
- Do not publish an unverified root cause. Say what you know and what you do not.
- Preserve logs, traces, and the deploy record before they rotate.
- Do not paste customer data or secrets into the incident channel.
- If a breach is suspected, follow the private security process immediately; do not discuss it in a public issue.
