# Architectures

The repos teach one problem each. This section steps back and shows how the pieces fit
into a whole agent system: what an agent is made of, how you wire several of them together,
where state lives, how calls survive a provider outage, and how tools get a shared protocol.

These are **architecture notes**, not tutorials. Each one frames a design decision, points at
the runnable code that implements it, and is honest about the trade-off. The reference
implementations are the open-source repos and the production engines behind them (the
Sovereign SDLC engine, Agency OS) — see [SYSTEMS/](../SYSTEMS/) for the full systems.

| Note | The question it answers | Reference code |
|------|------------------------|----------------|
| [The agent anatomy](the-agent-anatomy.md) | What is the minimum that makes something an *agent*? | [agent-anatomy](../REPOSITORIES/agent-anatomy.md) |
| [Multi-agent orchestration](multi-agent-orchestration.md) | How do you run many agents without a brittle linear chain? | [agentic-patterns](../REPOSITORIES/agentic-patterns.md), [agentkernel](../REPOSITORIES/agentkernel.md) |
| [Agent memory](agent-memory.md) | How does an agent remember what worked and what failed? | [agent-recall](../REPOSITORIES/agent-recall.md), [agent-scars](../REPOSITORIES/agent-scars.md) |
| [LLM routing and resilience](llm-routing-and-resilience.md) | What happens when a provider returns 429 mid-run? | [agent-routing](../REPOSITORIES/agent-routing.md) |
| [MCP integration](mcp-integration.md) | How do tools get a standard protocol instead of bespoke glue? | [mcp-agent-toolkit](../REPOSITORIES/mcp-agent-toolkit.md) |

---

### The thread running through all five

The industry word for 2025–2026 shifted from *prompt engineering* to **context engineering** and,
underneath that, to treating agents as **software systems** rather than clever prompts. Every note
here is a version of the same claim: the reliability of an agent system lives in the parts around
the model — memory, orchestration, routing, protocol — not in the model call itself. That is the
whole reason this handbook exists.
