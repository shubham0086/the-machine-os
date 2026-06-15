# agent-routing

> A multi-provider LLM gateway with ordered failover, circuit breakers, and budget-aware
> routing - the reliability layer no demo ever shows you.

## Problem

Your LLM provider *will* go down, rate-limit you, or spike in latency. A single-provider agent
is a single point of failure in production.

## Architecture

An ordered failover chain (NVIDIA → Groq → OpenCode → OpenRouter → Gemini) with per-session
circuit breakers, token trimming, and injection guardrails. Verified live in production. 23
tests. Prose mode + `thinkingBudget=0` for latency-sensitive paths.

## Lessons learned

- Failover order should be cost- and latency-ranked, not alphabetical.
- A circuit breaker per session (not global) stops one bad provider from poisoning every request.
- Real failover needs a *second* funded key - free-tier-only is theater.

## Demo

```bash
git clone https://github.com/shubham0086/Agent-Routing
cd Agent-Routing && node main.js
```

## Repository

[github.com/shubham0086/Agent-Routing](https://github.com/shubham0086/Agent-Routing)

## Related

- Field note: [LLM Fallback Chains](../FIELD-NOTES/llm-fallback-chains.md)
- Recipe: [Build a Security Auditor](../SYSTEM-RECIPES/build-a-security-auditor.md)
