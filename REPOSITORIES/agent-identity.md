# agent-identity

> Capability scoping says which tools a *role* may call. Identity says who the agent *is*, what
> short-lived credential it carries right now, and how to audit and revoke it.

## Problem

An autonomous agent that holds a credential (a GitHub token, a DB connection) is a privileged actor
that can be *talked into* misusing it. One prompt-injection later, the agent is acting as you, with
every scope that token carries — and you have no record of which agent acted and no way to cut it off
mid-run. This is the confused-deputy / token-theft attack class from the
[MCP gateway threat model](../SECURITY/mcp-gateway-security-isolation.md).

## Architecture

A zero-dependency broker that issues **scoped, short-lived, signed** credentials and authorizes every
action against them. Each token carries a verifiable `agentId` + `role` + unique `jti`, an explicit
scope list (exact `fs.read` or prefix-wildcard `fs.*`), and an expiry (minutes, not hours). Signing is
HMAC-SHA256 (`node:crypto`), compared in constant time; tampering flips the signature. Every issue /
allow / deny / revoke lands in an append-only audit log, and any credential can be revoked by `jti` for
an instant kill switch.

## Lessons learned

- Identity is the half of authz that capability scoping leaves out: scopes say *what a role may do*;
  identity says *who did it, until when, and how to stop them.*
- Short TTL is a security control, not a UX detail — the cheapest mitigation for a stolen credential is
  one that expires before it can be used twice.
- The audit log is the point. For an unattended agent, "what did it decide and why" is the forensic
  trail you'll wish you had after the incident — so it's built in from line one.

## Demo

```bash
npm run demo   # issue → authorize (allow/deny) → tamper → expiry → revoke, with the full audit trail
```

## Repository

[github.com/shubham0086/agent-identity](https://github.com/shubham0086/agent-identity) · 21 tests · zero-dependency

> Honest provenance: this is a forward-bet starter, not an extraction of a shipped feature. It distils
> the per-agent **capability scoping** and **audit** patterns from the Sovereign SDLC engine and the MCP
> threat model into the missing *identity* layer — the 2026 product category nobody had a year ago.

## Related

- Security note: [Agent identity & authorization](../SECURITY/agent-identity-and-authz.md)
- Threat model it answers: [the MCP gateway](../SECURITY/mcp-gateway-security-isolation.md)
- Forward thesis: [where agent systems are heading](../RESEARCH/where-agent-systems-are-heading.md)
