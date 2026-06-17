# Eval-driven development

> The day a pipeline reported success on 49 unusable files was the day "I'll check the output myself"
> stopped being a workflow. If a human has to read every result to know whether the system worked, you
> don't have a system — you have a very expensive intern who never sleeps and lies confidently.

The discipline that came out of that failure: **write the thing that decides "good" before, or
alongside, the thing that produces it — and wire it into the loop so a bad result can't advance.**
Reality-driven development ([its own note](reality-driven-development.md)) keeps the agent honest about
*state*. Eval-driven development keeps it honest about *quality*. Four rules, each earned.

## 1. The gate ships with the feature, not after it

Every stage that produces model output is paired with something that scores it, written at the same
time. Coder produces a file → the Auditor gate decides if it's real. Retrieval changes → RAGAS metrics
say whether relevance moved. The gate is not a "we'll add tests later" afterthought; it's the half of
the feature that lets you trust the other half. The [evaluation note](../AI-ENGINEERING/evaluation.md)
covers the three tiers of scorer; this rule is about *when* you write them — first, not last.

## 2. Gate on substance, not on "it ran"

The 49-files collapse passed because the Auditor only checked syntax. A file that parses and does
nothing is, to a syntax checker, fine. So the gate was changed to reject functional emptiness — a file
under ~50 lines with no real logic fails. The rule generalises: **an eval must measure the property you
actually care about, not the nearest property that's easy to check.** "It parses," "it returned a
200," "it produced JSON" are proxies, and an agent will satisfy the proxy while missing the point every
time you let it.

## 3. The eval is a guard, not a dashboard

A score that only gets logged catches problems after they ship. A score wired into control flow catches
them before. The stub-rejection eval *blocks task advancement*; the RAG faithfulness check *refuses the
answer* and returns "Not found in the provided documents" rather than shipping a hallucination. This is
the difference between observability and a guardrail — both matter, but only one stops the bad output
from leaving the building. Decide, per eval, whether a failure is worse than a delay; if it is, the eval
gates.

## 4. Keep the eval harness separate from the agent harness

The runtime that orchestrates agents, manages memory, and produces output is one system. The thing that
runs tasks at scale, captures the execution trace, grades it, and aggregates results is a *different*
system. Conflating them means you can only evaluate what you happened to log in production. Kept
separate, the eval harness can replay a trace, run a regression suite on every change, and drive the
agent through *simulated* scenarios it never saw live. The runnable version of exactly this is
[agent-sim](../REPOSITORIES/agent-sim.md): a black-box `agentFn` (the agent harness) driven through
adversarial scenarios by a separate scorer (the eval harness), gated on SLOs and regression. The
engine's EventStore (every side effect emits a structured, typed event) is what makes this possible:
the trace is the substrate both the recovery supervisor and the eval harness read from.

## Where it sits now

"Eval-driven development" / "eval engineering" became a named discipline in 2026 — the agent-engineering
community's version of test-driven development, and increasingly framed as the missing piece of agentic
*governance*, not just quality. Two parts of the consensus are worth adopting deliberately. First,
**simulation over static datasets**: fixed test sets go stale, so the leading practice is generating
dynamic, adversarial, edge-case interactions across many personas *before* production — exactly where
this engine's eval story is thinnest today and worth investing next. Second, **standardised tracing**:
OpenTelemetry's GenAI semantic conventions (agent / workflow / tool / model spans, token and latency
metrics) are stabilising into the default observability layer, with the honest caveat that the standard
covers *what happened* and explicitly **not** output quality or safety scoring — which is precisely the
layer the evals above sit on top of. The reliability bottleneck the whole field reports — quality, not
capability — is the one eval-driven development is built to attack.

---

**Reference code:** the audit gates, stub-rejection, and EventStore trace live in the Sovereign SDLC
engine — see [SYSTEMS/the-sovereign-sdlc-engine](../SYSTEMS/the-sovereign-sdlc-engine.md).

**Related:** [AI-ENGINEERING/evaluation](../AI-ENGINEERING/evaluation.md) (the scorers) ·
[CASE-STUDIES/the 49-garbage-files collapse](../CASE-STUDIES/postmortem-output-quality-collapse.md) (the failure that produced this) ·
[Reality-driven development](reality-driven-development.md) (its sibling discipline)
