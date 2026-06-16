# Portfolio RAG chatbot

> The "ask my portfolio anything" assistant on the live site. It's the one fully-open, fully-live
> system here — and it dogfoods two of these repos in production. Small, but it makes every
> resilience decision a real one.

**Live:** the chatbot on [the portfolio site](https://my-portfolio-github-io-beta-five.vercel.app).
**Code:** open — `api/chat.js`, a single Vercel serverless function.

## The pipeline (grounded RAG, ~280 lines)

```
question → embed (Gemini) → cosine over prebuilt index → top-5 chunks
        → Router.chat (free failover chain, temp 0, "answer only from context")
        → cited answer + source files
```

1. **Retrieve** — embed the question with Gemini, cosine over a prebuilt static index
   (`api/index.json`, built by [rag-knowledge-engine](../REPOSITORIES/rag-knowledge-engine.md)'s
   serverless mode). No LLM, no DB at retrieval time — just vectors and a dot product.
2. **Generate** — feed the top chunks to the vendored [agent-routing](../REPOSITORIES/agent-routing.md)
   Router in prose mode at temperature 0, under a strict *"answer only from the numbered context, else
   refuse exactly this sentence"* system prompt.
3. **Cite** — return the distinct source files so the widget renders citation links — but **not** when
   the model refused, because a refusal has no grounded claim to back.

This is the two repos it documents, running in production: the retrieval is rag-knowledge-engine's
"serverless mode," the generation is agent-routing's real failover + circuit breaker.

## The resilience decisions that matter at small scale

- **The embed/generation split.** Generation is fully swappable across a free OpenAI-compatible chain
  (NVIDIA NIM → Groq → OpenCode Zen → OpenRouter), with **Gemini deliberately last** as the safety net
  so the bot never goes dark. But **embedding is pinned** to `gemini-embedding-001` — the exact model
  the index was built with — and gets *no* fallback, because embedding the query with a different model
  makes the cosine scores meaningless. Knowing which call is swappable and which is load-bearing is the
  whole design (see [LLM routing and resilience](../ARCHITECTURES/llm-routing-and-resilience.md)).
  Any provider whose key is absent is skipped, so the same code degrades to Gemini-only until more keys
  are added.

- **A rate limiter that fails open.** Primary is a global fixed-window per-IP counter in Upstash Redis,
  shared across all serverless instances (one pipelined `INCR` + `EXPIRE … NX` round-trip). Fallback is
  an in-memory per-instance window when KV is unconfigured or unreachable. The rule: **abuse control
  must never take the assistant down** — on a KV error it logs and falls through, fail-open. It even
  resolves the Upstash env vars by suffix so any integration prefix works without a code change.

- **Guardrails as typed errors.** A prompt-injection attempt raises a `GuardrailError` that becomes a
  client-friendly 400; everything else is a 502 with a generic message. The system prompt also refuses
  to reveal its own instructions, the context mechanism, or any keys.

## Honest status

It's a small system — a single function over a static index — and that's the point: it's the live,
inspectable proof that the patterns in the bigger (private) systems are real. The index is prebuilt
and static, so "retrieval" is a dot product, not a vector DB; scaling content would mean rebuilding the
index, which is a documented trade, not an oversight.

## Where it sits now

"RAG over your own content with strict grounding and citations" is the 2026 baseline for a trustworthy
assistant — refuse-when-unsure beats confidently-wrong, and citations make the grounding auditable.
This one is the minimum honest version of that, in under 300 readable lines.

---

**Dogfoods:** [rag-knowledge-engine](../REPOSITORIES/rag-knowledge-engine.md) · [agent-routing](../REPOSITORIES/agent-routing.md). **Related:** [ARCHITECTURES/llm-routing-and-resilience](../ARCHITECTURES/llm-routing-and-resilience.md) · Recipe: [Build a RAG system](../SYSTEM-RECIPES/build-a-rag-system.md) · Field notes: [Hybrid retrieval / RAG in practice](../FIELD-NOTES/rag-in-practice.md), [Zero-cloud local RAG](../FIELD-NOTES/zero-cloud-local-rag.md)
