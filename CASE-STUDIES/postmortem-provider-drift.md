# Postmortem: documentation drift in a fast-moving model market

> Four documents named four different models for the same agent. The code named a fifth. The agent
> was using the fifth — correctly — while every human-readable doc pointed somewhere else. Nothing
> threw an error. The system just quietly ran on a truth the docs had stopped telling.

**Date:** 2026-05-12 · **Severity:** medium · **System:** Sovereign SDLC engine
· **Reference:** `INC-2026-0512-001`, `memory/scars.md` ("Provider Confusion")

## What happened

Over a few weeks of rapid model churn — providers deprecating models, prices moving, a migration
from one primary model to another (`K2.6`/`K2.5` → `minimax-m2.5` + `qwen3-coder`) — the engine's
*code* was updated each time. The *docs* were not, or were updated inconsistently.

The result: `MODEL_ALLOCATION.md`, `CLAUDE.md`, `ARCHITECTURE.md`, and `agents.yaml` each listed a
different model allocation, and all of them disagreed with `src/core/BaseAgent.js`, which is what
actually ran. Anyone (human or agent) reading the docs to decide "which model handles code tasks?"
got a wrong answer. The cost wasn't a crash — it was wrong guidance, wrong mental models, and the
latent risk of "fixing" the code to match a doc that was itself stale.

A sibling incident the same day: `autoCommit()` committed locally but never pushed
(`INC-2026-0512-002`), so the public GitHub repo silently stopped updating from May 10. Same class of
failure — a quiet divergence between what the system *was doing* and what everyone *assumed* it was
doing.

## Root cause

The root cause is structural, not a typo: **there were multiple sources of truth for a fast-changing
fact, and no rule about which one wins.** In a slow-moving codebase, docs drift gently and it's
tolerable. In an agent system during the 2025–2026 model churn — where the right model for a task
changed monthly — documentation drift is continuous, and a system that trusts docs over code will act
on stale information by default.

## The fix

The fix was to *name a single source of truth and make everything else defer to it.*

- **Code is truth for what runs.** The standing rule became explicit: *"trust `src/core/BaseAgent.js`
  for actual model chains, never the docs."* `MODEL_ALLOCATION.md` was regenerated from the code, not
  hand-maintained alongside it.
- **Reality files are truth for what's true.** The engine added `memory/reality/*.yaml` — small,
  checked, machine-readable fragments (`llm-providers.yaml`, `pipeline.yaml`) — and the operating
  rule: *"if docs and code conflict, trust `memory/reality/` and actual code over stale documentation."*
- **A change-order for model edits.** Before a model chain changes, update the reality file and the
  allocation doc *first*, in a fixed order — so the docs are part of the change, not an afterthought
  that drifts.

## The lesson

> Prose documentation is a cache of the truth, and like every cache it goes stale. The fix isn't
> "write better docs" — it's deciding what the source of truth *is* and making the cache regenerate
> from it.

This is the same instinct as the engine's hallucination guard — *"if a previous result is missing
from SQLite, assume it never happened; do not guess"* — applied to documentation. The system is only
allowed to believe what a verifiable source says, and human-written prose is explicitly not that
source. It's why the [context-engineering](../AI-ENGINEERING/context-engineering.md) note routes
"what's true" to reality files and SQLite, never to docs.

## Where it sits now

"Reality-first" / "code-as-source-of-truth" is now a recognised discipline for agent systems, and the
broader 2026 framing — *agents as software systems, not clever prompts* — carries it directly: you
version, check, and single-source the facts an agent depends on, exactly as you would any other
production configuration. The model market is still churning (provider deprecations and price moves
remain monthly events), which means documentation drift isn't a one-time bug to fix — it's a standing
force you engineer against with a single source of truth and a regeneration step, forever.

---

**Reference code:** the reality-context loader and `MODEL_ALLOCATION.md` regeneration live in the
Sovereign SDLC engine — see [SYSTEMS/the-sovereign-sdlc-engine](../SYSTEMS/the-sovereign-sdlc-engine.md).

**Related:** [WORKFLOWS/reality-driven-development](../WORKFLOWS/reality-driven-development.md) ·
[AI-ENGINEERING/context-engineering](../AI-ENGINEERING/context-engineering.md) (routing "what's true") ·
[ARCHITECTURES/llm-routing-and-resilience](../ARCHITECTURES/llm-routing-and-resilience.md) (the chains that kept changing)
