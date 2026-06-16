# Multi-agent orchestration

> A linear chain of agents fails at the first weak link. Production multi-agent systems are
> a scheduler over a shared state store, not a `for` loop of prompts.

## The decision

When you wire several agents together, the obvious design is a pipe: agent A's output is agent B's
input, B's into C, and so on. It demos well and breaks in production, because a linear chain has no
answer to three questions: what runs in parallel, what happens when step 3 of 6 fails, and where the
shared truth lives while all this is in flight.

The pattern that holds up uses two pieces:

1. **A blackboard** — one shared state object that every agent reads from and writes to through
   methods, never by direct mutation. The Sovereign SDLC engine enforces this as a hard rule: *no
   direct `blackboard.state.*` mutation — use Blackboard methods*. State is the single source of
   truth; agents are stateless workers over it.

2. **A DAG scheduler** — tasks declare their dependencies, and a topological sort (Kahn's algorithm)
   decides execution order, running independent tasks in parallel and only blocking where a real
   dependency exists. This is what replaces the brittle linear chain.

## A real pipeline

The Sovereign SDLC engine runs:

```
Goal → Researcher → Perceptor → Architect → [Coder ↔ Auditor]×3 → Documenter → autoCommit
```

The `Coder ↔ Auditor` loop is the interesting part: the Coder writes, the Auditor checks against a
contract, and they iterate up to three times before the task is forced to resolve. That bounded
review loop — not an unbounded "keep going until perfect" — is what keeps cost and time finite.
Agency OS runs the same shape with six content agents, each with *one job, one prompt shape, one
output contract*, output of step N becoming the typed input of step N+1.

## What makes it survive failure

Orchestration is only half the job; the other half is what happens when a node fails. The engine's
`RecoverySupervisor` watches the blackboard for **stuck** tasks (no meaningful change in 240s) and
**failed** tasks, classifies the failure, and applies a strategy — fall through the provider chain,
request a completion on truncation, break a dependency lock on a suspected deadlock — capped at 3
total retries and at a recovery cost that can't exceed the run budget. Past that it *quarantines*
the task and hard-rolls-back to a git tag rather than thrashing. See
[SYSTEMS/the-sovereign-sdlc-engine](../SYSTEMS/the-sovereign-sdlc-engine.md) for the full machinery.

## Where it sits now

The 2026 consensus, after a year of "autonomous agent" disappointment, is that reliable multi-agent
systems look much more like **durable workflow engines** (explicit DAGs, retries, checkpoints, a
state store) than like a swarm of free-roaming agents. The orchestration is deterministic; only the
work inside a node is probabilistic. That is the same conclusion the engines here reached from the
production side.

---

**Reference code:** [agentic-patterns](../REPOSITORIES/agentic-patterns.md) (DAG + Kahn's scheduling), [agentkernel](../REPOSITORIES/agentkernel.md) (production engines), [agentic-systems](../REPOSITORIES/agentic-systems.md) (5 complete systems).

**Build one yourself:** the full blueprint — orchestration, agent contract, recovery, budget, security — as a copy-paste spec: [the production multi-agent template](https://github.com/shubham0086/Agent-Anatomy/blob/main/parts/5-the-harness/production-multi-agent-template.md).

**Related:** [LLM routing and resilience](llm-routing-and-resilience.md) · [SYSTEMS/the-sovereign-sdlc-engine](../SYSTEMS/the-sovereign-sdlc-engine.md) · Field note: [Why I banned probabilistic control flow](../FIELD-NOTES/banned-probabilistic-control-flow.md)
