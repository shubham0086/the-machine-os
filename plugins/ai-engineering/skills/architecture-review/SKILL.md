---
name: architecture-review
description: Evaluate a complete system architecture above the component level. Trigger with "review this architecture", "is this design going to scale?", "staff-level design review", or when assessing strengths, tradeoffs, and scalability/security/cost risks of a whole system rather than a single service.
argument-hint: "<design doc, diagram, or system description>"
tier: engineering
contract: "1.0"
requires: [system-design, requirements-analysis]
produces: [architecture-review-report]
feeds: [security-review, performance-review, tech-debt, task-decomposition]
---

# /architecture-review

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md). This skill follows the [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md) — it appends a `machine_output` block.

Evaluate a system architecture the way a staff engineer would in a design review: not "is this
component correct" but "will this whole system hold up." It sits **above** system-design,
api-design, and database-design and judges the composition of all of them.

## Usage

```
/architecture-review <design doc, diagram, or system description>
```

Review the provided architecture: @$1

If no design is provided, ask for the system description, the scale targets (traffic, data,
users), and the hard constraints (budget, latency, compliance).

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                   ARCHITECTURE REVIEW                             │
├─────────────────────────────────────────────────────────────────┤
│  STANDALONE (always works)                                       │
│  ✓ Describe the system or paste a design doc / diagram           │
│  ✓ Strengths, weaknesses, and explicit tradeoffs                 │
│  ✓ Scalability, reliability, security, and cost risks            │
│  ✓ Alternatives considered and why this one (or not)             │
│  ✓ Scorecard across 5 dimensions                                 │
├─────────────────────────────────────────────────────────────────┤
│  SUPERCHARGED (when you connect your tools)                      │
│  + Code graph: map the design against the real dependency graph  │
│  + Knowledge base: check against your architecture principles    │
│  + Observability: ground "scales?" in real traffic and latency   │
└─────────────────────────────────────────────────────────────────┘
```

## Review Dimensions

### Scalability
- Bottlenecks under 10x load (single writers, shared state, synchronous fan-out)
- Stateful vs stateless boundaries, partitioning and sharding strategy
- Backpressure, queueing, and graceful degradation

### Reliability
- Single points of failure and blast radius of each
- Failure modes, retries, idempotency, and data-loss windows
- Recovery: RTO/RPO realism, not aspiration

### Security
- Trust boundaries and where untrusted input crosses them
- AuthN/AuthZ placement, secret flow, data-at-rest and in-transit
- Defers deep work to `security-review` and `threat-model`

### Cost
- Cost drivers that scale with traffic vs with data
- Over-provisioned components and cheaper equivalents
- Egress, idle capacity, and managed-vs-self tradeoffs

### Complexity / Maintainability
- Moving parts vs the problem actually being solved
- Coupling between services and operational surface area
- Whether a simpler design meets the same requirements

## Output

```markdown
## Architecture Review: [system name]

### Summary
[2-3 sentences: what the system does, the headline verdict, the single biggest risk.]

### Strengths
- [What this design gets right and why it matters]

### Weaknesses & Tradeoffs
| # | Area | Concern | Tradeoff being made | Severity |
|---|------|---------|---------------------|----------|

### Risk Register
| # | Risk type | Risk | Trigger condition | Mitigation |
|---|-----------|------|-------------------|------------|
| 1 | Scalability | [risk] | [when it bites] | [fix] |

### Alternatives
- [Alternative design, what it would change, when it would be the better call]

### Scorecard
| Dimension | Score | Note |
|-----------|-------|------|
| Scalability | /100 | |
| Reliability | /100 | |
| Security | /100 | |
| Cost | /100 | |
| Complexity | /100 | |

### Verdict
[SOUND] / [SOUND WITH CHANGES] / [RECONSIDER]
```

## Output Contract

This is an **assessment skill**. After the human-readable review, append a `machine_output`
block per [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md).

**Scorecard rubric** (each 0-100): 90-100 production-grade at the stated scale, 75-89 sound with
named changes, 50-74 material risks to resolve first, below 50 reconsider the approach.

```yaml
machine_output:
  skill: architecture-review
  version: "1.0"
  timestamp: <ISO-8601>
  status: complete
  scorecard:
    scalability: 72
    reliability: 80
    security: 68
    cost: 85
    complexity: 60
  findings:
    - id: F1
      severity: high
      category: scalability
      location: ingest-service
      description: Single synchronous writer fans out to 6 downstreams; caps throughput
  recommendations:
    - id: R1
      action: Put a queue between ingest and downstreams; make consumers idempotent
      effort: medium
      addresses: [F1]
  artifacts:
    - architecture-review-report
  next_actions:
    - skill: security-review
      reason: Trust boundary at the ingest edge needs a dedicated pass
    - skill: task-decomposition
      reason: Turn the risk register into a sequenced remediation plan
```

## If Connectors Available

If **~~code-graph** is connected (e.g. the [agent-context](https://github.com/shubham0086/agent-context) spoke):
- Map the proposed components against the real dependency graph to catch designs that fight the existing structure

If **~~knowledge base** is connected:
- Check the design against your recorded architecture principles and past ADRs

If **~~observability** is connected:
- Replace guesses about "does it scale" with real traffic, latency, and error-rate data

## Tips

1. **State the scale** — "10k RPS, 2TB/day, p99 under 200ms" makes the review concrete instead of generic.
2. **Name the constraints** — budget, compliance, and team size change the right answer.
3. **Bring the alternatives you rejected** — I will pressure-test why you ruled them out.
