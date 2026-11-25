---
name: preskater-postmortem
description: Write a blameless postmortem after an incident: timeline, contributing factors, what worked, and owned action items that update tests, alerts, runbooks, and planning. Use after S1/S2 incidents or when asked to review an outage.
license: MIT
metadata:
  owner: platform
  version: "0.3.0"
---

# Postmortem

Blameless and specific. The output is owned action items, not a narrative.

## Procedure

1. **Gather evidence.** Incident timeline, deploy record, alerts, logs, traces, chat, and the eventual fix.
2. **Build the timeline.** Timestamps, what was observed, what was done, and which system did it.
3. **Identify contributing factors.** Use several factors, not one root cause. Include detection, response, and prevention gaps.
4. **Say what worked.** Fast rollback, a good alert, a clear runbook. Keep it.
5. **Write action items.**
   - Owner, due date, issue link.
   - Type: prevent, detect, mitigate, or document.
   - Prefer three to five high-impact items over a long list.
6. **Update the system.** Add the regression test, alert, runbook step, or ADR. Link each change.
7. **Feed planning.** Create the issues and add them to the next planning cycle.
8. **Review and publish.** Hold a short review, then publish to the team.

## Output

Use `templates/postmortem.md`.

## Gotchas

- "Human error" is not a cause. Ask what made the error easy and the impact hard to detect.
- Action items without an owner and a date do not happen.
- Do not rewrite history to protect anyone. Blameless means learning, not hiding.
- If the same factor appears in two postmortems, it needs a structural fix, not another reminder.
- A postmortem is not an incident timeline. Summarize, link, and focus on the system.
