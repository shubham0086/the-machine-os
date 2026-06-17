# Agent identity & authorization

> Capability scoping locks down *what a role may do*. It leaves three questions unanswered, and an
> autonomous agent makes all three urgent: **who** is this agent, **what** credential is it carrying
> right now, and how do I **audit and revoke** it when something goes wrong?

## Why scoping isn't enough

The [MCP gateway threat model](mcp-gateway-security-isolation.md) ends on capability scoping: a
Researcher gets `web.fetch` + `fs.read`, a Coder gets scoped `fs.write`, no agent gets everything. That
contains the *blast radius of a role*. It does not contain the **confused-deputy / token-theft** class,
where the agent holds a real credential (a GitHub token, a DB connection) and one indirect injection
later, the agent — or the attacker driving it — is acting *as you*, with every scope that token carries.

Scoping can't answer the questions that incident raises. Which agent instance acted? When does its
authority expire? How do I cut it off mid-run without taking the whole system down? Those are *identity*
questions, and 2026 turned them into their own product category (governed agent identities, scoped
credentials, audit) precisely because every team deploying autonomous agents hit them at once.

## The four properties an agent credential needs

A workable agent identity is a short, signed, expiring credential — the same shape a service-account
token has, adapted to the fact that the holder can now be *talked into* misusing it. Four properties,
each a specific defense:

1. **Verifiable identity.** The credential carries a stable `agentId`, a `role`, and a unique `jti`. The
   audit question "which agent did this?" has an answer that survives the run.
2. **Least privilege, enforced.** Scopes are explicit (`web.fetch`, `fs.read`) or prefix-wildcard
   (`fs.*`); the authorize check denies anything not granted. This is capability scoping, but now bound
   to a *credential* rather than assumed from a role string.
3. **Short lifetime.** Credentials expire in minutes, not hours. This is the cheapest mitigation for a
   stolen token: make it worthless before it can be used twice. TTL is a security control, not a UX knob.
4. **Revocable + audited.** Every issue / allow / deny / revoke lands in an append-only log, and any
   credential can be killed by `jti` instantly. For an unattended agent, the audit trail *is* the
   incident response.

## Where it sits in the stack

Identity sits between the agent and the [gateway](mcp-gateway-security-isolation.md) that fronts its
tools: the agent presents a scoped, short-lived credential; the gateway (or the tool layer) authorizes
each call against it and logs the decision. It composes with, rather than replaces, capability scoping —
scoping decides the *ceiling* of a role, identity decides *which concrete, expiring, revocable grant* an
agent is exercising right now.

The reference implementation is a zero-dependency broker (HMAC-signed credentials, scope enforcement,
expiry, revocation, audit log) — see [REPOSITORIES/agent-identity](../REPOSITORIES/agent-identity.md).
The honest status: it's a forward-bet starter, not a shipped production service. It distils the engine's
real capability-scoping and audit patterns into the identity layer the threat model implied but didn't
yet build.

## Where it sits now

In 2026 "agent identity" became a named category — governed identities with their own audit trails,
scoped and short-lived credentials, and integration with enterprise identity providers (the major
clouds now issue agents their own governed identities). It's under-hyped relative to its importance: it's
really service-account discipline catching up to the fact that the service account can be socially
engineered. The forward edge — see [where agent systems are heading](../RESEARCH/where-agent-systems-are-heading.md) —
is that the same identity-and-authz logic will be mandatory one rung up, for agent-to-agent (A2A)
delegation, not just agent-to-tool.

---

**Reference code:** [agent-identity](../REPOSITORIES/agent-identity.md) — scoped/short-lived/signed credentials, audit + revocation, 21 tests, zero-dependency.

**Related:** [The MCP gateway: security isolation](mcp-gateway-security-isolation.md) (the threat model this answers) · [Agent execution safety](agent-execution-safety.md) · [RESEARCH/where agent systems are heading](../RESEARCH/where-agent-systems-are-heading.md)
