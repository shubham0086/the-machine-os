# Evaluation

> "It seems better" is not a measurement. If you can't say *which metric moved and by how much*,
> you didn't improve the system — you changed it and got lucky, or didn't, and you can't tell which.

## The decision

A change to a prompt, a retrieval setting, or a model chain has no obvious sign. The output is
different; whether it's *better* is invisible without a yardstick. So every part of these systems
that produces model output is paired with something that scores it — and the scorers run at three
different costs, because evaluating everything with a frontier model is as wasteful as evaluating
nothing.

## Three kinds of scorer, by cost

**1. Cheap deterministic gates — run on every output.** The simplest eval is a rule, and the most
useful one in the SDLC engine is brutally simple: the Auditor **rejects any generated file under
~15 lines** as a stub. A model that "implements" a feature with a three-line placeholder fails the
gate and the task is re-queued with feedback. No LLM call, no latency, catches the single most
common failure mode of code-generating agents — confident emptiness. Pair it with the engine's
other binary gates (does it parse? does the route export a factory? does it contain `eval`/`exec`?)
and most garbage never reaches the next stage. These are the `audit.pass` / `audit.fail` events in
the pipeline.

**2. Reference metrics — run on a sample.** For retrieval quality, vibes don't scale, so
[rag-knowledge-engine](../REPOSITORIES/rag-knowledge-engine.md) ships RAGAS-style metrics you can
turn on per query:

```python
result = engine.ask("What does the circuit breaker do?", evaluate=True)
# result["eval"] = {
#   "faithfulness":      0.95,  # fraction of answer claims grounded in retrieved context
#   "answer_relevance":  0.88,  # semantic similarity: question ↔ answer
#   "context_precision": 0.81,  # mean rerank score of the chunks actually returned
# }
```

The three cover three distinct failure modes, which is the whole reason there are three:
faithfulness catches **hallucination** (claims the context doesn't support), answer relevance
catches **off-topic** answers, context precision catches **bad retrieval** (right answer, junk
sources). A single score would hide which one regressed. You don't run these on every production
call — you run them on a sample and on every change to the retrieval pipeline, which is where they
pay for themselves.

**3. Domain metrics — defined once, run continuously.** Generic metrics can't tell you if the
*business* outcome improved, so you build the metric that does. Agency OS's KAAL engine scores
content with **TrueScore**, a real weighted formula tuned against actual platform performance:

```
TrueScore = (Retention50 × 0.4) + (Saves × 0.3) + (Comments × 0.3)
```

The weights aren't arbitrary — they encode the hypothesis that *retention* predicts reach more than
raw likes do. The number then closes a loop: TrueScore feeds directives back into generation, so the
system tunes itself toward the metric instead of toward a human's guess about what "good" looks like.
That's the payoff of a domain metric — it's not just a report, it's a control signal.

## Evals as guardrails, not just reports

The reason to make scores cheap and structured is that a score can do more than grade — it can
*gate*. The stub-rejection rule already does this: an eval result controls whether a task advances.
The same shape generalises — a faithfulness score below threshold can refuse the answer rather than
ship a hallucination, exactly as the RAG answerer returns *"Not found in the provided documents"*
instead of inventing one. An eval that only writes to a dashboard catches problems after they ship;
an eval wired into control flow catches them before.

## Where it sits now

The 2026 consensus formalised this into a **tiered evaluation strategy** that maps almost exactly
onto the three scorers above: lightweight, sub-200ms model judges run at scale for fast
hallucination/factuality checks; full LLM-as-judge handles nuanced scoring on a 10–20% sample
rather than every call; human annotation is reserved for the 2–5% of calibration and edge cases.
Two refinements are worth tracking: **eval-as-runtime-guardrail** (pioneered by Galileo in early
2026) turns pre-production eval scores into live controls on agent actions and escalation — the same
gate-not-report idea, productised; and **multi-judge debate** (e.g. CollabEval) uses several judges
with different reasoning to break the single-judge agreeableness bias, since one model tends to
rubber-stamp output while three are likelier to surface a real flaw. For agents specifically, the
metric vocabulary settled on **tool-selection quality, action advancement, and action completion** —
trajectory-level scores, not just final-answer scores, because an agent can reach a right answer
through a wrong and expensive path. The throughline is unchanged: measure the thing, stratify by
cost, and wire the score into control flow wherever a failure is worse than a delay.

---

**Reference code:** [rag-knowledge-engine](../REPOSITORIES/rag-knowledge-engine.md) (RAGAS-style faithfulness / relevance / precision, 25 tests) · [agent-constitution](../REPOSITORIES/agent-constitution.md) (drift detection as a continuous eval).

**Related:** [Context engineering](context-engineering.md) · [SYSTEMS/agency-os](../SYSTEMS/agency-os.md) (TrueScore in the KAAL loop) · Field note: [Hybrid retrieval beats vector search](../FIELD-NOTES/rag-in-practice.md)
