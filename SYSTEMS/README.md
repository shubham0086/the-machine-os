# Systems

The repos isolate one pattern each. This section does the opposite: it walks **whole systems that
shipped**, where all the patterns are running at once and fighting real failure modes. This is where
"AI systems that don't break" stops being a tagline and becomes specific code making specific
trade-offs.

| System | What it is | Why it's here |
|--------|-----------|---------------|
| [The Sovereign SDLC engine](the-sovereign-sdlc-engine.md) | A multi-agent engine that writes, audits, and commits code autonomously | The reference implementation for cost-bounded recovery, error taxonomy, and reality-driven state |
| [Agency OS](agency-os.md) | A six-agent content pipeline; brief in, shipping artifact out | Operational maturity: crash recovery, rate limiting, GC, SSE reconnect-replay |
| [Portfolio RAG chatbot](portfolio-rag-chatbot.md) | The live "ask my portfolio anything" assistant | Dogfoods two repos in production; embed/generation resilience split |

---

### What "production" actually means here

None of these are demos. Each one answers the questions a demo never has to: what happens when a
provider 429s mid-run, when the server restarts mid-job, when the budget is blown, when a client's
connection drops, when the model returns malformed JSON. The honest version of each is below —
including what's still private, still pre-revenue, or still rough. Authority comes from the real
trade-offs, not from a clean diagram.

> Two of these (Agency OS, the SDLC engine) are published as **case-study repos** — architecture and
> annotated excerpts, with full source kept private to preserve commercial moat. The
> [portfolio chatbot](portfolio-rag-chatbot.md) is fully open and live.
