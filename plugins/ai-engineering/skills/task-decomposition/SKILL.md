---
name: task-decomposition
description: Break a goal into an ordered, dependency-aware task plan. Trigger with "break this down", "decompose this", "what are the steps to", "plan the work for", or when a goal is too big to execute directly and needs tasks, dependencies, execution order, and validation steps.
argument-hint: "<goal, feature, or project to decompose>"
tier: intelligence
contract: "1.0"
requires: [requirements-spec]
produces: [task-plan]
feeds: [system-design, code-review, testing-strategy, deploy-checklist]
---

# /task-decomposition

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md). This skill follows the [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md) — it appends a `machine_output` block.

Turn a goal into a plan that can actually be executed: tasks, the dependencies between them, the
order they must run in, and how each is validated. This is the **autonomy primitive** of the
Intelligence tier. Without decomposition, a system can advise but cannot deliver. The `task-plan`
it `produces` is what lets the rest of the skill network run as a sequence rather than a pile.

## Usage

```
/task-decomposition <goal, feature, or project>
```

Decompose: @$1

If the goal is broad, take the `requirements-spec` if one exists; otherwise ask for the definition
of done and the hard constraints before planning.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                   TASK DECOMPOSITION                             │
├─────────────────────────────────────────────────────────────────┤
│  STANDALONE (always works)                                       │
│  ✓ Goal -> discrete, independently checkable tasks              │
│  ✓ Dependency graph (what blocks what)                          │
│  ✓ Execution order + what can run in parallel                   │
│  ✓ Validation step per task (how you know it's done)            │
│  ✓ Effort estimate + critical path                              │
├─────────────────────────────────────────────────────────────────┤
│  SUPERCHARGED (when you connect your tools)                      │
│  + Project tracker: emit tasks as tickets with dependencies      │
│  + Code graph: order tasks by real module dependencies           │
└─────────────────────────────────────────────────────────────────┘
```

## Method

1. **Restate the goal** as a single outcome with a definition of done.
2. **Split** into tasks that are each independently verifiable (no "and" in a task).
3. **Wire dependencies** — for each task, what must exist first.
4. **Order** — topological order; mark tasks that can run in parallel.
5. **Validate** — every task gets a check that proves it is complete.
6. **Estimate** — rough effort per task; surface the critical path.

A good decomposition has no task that secretly contains a project, and no hidden dependency that
turns "parallel" into "serial" at runtime.

## Output

```markdown
## Plan: [goal]

### Definition of Done
[The single outcome that means this is finished.]

### Tasks
| # | Task | Depends on | Parallel? | Validation | Effort |
|---|------|-----------|-----------|------------|--------|
| 1 | [task] | - | - | [check] | S |
| 2 | [task] | 1 | with 3 | [check] | M |

### Execution Order
[Ordered phases; what runs together.]

### Critical Path
[The dependency chain that determines total time.]
```

## Output Contract

This is a **process skill** — it produces a plan, so it OMITS the scorecard. Append a
`machine_output` block per [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md). Tasks go in `findings`
with their dependencies, so an agent can execute the plan directly.

```yaml
machine_output:
  skill: task-decomposition
  version: "1.0"
  timestamp: <ISO-8601>
  status: complete
  findings:
    - id: T1
      severity: low
      category: task
      location: schema
      description: Add reset_token table and migration
      depends_on: []
      validation: Migration applies and rolls back cleanly
      effort: S
    - id: T2
      severity: low
      category: task
      location: api
      description: Add POST /password-reset endpoint
      depends_on: [T1]
      validation: Returns 202 and writes a single-use token
      effort: M
  recommendations:
    - id: R1
      action: Run T1 first; T2 and the email-template task can then run in parallel
      effort: low
  artifacts:
    - task-plan
  next_actions:
    - skill: system-design
      reason: T2 needs the token lifecycle designed before implementation
    - skill: testing-strategy
      reason: Define the validation checks as real tests up front
```

## If Connectors Available

If **~~project tracker** is connected:
- Emit each task as a ticket, preserving the dependency links and execution order

If **~~code-graph** is connected (e.g. the [agent-context](https://github.com/shubham0086/agent-context) spoke):
- Order tasks by real module dependencies so the plan matches how the code actually connects

## Tips

1. **Give me the definition of done** — a plan without a finish line cannot be ordered.
2. **Smaller is better** — if a task needs its own sub-plan, split it.
3. **Watch the critical path** — adding people does not help tasks that must run in sequence.
