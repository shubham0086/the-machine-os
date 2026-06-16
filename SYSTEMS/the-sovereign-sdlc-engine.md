# The Sovereign SDLC engine

> A multi-agent system that takes a plain-English goal and autonomously researches, plans, writes,
> audits, documents, and commits the code — with hard budgets, bounded recovery, and a memory of its
> own failures. 137 tests. Node.js. The reference implementation for most patterns in this handbook.

## The problem

"Autonomous coding agent" is the most over-promised phrase in the industry. The demo writes a
to-do app; the reality runs out of money, loops on the same error forever, trusts a stale doc, or
quietly corrupts the repo it was supposed to improve. This engine is the answer to a narrower, harder
question: **what does it take to let an agent modify a real codebase for hours without supervision and
trust the result?**

## The pipeline

```
Goal → Researcher → Perceptor → Architect → [Coder ↔ Auditor]×3 → Documenter → autoCommit
```

Every agent extends one `BaseAgent`; all state lives in one `Blackboard`, mutated only through
methods. The `Coder ↔ Auditor` loop is bounded to three rounds — write, check against a contract,
iterate, then force resolution. Bounded, not "until perfect."

## The four things that make it not break

### 1. A hard cost ceiling, in code

A `CostEnforcer` tracks real token spend per provider and model against pricing loaded from a reality
file, and **throws** the moment a run exceeds its budget (default `$2.00`, with INR shown alongside —
this was built by someone watching real rupees). Spend is a tracked, enforced quantity, not a surprise
on the monthly bill.

### 2. A failure taxonomy, not error strings

Raw provider errors are mapped to a stable enum — `RATE_LIMIT`, `CONTEXT_OVERFLOW`, `AUTH`,
`INVALID_JSON`, `CHAIN_EXHAUSTED`, `COST_LIMIT`, `PROTECTED_FILE`, and more — via ordered regex rules,
specific patterns first. Every failure becomes *queryable and routable*. The recovery system and the
failure memory both key off this enum instead of re-parsing strings.

### 3. Cost-bounded recovery, then quarantine

A `RecoverySupervisor` watches the blackboard for **stuck** tasks (no meaningful change in 240s) and
**failed** tasks, classifies each, and applies a targeted strategy:

| Failure | Strategy |
|---------|----------|
| `provider_failure` | reset and fall through the provider chain |
| `truncation` | retry once with an explicit completion request |
| `deadlock` | break the dependency lock for one attempt |

Recovery is capped three ways: **max 3 retries**, **recovery cost can't exceed the run budget**, and a
task that blows past either gets **quarantined** (marked hazardous) and **hard-rolled-back to a git
tag** — with the rollback tag validated by an allowlist regex and executed via an argument array, never
a shell string (see [agent execution safety](../SECURITY/agent-execution-safety.md)). The system would
rather stop and roll back than thrash.

### 4. Memory of what worked and what failed

- **Solution memory** records every passing task and retrieves the top-3 similar past solutions on the
  next one, using a deterministic offline trigram embedding — no API, no model download (see
  [agent memory](../ARCHITECTURES/agent-memory.md)).
- **SCAR failure memory** fingerprints every failure and injects past scars at the top of the prompt;
  the same fingerprint twice escalates to a hard STOP block. This is what breaks the "retry the broken
  action forever" loop that kills naive autonomous agents.

## The operating discipline

The engine runs under [reality-driven development](../WORKFLOWS/reality-driven-development.md): reality
files (`memory/reality/*.yaml`) outrank stale docs, durable truth lives in SQLite (no record → "assume
it never happened"), context is navigated via a structural code graph instead of loading the whole
repo, and edits are additive ("comment, don't delete"). These rules exist because of real damage — a
mis-rooted goal once generated 49 files in the wrong repository, two days lost; that incident became a
permanent check and a logged scar.

## Honest status

Published as a **case-study repo**: architecture and annotated excerpts public, full source private to
preserve the moat (the engine is a portfolio artifact and a potential product, not a commodity to give
away). It is a Node.js engine, not a Python/Pydantic one — a correction worth stating because it's been
miscategorised before. 137 tests. The primary model chain has shifted over time (Moonshot, Bedrock,
Gemini, NVIDIA NIM, OpenRouter, Ollama as the keyless local floor); the *architecture* — not any one
model — is the durable part.

## Where it sits now

This is the production-side version of the 2026 consensus that reliable agents are **durable workflow
engines with bounded autonomy**, not free-roaming swarms. Cost ceilings, error taxonomies, bounded
recovery, and failure memory are exactly the primitives the broader field is now naming as
requirements. The engine reached them by hitting the failures first.

---

**Patterns extracted from this system:** [agent-routing](../REPOSITORIES/agent-routing.md) (failover + circuit breaker), [agent-scars](../REPOSITORIES/agent-scars.md) (failure memory), [agent-recall](../REPOSITORIES/agent-recall.md) (solution memory), [agent-context](../REPOSITORIES/agent-context.md) (code graph).

**The whole thing as a reusable spec:** the patterns above are distilled into a copy-paste, platform-agnostic blueprint — [the production multi-agent template](https://github.com/shubham0086/Agent-Anatomy/blob/main/parts/5-the-harness/production-multi-agent-template.md) (in Agent-Anatomy's harness section).

**Related:** [ARCHITECTURES/multi-agent-orchestration](../ARCHITECTURES/multi-agent-orchestration.md) · [SECURITY/agent-execution-safety](../SECURITY/agent-execution-safety.md) · [WORKFLOWS/reality-driven-development](../WORKFLOWS/reality-driven-development.md)
