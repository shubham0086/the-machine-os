# Postmortem: the 49-garbage-files collapse

> The pipeline reported success. It had written 49 files. Every one of them was unusable, and
> several were in the wrong repository. The system was not broken in a way that threw an error —
> it was broken in the way that's far worse: it was *confidently done.*

**Date:** 2026-05-22 · **Severity:** critical · **Cost:** ~2 days · **System:** Sovereign SDLC engine
· **Reference:** `memory/scars.md` SCAR-005

## What happened

A goal targeting a separate project (a `jarvis-system` HUD) was run against the SDLC engine. The
pipeline completed. It generated 49 `.jsx` files and marked the tasks passed. Two things were wrong,
and the second is the one that matters.

**Failure 1 — wrong repo.** No `projectRoot` was set, so all 49 files landed in the SDLC engine's own
tree instead of the target project. Annoying, fully preventable, and not the interesting failure.

**Failure 2 — the files were garbage regardless of location.** A manual audit of the "completed"
output:

- `AgentMonitor.jsx` — 28 lines, a raw `<pre>{JSON.stringify(data)}</pre>`, no UI, no styling.
- `InterAgentCommunicationVisualizer.jsx` — a syntax error on line 25 (a stray `n`), duplicate state
  declarations, and imports of hooks that don't exist (`useBlackboard`, `useEventStore`).
- `TokenBudgetMonitor.jsx` — 19 lines, an empty shell.
- `DecisionTreeVisualizer.jsx` — 50 lines, placeholder `<div>`s, no tree logic.
- The other 45 — the same: 13–50 lines, `console.log` placeholders, broken imports, no styling.

The Auditor passed all of them. By its definition, they *were* fine.

## Root cause

Five compounding causes, not one:

1. **No `projectRoot`** → wrong repo. Preventable with a pre-flight check.
2. **The Architect planned tasks too vaguely.** "Create AgentMonitor.jsx" — no design spec, no
   TypeScript requirement, no pointer to existing component patterns. The Coder had nothing to anchor
   to, so it produced the statistically-average "component-shaped" file: a stub.
3. **The Auditor only checked syntax and `require` errors.** A file that parses but does nothing is,
   to a syntax checker, a passing file. The gate measured the wrong thing.
4. **A ~20% lifetime task success rate** meant ~80% of tasks already failed — and even "passing" ones
   routinely produced minimal stubs. The 49-file run wasn't an anomaly; it was the baseline made
   visible at scale.
5. **Free models can't do this work.** `minimax-m2.5-free` / `nova-lite` are fine for routing and
   summaries and cannot generate quality UI components. The model tier was wrong for the task class.

## The fix

The prevention rule ("always set `projectRoot`") was the easy half. The real fixes were structural,
and they changed three layers:

- **The Architect now ships a spec, not a title.** A task description carries a design spec and a
  reference to existing component patterns, so the Coder anchors to the real codebase instead of
  hallucinating an average. This is the [prompting-as-a-contract](../AI-ENGINEERING/prompting.md)
  principle applied to task *planning*, not just the model call.
- **The Auditor now rejects functional emptiness, not just syntax errors.** A file under ~50 lines
  with no real logic fails the gate. This is the **stub-rejection gate** now documented in
  [AI-ENGINEERING/evaluation](../AI-ENGINEERING/evaluation.md) — and it came directly out of this
  incident. "It parses" was replaced with "it does something."
- **Model tier is matched to task class.** UI-component generation routes to a capable model, not the
  cheapest free one. Fiscal efficiency stops at the line where the output is worthless.

## The lesson

> "It ran" is not "it worked." A pipeline that can report success on empty output isn't measuring the
> thing you care about — it's measuring whether the machinery turned over.

The deeper lesson is about *where* a quality gate has to live. The instinct after this failure is to
write a better prompt. But the prompt wasn't the weak link — the **evaluation** was. The system had
no scorer that could tell a real component from a stub, so it couldn't fail the run even in principle.
Reliability didn't come from asking the model more nicely; it came from building a gate that could say
no. That's why this postmortem is cross-filed under evaluation, not prompting.

## Where it sits now

This is the failure mode the 2026 agent-eval literature calls the gap between **task completion** and
**task quality** — and it's exactly why the field moved to trajectory- and output-level scoring
(action completion, not just "did it return"). An agent that emits confident, plausible, empty work
is the default failure of code-generating systems, and the only durable defense is an eval that gates
on substance. Cheap deterministic gates (a line-count-and-logic floor) catch most of it before any
expensive judge is needed — which is the first tier of the evaluation strategy this handbook now
recommends.

---

**Reference code:** the stub-rejection gate and per-task-class model routing live in the Sovereign
SDLC engine — see [SYSTEMS/the-sovereign-sdlc-engine](../SYSTEMS/the-sovereign-sdlc-engine.md).

**Related:** [AI-ENGINEERING/evaluation](../AI-ENGINEERING/evaluation.md) (the gate this produced) ·
[AI-ENGINEERING/prompting](../AI-ENGINEERING/prompting.md) (specs over titles) ·
[WORKFLOWS/reality-driven-development](../WORKFLOWS/reality-driven-development.md) (the `projectRoot` discipline)
