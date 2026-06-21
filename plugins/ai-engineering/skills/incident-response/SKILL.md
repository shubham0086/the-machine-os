---
name: incident-response
description: Run an incident response workflow — triage, communicate, and write postmortem. Trigger with "we have an incident", "production is down", an alert that needs severity assessment, a status update mid-incident, or when writing a blameless postmortem after resolution.
argument-hint: "<incident description or alert>"
tier: security-ops
contract: "1.0"
requires: [alert, deploy-checklist]
produces: [incident-postmortem]
feeds: [tech-debt, documentation]
---

# /incident-response

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md). This skill follows the [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md) — it appends a `machine_output` block.

Manage an incident from detection through postmortem.

## Usage

```
/incident-response $ARGUMENTS
```

## Modes

```
/incident-response new [description]     # Start a new incident
/incident-response update [status]       # Post a status update
/incident-response postmortem            # Generate postmortem from incident data
```

If no mode is specified, ask what phase the incident is in.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    INCIDENT RESPONSE                               │
├─────────────────────────────────────────────────────────────────┤
│  Phase 1: TRIAGE                                                  │
│  ✓ Assess severity (SEV1-4)                                     │
│  ✓ Identify affected systems and users                          │
│  ✓ Assign roles (IC, comms, responders)                         │
│                                                                    │
│  Phase 2: COMMUNICATE                                              │
│  ✓ Draft internal status update                                  │
│  ✓ Draft customer communication (if needed)                     │
│  ✓ Set up war room and cadence                                   │
│                                                                    │
│  Phase 3: MITIGATE                                                 │
│  ✓ Document mitigation steps taken                               │
│  ✓ Track timeline of events                                      │
│  ✓ Confirm resolution                                            │
│                                                                    │
│  Phase 4: POSTMORTEM                                               │
│  ✓ Blameless postmortem document                                 │
│  ✓ Timeline reconstruction                                       │
│  ✓ Root cause analysis (5 whys)                                  │
│  ✓ Action items with owners                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Severity Classification

| Level | Criteria | Response Time |
|-------|----------|---------------|
| **SEV1** | Service down, critical path non-functional, all users affected | Immediate, all-hands response |
| **SEV2** | Major feature severely degraded, many users or transactions affected | Within 15 minutes |
| **SEV3** | Minor feature issues, localized impact, workaround available | Within 1 hour |
| **SEV4** | Non-disruptive, cosmetic, or low-impact operational friction | Next business day |

## Communication Guidance

Provide clear, factual updates at a regular cadence. Do not speculate or guess root causes during an active outage. Clearly declare: what is broken, who is affected, what active mitigations are underway, and when the next operational update will be.

## Output — Status Update

```markdown
## Incident Update: [Title]
**Severity:** SEV[1-4] | **Status:** Investigating | Identified | Monitoring | Resolved
**Impact:** [Who/what is affected, percentage of traffic/users impacted]
**Last Updated:** [Timestamp UTC] | **Next Update:** [Estimated Time UTC]

### Current Status
[Factual summary of what we know right now, symptoms observed, and systems affected.]

### Actions Taken
- [Mitigation Action 1 and immediate outcome]
- [Mitigation Action 2 and immediate outcome]

### Next Steps
- [What is actively being investigated, next steps, and ETA]

### Timeline (UTC)
| Time | Event | Action/Observation |
|------|-------|--------------------|
| [HH:MM] | [e.g., Detection] | Alert triggered for elevated 5xx rates on backend. |
```

## Output — Postmortem (Blameless)

```markdown
## Postmortem: [Incident Title]
**Date:** [Date] | **Duration:** [X hours, Y minutes] | **Severity:** SEV[X]
**Incident Commander:** [Name] | **Authors:** [Names] | **Status:** Draft/Approved

### Summary
[2-3 sentence high-level, business-language explanation of what went wrong, the direct user-facing impact, and how it was eventually mitigated.]

### Impact Analysis
- **Users Affected:** [e.g., ~15% of active users during window]
- **Duration of Outage:** [Duration]
- **Financial/Operational Cost:** [Quantifiable data if available]

### Timeline (UTC)
| Time (UTC) | Event / Action | Owner / Actor | Notes / Context |
|------------|----------------|---------------|-----------------|
| [HH:MM] | [Incident start] | System | Elevated latency observed |
| [HH:MM] | [Alert triggered]| Monitoring | Slack and PagerDuty triggered |

### Root Cause Analysis (RCA)
[Detailed explanation of the technical and systems failure. Explain the underlying system state and why it behaved unexpectedly under these conditions.]

### The 5 Whys (Systemic Root Cause Path)
1. **Why did [the symptom occur]?**
   - *Because...*
2. **Why did [the intermediate cause occur]?**
   - *Because...*
3. **Why did [that state occur]?**
   - *Because...*
4. **Why did [the underlying procedural or technical flaw exist]?**
   - *Because...*
5. **Why was [the systemic root cause] allowed to exist?**
   - *Because... [This must point to a systemic procedural, testing, or architectural deficiency, not human error.]*

### What Went Well
- [Processes, tools, configurations, or quick escalations that worked perfectly]

### What Went Poorly
- [Bottlenecks, slow communication, debugging dead-ends, or telemetry blindspots]

### Action Items
*Note: Preventative measures must be prioritised to avoid future occurrences of this specific failure pattern.*

| Action Item | Priority | Owner | Target Due Date | Linked Ticket |
|-------------|----------|-------|-----------------|---------------|
| [e.g., Implement rate limiting on route X] | P0 | [Name] | [Date] | [Ticket ID] |

### Lessons Learned
[Long-term architectural, testing, or communication takeaways from this outage to share across teams.]
```

## Output Contract

This is a **process skill** — it runs a workflow, so it OMITS the scorecard. Append a
`machine_output` block per [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md). Use `status: needs-input`
mid-incident and `complete` once the postmortem is written; action items become `recommendations`.

```yaml
machine_output:
  skill: incident-response
  version: "1.0"
  timestamp: <ISO-8601>
  status: complete
  findings:
    - id: I1
      severity: critical
      category: root-cause
      location: payments-api
      description: Connection pool exhausted under a retry storm; 5xx for 22 minutes
  recommendations:
    - id: A1
      action: Add a circuit breaker and cap retries on the payments client
      effort: medium
      addresses: [I1]
  artifacts:
    - incident-postmortem
  next_actions:
    - skill: tech-debt
      reason: Track the postmortem action items as prioritized debt
    - skill: documentation
      reason: Turn the mitigation into a runbook for the next occurrence
```

## If Connectors Available

If **~~monitoring** is connected:
- Pull alert details and metrics
- Show graphs of affected metrics

If **~~incident management** is connected:
- Create or update incident in PagerDuty/Opsgenie
- Page on-call responders

If **~~chat** is connected:
- Post status updates to incident channel
- Create war room channel

## Tips

1. **Start writing immediately** — Don't wait for complete information. Update as you learn more.
2. **Keep updates factual** — What we know, what we've done, what's next. No speculation.
3. **Postmortems are blameless** — Focus on systems and processes, not individuals.