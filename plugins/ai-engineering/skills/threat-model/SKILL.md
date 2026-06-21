---
name: threat-model
description: Build a structured threat model for a system or feature. Trigger with "threat model this", "what could go wrong security-wise?", "STRIDE analysis", "what's our attack surface?", or when mapping assets, entry points, threats, and mitigations before or during design.
argument-hint: "<system, feature, or architecture to model>"
tier: security-ops
contract: "1.0"
requires: [system-design, architecture-review-report]
produces: [threat-model]
feeds: [security-review, deploy-checklist, task-decomposition]
---

# /threat-model

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md). This skill follows the [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md) — it appends a `machine_output` block.

Map a system's attack surface before an attacker does: what is worth protecting, where it can be
reached, what can go wrong, and what stops it. Where security-review audits an artifact for known
bug classes, threat-model reasons about the system top-down. `produces` a `threat-model` that
security-review and deploy-checklist consume.

## Usage

```
/threat-model <system, feature, or architecture>
```

Model: @$1

If given only a name, ask for the data flow (who talks to what), the trust boundaries, and the
assets worth protecting.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                      THREAT MODEL                                │
├─────────────────────────────────────────────────────────────────┤
│  STANDALONE (always works)                                       │
│  ✓ Asset inventory + data flow                                  │
│  ✓ Trust boundaries + entry points                              │
│  ✓ STRIDE threat enumeration per element                        │
│  ✓ Risk rating (likelihood x impact)                            │
│  ✓ Mitigations + residual risk                                  │
├─────────────────────────────────────────────────────────────────┤
│  SUPERCHARGED (when you connect your tools)                      │
│  + Knowledge base: pull prior threat models + security controls  │
│  + Code graph: ground entry points in the real call structure    │
└─────────────────────────────────────────────────────────────────┘
```

## Method (STRIDE per element)

For each component and data flow crossing a trust boundary, enumerate:
- **S**poofing — can identity be faked?
- **T**ampering — can data or code be modified in transit or at rest?
- **R**epudiation — can an actor deny an action that happened?
- **I**nformation disclosure — can protected data leak?
- **D**enial of service — can availability be degraded?
- **E**levation of privilege — can an actor gain rights they should not have?

Each threat gets a likelihood, an impact, and a mitigation (or an accepted-risk note).

## Output

```markdown
## Threat Model: [system]

### Assets
| Asset | Why it matters | Owner |
|-------|----------------|-------|

### Trust Boundaries & Entry Points
- [Boundary → what crosses it]

### Threats (STRIDE)
| # | Element | STRIDE | Threat | Likelihood | Impact | Mitigation | Residual |
|---|---------|--------|--------|------------|--------|------------|----------|
| 1 | [component] | Spoofing | [threat] | Med | High | [control] | Low |

### Top Risks
- [The few threats that dominate the risk surface]
```

## Output Contract

This is a **process skill** — it builds a model, so it OMITS the scorecard. Append a
`machine_output` block per [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md), carrying threats in
`findings` (severity = likelihood x impact) and mitigations in `recommendations`.

```yaml
machine_output:
  skill: threat-model
  version: "1.0"
  timestamp: <ISO-8601>
  status: complete
  findings:
    - id: T1
      severity: high
      category: elevation-of-privilege
      location: admin-api boundary
      description: Admin endpoints authorize on a client-supplied role claim
    - id: T2
      severity: medium
      category: information-disclosure
      location: object storage bucket
      description: Signed URLs have a 7-day TTL; leaked links stay valid too long
  recommendations:
    - id: M1
      action: Authorize admin actions against a server-side role lookup
      effort: medium
      addresses: [T1]
    - id: M2
      action: Drop signed-URL TTL to minutes and scope to a single object
      effort: low
      addresses: [T2]
  artifacts:
    - threat-model
  next_actions:
    - skill: security-review
      reason: Confirm T1's authorization fix in the actual code
    - skill: task-decomposition
      reason: Sequence the mitigations into a tracked remediation plan
```

## If Connectors Available

If **~~knowledge base** is connected:
- Pull prior threat models and the standard control set so this one is consistent, not bespoke

If **~~code-graph** is connected (e.g. the [agent-context](https://github.com/shubham0086/agent-context) spoke):
- Ground the entry-point inventory in the real call graph instead of the diagram

## Tips

1. **Draw the data flow first** — you cannot model threats to a system you cannot see.
2. **Mark trust boundaries explicitly** — threats concentrate where they are crossed.
3. **Accept some risk on purpose** — a model that mitigates everything is one nobody will ship.
