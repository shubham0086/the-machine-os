# Context engineering

> The context window is a budget, not a bucket. Every token you spend on noise is a token of
> attention the model doesn't spend on the task — and the degradation is measurable, consistent,
> and almost entirely avoidable.

## The decision

A long-horizon agent doesn't fail because the model got dumber. It fails because the window
filled with the wrong tokens: a full repo dump when it needed three files, stale state from two
runs ago, ten retrieved chunks where one was relevant. Every model degrades as its window fills
with irrelevant content, regardless of how large that window is. So the engineering problem isn't
"fit more in" — it's *decide what the model sees at each turn, and what it must never see.*

Three sub-problems show up in production, each with a real mechanism behind it: what to remember
across runs, what to retrieve within a run, and what to refuse to load at all.

## 1. Memory: what survives between runs

A Blackboard is the agent's working memory — append-only *within* a run, gone *between* runs.
That's correct for short-term state and a disaster for continuity: a three-hour pipeline finishes,
and tomorrow's run has amnesia. It re-researches what it already knew and re-pays the tokens.

The fix is a tiered memory routing policy, the actual rule from the engine:

1. **Short-term** → `Blackboard.state` (current iteration data)
2. **Operational** → `Blackboard.addTask()` / `updateTask()` (workflow state across a run)
3. **Long-term** → SQLite `solutions` table (cross-session: what was learned, what it cost, was it verified)
4. **Hallucination guard** → *if a previous result is missing from SQLite, assume it never happened — do not guess.*

That last rule is the load-bearing one. Long-term memory is only an asset if the agent trusts it
*conditionally*. Before reusing a stored solution the engine checks recency (is it <7 days old?),
confidence (`confidence_pct > 70`?), and — critically — whether any logged incident references the
same task. A solution with an open SCAR against it is treated as unverified and re-solved. Memory
without verification just lets the system propagate stale answers faster.

## 2. Retrieval: what to pull in within a run

Retrieval is a context-assembly problem, not a search problem — the goal isn't "find similar
text", it's "spend the fewest tokens to put the *right* facts in the window." Naive vector search
fails it twice: it returns ten chunks when one was needed, and it returns the semantically-near-but-
useless ("authentication *logs*" for a query about "authentication *flow*"). The production answer
is three layers, in cost order:

- **A hash cache first.** Most agent queries repeat ("what's the architecture?" across three runs).
  Key a cache on `SHA-256(query + role + intent)` and a repeat costs **zero tokens**. The role and
  intent are in the key on purpose — the same question from an Architect and a Coder needs
  different context.
- **An exact-match fast path before embeddings.** Full-text search (SQLite FTS5) is free; embeddings
  cost a round-trip. Try exact first, fall back to semantic only on a miss — which empirically is
  ~20% of queries, cutting embedding spend by 80%.
- **A filter on whatever semantic search returns.** Drop stale chunks (recency), low-confidence
  chunks, and role-irrelevant ones (a Coder doesn't need ops logs); rank the survivors by
  `confidence × recency` and keep the top three. Ten chunks → three is 70% fewer tokens in the
  window *and* a model less likely to be distracted by the seven it didn't need.

Stacked, this is roughly a **75% token reduction** versus naive RAG on a repetitive workload — and
faster, because the cheap paths short-circuit the expensive ones. When the corpus is small enough
to fit in context, the honest move is to skip retrieval entirely; RAG earns its complexity only on
large or repeatedly-queried knowledge bases. The fuller retrieval-quality story — hybrid BM25+vector
fusion and cross-encoder reranking — lives in [rag-knowledge-engine](../REPOSITORIES/rag-knowledge-engine.md)
and the [Build a RAG system](../SYSTEM-RECIPES/build-a-rag-system.md) recipe.

## 3. Hygiene: what never to load

The cheapest token is the one you don't spend. The engine's standing rule is *never load the full
repo* — navigate structure with a code graph and pull only the files in a change's blast radius.
A prompt template with typed slots (`{{context}}`, `{{currentFiles}}`) makes this explicit: the
harness decides what fills each slot, so context assembly is a reviewable step, not an accident of
string concatenation buried in application code.

## Where it sits now

This is the discipline the field renamed from *prompt engineering* to **context engineering** in
2025–2026, and the reframing is the point: the model's input is a dynamic, multi-layered system
that changes per task, per user, per turn — not a static string. The recognised levers are exactly
the three above — memory (what persists), retrieval (what's pulled in), and compaction/hygiene
(what's summarised or dropped) — plus structural cues that help the model navigate what *is* in the
window (clear headers segment context into addressable units; bulleted rules over prose for
constraints). The consensus number is the one worth repeating: redesigning the context pipeline
moves task completion far more than refining prompt wording does. Reliability is a budget you
manage, not a window you fill.

---

**Reference code:** [agent-recall](../REPOSITORIES/agent-recall.md) (solution memory) · [agent-scars](../REPOSITORIES/agent-scars.md) (failure memory) · [agent-context](../REPOSITORIES/agent-context.md) (graph + blast radius) · [rag-knowledge-engine](../REPOSITORIES/rag-knowledge-engine.md) (hybrid retrieval).

**Related:** [Agent memory](../ARCHITECTURES/agent-memory.md) · [Prompting as a contract](prompting.md) · Field note: [Hybrid retrieval beats vector search](../FIELD-NOTES/rag-in-practice.md)
