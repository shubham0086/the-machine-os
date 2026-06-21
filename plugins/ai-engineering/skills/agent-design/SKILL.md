---
name: agent-design
description: Design or review an AI agent or multi-agent system. Trigger with "design an agent for", "review this agent architecture", "should this be one agent or many?", or when defining an agent's tools, control loop, memory, guardrails, and where humans stay in the loop.
argument-hint: "<agent goal, or an existing agent design to review>"
tier: intelligence
contract: "1.0"
requires: [requirements-spec]
produces: [agent-design-doc]
feeds: [prompt-review, tool-calling, security-review, system-design]
---

# /agent-design

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md). This skill follows the [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md) — it appends a `machine_output` block.

Design an agent that does the job without going off the rails, or review one that does. The
failure modes of agents are specific: unbounded loops, tool misuse, lost context, and silent
drift. This skill designs against them. `produces` an `agent-design-doc` that prompt-review and
security-review consume.

## Usage

```
/agent-design <agent goal, or an existing design to review>
```

Design or review: @$1

If designing from scratch, ask what the agent must accomplish, what tools it needs, and what it
must never do without a human.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                      AGENT DESIGN                                │
├─────────────────────────────────────────────────────────────────┤
│  STANDALONE (always works)                                       │
│  ✓ Single-agent vs multi-agent decision                         │
│  ✓ Tool set + capability scoping (least privilege)              │
│  ✓ Control loop: plan, act, observe, stop conditions            │
│  ✓ Memory + context strategy                                    │
│  ✓ Guardrails, validation, human-in-the-loop points             │
├─────────────────────────────────────────────────────────────────┤
│  SUPERCHARGED (when you connect your tools)                      │
│  + MCP: design tool access as real MCP servers                   │
│  + Knowledge base: ground the design in your agent patterns      │
└─────────────────────────────────────────────────────────────────┘
```

## Review Dimensions

### Topology
- Single agent vs multi-agent justified by the work, not by fashion
- Clear responsibility per agent; no two agents owning the same decision
- Orchestration model (supervisor, pipeline, blackboard) fits the task

### Control Loop
- Explicit stop conditions and a hard step/iteration budget (no unbounded loops)
- Deterministic flow where determinism is available; the LLM decides, it does not count
- Observe-and-validate after every action, not just at the end

### Capability & Safety
- Least-privilege tool scoping; destructive actions gated
- Validated tool inputs and outputs; failures handled, not assumed away
- Human-in-the-loop at the irreversible steps

### Memory & Context
- What persists, what is per-run, and how context is kept under budget
- Retrieval strategy that does not poison the context with noise

## Output

```markdown
## Agent Design: [goal]

### Topology
[Single or multi-agent, and why. Diagram of agents + responsibilities.]

### Tools (least privilege)
| Tool | Why | Risk | Gate |
|------|-----|------|------|

### Control Loop
[Plan/act/observe, stop conditions, step budget.]

### Guardrails & HITL
- [Validation + where a human approves]

### Scorecard
| Dimension | Score | Note |
|-----------|-------|------|
| Topology fit | /100 | |
| Control loop safety | /100 | |
| Capability scoping | /100 | |
| Memory/context | /100 | |
```

## Output Contract

This is an **assessment skill** (it evaluates a design against agent failure modes). Append a
`machine_output` block per [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md).

**Scorecard rubric** (each 0-100): 90-100 robust against the known agent failure modes, 75-89
minor gaps, 50-74 will loop or misuse tools under stress, below 50 redesign.

```yaml
machine_output:
  skill: agent-design
  version: "1.0"
  timestamp: <ISO-8601>
  status: complete
  scorecard:
    topology_fit: 82
    control_loop_safety: 58
    capability_scoping: 70
    memory_context: 84
  findings:
    - id: F1
      severity: critical
      category: control_loop_safety
      location: executor agent
      description: No max-iteration budget; a failing tool call can loop indefinitely
    - id: F2
      severity: high
      category: capability_scoping
      location: tool set
      description: Agent has write access to prod DB with no human gate on deletes
  recommendations:
    - id: R1
      action: Add a hard step budget and a no-progress stop condition
      effort: low
      addresses: [F1]
    - id: R2
      action: Scope DB access to read; route destructive actions through HITL approval
      effort: medium
      addresses: [F2]
  artifacts:
    - agent-design-doc
  next_actions:
    - skill: prompt-review
      reason: The agent's system prompt must encode the stop conditions and guardrails
    - skill: security-review
      reason: Tool access and capability scoping need a security pass
```

## If Connectors Available

If **~~MCP** is connected:
- Design tool access as concrete MCP servers with scoped capabilities, not abstract "tools"

If **~~knowledge base** is connected:
- Ground the design in your existing agent patterns and past failure write-ups

## Tips

1. **Default to one agent** — reach for multi-agent only when responsibilities genuinely diverge.
2. **Budget every loop** — the most common production failure is an agent that will not stop.
3. **Name the irreversible actions** — those are the ones that need a human, not the safe ones.
