---
name: requirements-analysis
description: Turn a vague goal or feature request into clear, testable requirements. Trigger with "what are the requirements for", "help me scope this", "turn this into a spec", or when a request is ambiguous and needs functional/non-functional requirements, edge cases, and acceptance criteria before design starts.
argument-hint: "<feature idea, goal, or rough request>"
tier: engineering
contract: "1.0"
requires: []
produces: [requirements-spec]
feeds: [system-design, architecture-review, api-design, task-decomposition]
---

# /requirements-analysis

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md). This skill follows the [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md) — it appends a `machine_output` block.

Turn an ambiguous goal into a spec a designer or agent can act on without guessing. This is the
entry point of the engineering tier: it `produces` the `requirements-spec` that system-design,
api-design, and task-decomposition consume.

## Usage

```
/requirements-analysis <feature idea, goal, or rough request>
```

Analyze the request: @$1

If the goal is one line, ask the three questions that unblock the most: who is it for, what does
success look like, and what is explicitly out of scope.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                  REQUIREMENTS ANALYSIS                           │
├─────────────────────────────────────────────────────────────────┤
│  STANDALONE (always works)                                       │
│  ✓ Functional requirements (what it must do)                    │
│  ✓ Non-functional requirements (speed, scale, security, cost)   │
│  ✓ Edge cases and failure conditions                            │
│  ✓ Explicit out-of-scope list                                   │
│  ✓ Testable acceptance criteria                                 │
├─────────────────────────────────────────────────────────────────┤
│  SUPERCHARGED (when you connect your tools)                      │
│  + Project tracker: pull the linked ticket and stakeholders     │
│  + Knowledge base: align with existing product requirements     │
└─────────────────────────────────────────────────────────────────┘
```

## What I Produce

- **Functional requirements** — numbered, each independently testable
- **Non-functional requirements** — performance, scale, security, compliance, cost targets
- **Edge cases** — empty/invalid input, concurrency, failure and partial-failure behavior
- **Out of scope** — what this explicitly does not cover (prevents scope creep)
- **Acceptance criteria** — Given/When/Then statements that define done
- **Open questions** — the ambiguities a human must resolve before build

## Output

```markdown
## Requirements: [feature]

### Goal
[One sentence: who, what, why.]

### Functional Requirements
| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| FR1 | [must do] | Must/Should/Could | Given/When/Then |

### Non-Functional Requirements
| # | Type | Target |
|---|------|--------|
| NFR1 | Performance | p99 < 200ms at 1k RPS |

### Edge Cases
- [Condition → expected behavior]

### Out of Scope
- [Explicitly excluded]

### Open Questions
- [Blocker a human must answer]
```

## Output Contract

This is a **process skill** — it generates a spec, so it OMITS the scorecard. Append a
`machine_output` block per [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md), carrying the spec in
`findings` (requirements) and `artifacts`.

```yaml
machine_output:
  skill: requirements-analysis
  version: "1.0"
  timestamp: <ISO-8601>
  status: complete
  findings:
    - id: FR1
      severity: high
      category: functional
      location: requirement
      description: Users can reset their password via emailed one-time link
    - id: NFR1
      severity: medium
      category: non-functional
      location: requirement
      description: Reset link expires in 15 minutes and is single-use
  recommendations:
    - id: Q1
      action: Confirm whether SSO users are in scope for password reset
      effort: low
  artifacts:
    - requirements-spec
  next_actions:
    - skill: system-design
      reason: Translate the spec into components and data flow
    - skill: task-decomposition
      reason: Break the spec into sequenced, estimable tasks
```

## If Connectors Available

If **~~project tracker** is connected:
- Pull the source ticket, its stakeholders, and any linked requirements

If **~~knowledge base** is connected:
- Reconcile against existing product specs so requirements do not contradict shipped behavior

## Tips

1. **Name the user** — "internal admin" vs "anonymous visitor" changes most requirements.
2. **Push for out-of-scope** — what you exclude is as valuable as what you include.
3. **Make every requirement testable** — if it can't fail a test, it isn't a requirement yet.
