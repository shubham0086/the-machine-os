# Recipe: Build an Agent Team

Multiple agents that cooperate to do a job - without the infinite loops, latency spikes, and
exploded token budgets that kill naive multi-agent setups.

## The shape

1. **Start on the right rung.** Most "teams" should be a workflow or a single agent. Climb the
   autonomy ladder only when the problem demands it.
2. **Make control flow deterministic.** A DAG state machine (Kahn's topological sort) owns
   *what runs next*; the LLM only fills in the steps.
3. **Give each agent the right organs** - brain, hands, memory, loop - and shared state via a
   blackboard.
4. **Compose known patterns** rather than inventing an exotic architecture.

## Why each step

Letting the model decide control flow is the single most common multi-agent failure. The
model proposes; the DAG disposes. That one rule prevents most runaway behavior.

## Clone and run

- **Source repos:** [agentic-systems](../REPOSITORIES/agentic-systems.md) (5 complete systems) · [agentic-patterns](../REPOSITORIES/agentic-patterns.md) (7 patterns) · [agent-anatomy](../REPOSITORIES/agent-anatomy.md)
- **Field note:** [Why I Banned Probabilistic Control Flow](../FIELD-NOTES/banned-probabilistic-control-flow.md)
- **Start here:** [ai-systems-evolution](../REPOSITORIES/ai-systems-evolution.md) (the autonomy ladder)
- **Playbook:** composing patterns into systems (queued - see [ROADMAP](../ROADMAP.md))
