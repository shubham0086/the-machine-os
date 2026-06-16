# Agent memory

> An agent with no memory repeats every mistake and re-solves every solved problem. Real agent
> memory is two stores, not one: what worked, and what failed.

## The decision

"Add memory" usually means "stuff the last few turns into the context window." That is short-term
memory, and it dies at the session boundary. The durable problem is across sessions: an agent that
solved a task last week should recall the solution this week, and an agent that failed the same way
twice should be *stopped* before it fails a third time. Those are two different stores with two
different jobs.

### Solution memory (recall what worked)

On every task that passes, record `(goal, taskTitle, files, explanation)`. On every new task,
retrieve the top-3 most similar past solutions and inject them into the prompt. The interesting
engineering choice in the reference implementation is the embedding: a **deterministic 128-dimension
character-trigram TF-IDF vector**, hashed into buckets and L2-normalised, with cosine similarity over
a local Vectra index — and a keyword-overlap fallback if the vector store is unavailable.

No embedding API, no model download, no network call. It runs fully offline and never throws to the
caller — a vector-store failure silently degrades to keyword search. That is a deliberate trade: it
is weaker than a real embedding model on semantics, but it has zero cost, zero latency, zero
dependencies, and zero failure modes that can take the agent down.

### Failure memory (don't repeat what broke) — the SCAR pattern

Every failure is logged to SQLite with a regex *fingerprint* of the error trace. Before generating,
the agent pulls recent relevant scars for the current scope and injects them at the top of the
prompt: *"HISTORICAL SCARS — DO NOT REPEAT THESE FAILURES."* If the same fingerprint shows up **≥2
times**, a repeat-failure detector escalates from a hint to a hard STOP block: *"You are in a
recursive error loop. Do NOT attempt that action again. Pivot your strategy."*

This is the single highest-leverage memory in an autonomous system, because the default failure mode
of an unsupervised agent is to retry the same broken action forever.

## Where it sits now

Memory became its own category of the AI stack in 2025 (Mem0, Letta and others raised on exactly
this). The pattern the field is converging on — **store outcomes, retrieve relevant ones, and reflect
failures back into the next attempt** — is the same idea as research-line "reflection" memory, just
made durable and cheap. The two-store split here (solution + scar) is that idea expressed as
production code rather than a paper.

---

**Reference code:** [agent-recall](../REPOSITORIES/agent-recall.md) (solution memory, 9 tests), [agent-scars](../REPOSITORIES/agent-scars.md) (failure memory, 7 tests).

**Related:** [The agent anatomy](the-agent-anatomy.md) · [WORKFLOWS/reality-driven-development](../WORKFLOWS/reality-driven-development.md) · Field note: [Agent memory](../FIELD-NOTES/agent-memory.md)
