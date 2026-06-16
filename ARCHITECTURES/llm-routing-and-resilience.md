# LLM routing and resilience

> A single provider key is a single point of failure. The question is not *if* you get a 429
> mid-run, it's what your system does in the next 200ms.

## The decision

Calling one provider directly couples your uptime to theirs. Free tiers rate-limit, models get
deprecated, regions have outages, and quotas reset on someone else's schedule. The fix is a **router**
that sits between your code and the providers, walks an ordered fallback chain, and trips a circuit
breaker on providers that are down — so one provider's bad day degrades quality slightly instead of
taking the system offline.

Three mechanisms make it work, all present in the reference code:

1. **Ordered fallback chains, per task class.** Requests are categorised (`code`, `content`, `chat`,
   …) and each class has its own chain. The live portfolio chatbot's generation chain, for example,
   is `NVIDIA NIM → Groq → OpenCode Zen → OpenRouter → Gemini`, with Gemini deliberately **last** as
   the safety net so the bot never goes dark. A provider with no key configured is silently skipped,
   so the same code degrades gracefully from a five-provider chain to one.

2. **A session-level circuit breaker.** Once a provider exhausts every model in its chain, it is
   marked down and skipped for the rest of the run — you don't keep paying the timeout tax on a dead
   provider call after call.

3. **A stable error taxonomy.** Raw provider error strings ("429", "context_length_exceeded",
   "ECONNREFUSED") are mapped to a fixed enum — `RATE_LIMIT`, `CONTEXT_OVERFLOW`, `AUTH`,
   `CHAIN_EXHAUSTED`, `COST_LIMIT`, and so on — so every failure is *queryable and routable* instead
   of a freeform string. The recovery logic and the failure memory both key off this enum.

## The one call that *can't* fail over

Resilience has a boundary worth naming. In the portfolio chatbot, **generation** is fully swappable
across any OpenAI-compatible provider, but **embedding is pinned** to the exact model the search
index was built with (`gemini-embedding-001`). Embed the query with a different model and the cosine
scores are meaningless — so that one call gets no fallback chain by design. Knowing which calls are
swappable and which are load-bearing is the whole skill.

## Where it sits now

This is now a recognised layer of the stack — the "LLM gateway / router" (LiteLLM, OpenRouter, and
the cloud providers' own gateways all occupy it). The 2026 framing is **provider-portability as a
first-class requirement**: model churn is constant, prices move monthly, and a system tied to one
endpoint is a liability. The router here is the same idea, built small enough to read in one sitting.

---

**Reference code:** [agent-routing](../REPOSITORIES/agent-routing.md) — multi-provider failover + circuit breaker, 23 tests. Dogfooded live in the portfolio chatbot.

**Related:** [Multi-agent orchestration](multi-agent-orchestration.md) · [SYSTEMS/portfolio-rag-chatbot](../SYSTEMS/portfolio-rag-chatbot.md) · Field note: [LLM fallback chains](../FIELD-NOTES/llm-fallback-chains.md)
