# Recipe: Build a Production Multi-Agent System

[Build an Agent Team](build-an-agent-team.md) gets several agents cooperating. This recipe is the next
level: making that team **survive production** — outages, runaway costs, malformed output, repeated
failures, and an unattended loop that can act on the world. It's the capstone recipe, and it has a
copy-paste spec behind it.

## The shape

1. **Start from the spec, not a blank file.** The [production multi-agent template](https://github.com/shubham0086/Agent-Anatomy/blob/main/parts/5-the-harness/production-multi-agent-template.md)
   is the full harness: system rules, the agent I/O contract, reality files, scars, the recovery
   supervisor, the provider fallback chain. Copy it; fill the placeholders.
2. **Make orchestration deterministic.** A DAG owns *what runs next*; the model only fills the steps.
3. **Wrap the model with guarantees.** A cost ceiling that throws, an error taxonomy, bounded
   recovery → quarantine, and dual memory (what worked + what failed).
4. **Lock down the hands.** No `eval`/`exec`, protected files, injection-safe shell calls, and — the
   moment you add external tools — a mediating MCP gateway, never raw connections.

## Why each step

The model is the least reliable component and the only one you can't make deterministic, so you put
every guarantee in the scaffolding around it. That single principle — reliability lives in the
deterministic plane — is what separates a demo from a system you can leave running.

## Clone and run

- **The spec:** [the production multi-agent template](https://github.com/shubham0086/Agent-Anatomy/blob/main/parts/5-the-harness/production-multi-agent-template.md) (platform-agnostic, copy-paste)
- **Source repos:** [agentkernel](../REPOSITORIES/agentkernel.md) (production engines) · [agentic-systems](../REPOSITORIES/agentic-systems.md) (5 complete systems) · [agent-routing](../REPOSITORIES/agent-routing.md) (failover + breaker)
- **Architecture:** [Multi-agent orchestration](../ARCHITECTURES/multi-agent-orchestration.md)
- **Security:** [Agent execution safety](../SECURITY/agent-execution-safety.md) · [The MCP gateway](../SECURITY/mcp-gateway-security-isolation.md)
- **See it whole:** [SYSTEMS/the-sovereign-sdlc-engine](../SYSTEMS/the-sovereign-sdlc-engine.md) — every pattern above, running at once
- **Workflow:** [Reality-driven development](../WORKFLOWS/reality-driven-development.md) (how to operate it without drift)
