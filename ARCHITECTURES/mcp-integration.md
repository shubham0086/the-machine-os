# MCP integration

> Before a tool protocol, every agent-to-tool connection was bespoke glue. The Model Context
> Protocol turns "N agents × M tools" of custom wiring into one standard surface.

## The decision

When you have one agent and one tool, a direct function call is fine. When you have a *team* of
agents that all need the same shared state — the blackboard, the failure memory, a cache — ad-hoc
function calls stop scaling. Every new tool means new glue in every agent. The Model Context Protocol
(MCP) is the answer the ecosystem standardised on: tools expose a typed surface over a transport
(stdio or HTTP), and any MCP-speaking client can use them without bespoke integration.

The reference server exposes three tools over MCP, built on `node:sqlite` with stdio transport:

- **blackboard** — shared agent state, so independent tools cooperate over one source of truth
- **scars** — the failure memory described in [agent memory](agent-memory.md)
- **cache** — an LLM/result cache

These are exactly the cross-cutting concerns a *team* of agents needs to share, which is why they're
the ones worth putting behind a protocol.

## Toy vs. production

The honest line from the reference work: a toy MCP server and a production one differ by **tenant
isolation, rate limiting, structured logging, and per-tool error boundaries** — not by the happy
path. The forty-line example everyone copies handles none of those, and every one of them is where a
shared tool server actually breaks under a real agent team. The repo is published as a *blueprint*,
honest about that gap, not a claim to have closed it.

## Where it sits now

MCP went from an Anthropic proposal to a broadly adopted tool-protocol standard over 2025, with
client support across major agent runtimes. The 2026 reality is two-sided: the protocol is genuinely
useful *and* the rush produced a wave of insecure servers (the security note on
[agent execution safety](../SECURITY/agent-execution-safety.md) covers why an MCP gateway, not raw
connections, is the safe default). Standardising the surface is progress; it does not absolve you of
the tenant isolation and input validation the protocol itself doesn't enforce.

---

**Reference code:** [mcp-agent-toolkit](../REPOSITORIES/mcp-agent-toolkit.md) — blackboard, scars, cache over MCP/stdio, 13 tests.

**Related:** [Agent memory](agent-memory.md) · [SECURITY/agent-execution-safety](../SECURITY/agent-execution-safety.md) · Recipe: [Build an MCP server](../SYSTEM-RECIPES/build-an-mcp-server.md) · Field note: [Stop building toy MCP servers](../FIELD-NOTES/production-mcp-server-blueprint.md)
