# ADR: keep the engine native, rent the tools

> The honest question wasn't "is my engine good enough?" It was "did I waste a year building
> something a framework gives away for free?" The answer turned out to be *half yes* — and the half
> that was waste is not the half you'd guess.

**Status:** Accepted (2026-05) · **System:** Sovereign SDLC engine · **Reference:** the 2026
Agentic-SDLC → MCP transformation review

## Context

By 2026 the agent-framework market had matured: LangGraph 0.4 overtook CrewAI in stars and became a
default for enterprise production; CrewAI 2 reported 47.8K stars and 2B agent executions with 60%
Fortune-500 adoption; AutoGen 1.0 and Google ADK filled out the field. All of them gained one thing
at once — **native MCP support** — making MCP the universal capability layer of the year.

That raised a real strategic fork for a solo-built engine. Two years of work had gone into a
hand-rolled multi-agent system. The market now sold, as products, things this engine had built by
hand. The temptation was to conclude the engine was redundant and migrate onto a framework. The
review existed to answer that honestly, not defensively.

## The decision

**Keep the orchestration engine native. Migrate the tools — and only the tools — to MCP, through a
self-hosted gateway. Do not adopt a framework as a replacement.**

The reasoning hinges on a distinction the review made sharp: *what differentiates vs. what doesn't.*

- **The differentiators are native and stay native.** Five components, working as a coherent unit,
  are not shipped together by any framework: the multi-provider LLM router with model-level failover,
  the SCAR failure-memory with repeat-guard injection, the DAG executor with topological scheduling,
  the cost enforcer (USD cap + INR display + hard abort), and the session circuit breaker. CrewAI
  *charges* for some of these; none ship them as one thing. Throwing them away to adopt a framework
  would destroy the most valuable artifact, not improve it.
- **The commodity tools were the actual waste, and should be rented.** File I/O, web fetch, git,
  shell exec, browser automation — roughly **20 engineering days** went into building tools that the
  MCP ecosystem now provides, sandboxed and maintained, for free. *That* was the misallocation. The
  rule going forward: every new capability (Slack, Linear, Jira, Figma) is MCP-mediated by default,
  never hand-built.

The one-line principle: **build what differentiates, rent what doesn't.**

## Options considered

| Option | Why it lost (or won) |
|--------|----------------------|
| **Migrate to CrewAI 2 / LangGraph** | Rejected. Migration costs weeks; the gain is mostly the tool ecosystem, which MCP delivers *without* migrating. And "built my own engine" is worth far more, both technically and as a portfolio signal, than "wired up a framework." |
| **Adopt MCP by plugging in community servers** | Rejected as unsafe. Plugging raw community MCP servers into an autonomous loop is 2026's `eval()` on remote input — see the CVE wave and the [MCP gateway threat model](../SECURITY/mcp-gateway-security-isolation.md). |
| **Keep building tools native forever** | Rejected. It's the original waste, continued. The world moved to a shared capability layer; staying native on commodity tools is falling behind for no differentiation. |
| **Native engine + MCP tools via a self-hosted gateway** | **Accepted.** Keeps the moat, gains the ecosystem, contains the risk to a single mediated boundary. |

## Consequences

**Accepted costs.** A self-hosted gateway is now on the critical path — roughly a 6–8 week part-time
build to be fully MCP-mediated with the seven mandatory controls (allowlist, description pinning,
per-server sandbox, in/out guardrails, audit log, human-in-loop on destructive ops). Until it exists,
the engine deliberately stays MCP-free — which, as the security note observes, makes it *currently
safer than the average MCP user* precisely because it hasn't connected yet.

**What it bought.** A defensible posture and a sharper portfolio narrative: "an engine whose
differentiating components are native, with commodity capability rented through a gateway that treats
every tool response as untrusted input." That sentence is the difference between "interesting builder
project" and "enterprise-grade agentic infrastructure."

**A reusable filter.** The decision left behind a test that's been applied since to every "should I
build this?" question: *does it differentiate? Build it. Does it not? Rent it, behind a boundary you
control.*

## Where it sits now

This is now the mainstream architecture: MCP as the tool layer, frameworks as optional orchestration,
and — increasingly — a **gateway/control-plane** as the mandatory thing in between. The forward edge
the review didn't yet cover is the *next* protocol up: agent-to-agent (A2A) communication, where the
same "differentiate vs. rent, mediate the boundary" logic will apply to agents delegating to other
agents, not just to tools. The principle outlives the specific protocols.

---

**Reference:** the full review (framework landscape, the 7 gateway controls, per-agent capability
scoping, phased migration) is summarised in [SECURITY/mcp-gateway-security-isolation](../SECURITY/mcp-gateway-security-isolation.md).

**Related:** [SYSTEMS/the-sovereign-sdlc-engine](../SYSTEMS/the-sovereign-sdlc-engine.md) (the engine kept native) ·
[ARCHITECTURES/mcp-integration](../ARCHITECTURES/mcp-integration.md) ·
[REPOSITORIES/mcp-agent-toolkit](../REPOSITORIES/mcp-agent-toolkit.md) ·
Field note: [Stop building toy MCP servers](../FIELD-NOTES/production-mcp-server-blueprint.md)
