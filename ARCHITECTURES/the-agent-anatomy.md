# The agent anatomy

> An agent is not a model. It is a model wired to three more things — and remove any one
> and it collapses into something simpler.

## The decision

The most expensive confusion in this space is calling everything an "agent." A single LLM
call is not an agent. A prompt chain is not an agent. The line that actually matters:

`brain (LLM)` + `memory` + `hands (tools)` + `loop` = agent

- **Brain** — the model. Always on. Reasons, but forgets and cannot act on its own.
- **Memory** — carries state across turns. Without it, every turn starts from zero.
- **Hands** — tools. Let it act on the world (read a file, call an API, run code).
- **Loop** — lets it take more than one step: act, observe the result, decide again.

Take memory away and you have a stateless chatbot. Take tools away and you have a text
predictor. Take the loop away and you have a single-turn responder that freezes mid-tool-call.
Take the brain away and you have nothing.

## Why it's framed as ablations

Most explanations *describe* these failure modes. The reference repo *demonstrates* them: the
same three-turn script runs with each organ added one at a time, then with each one deliberately
removed, so you watch continuity, agency, and completion die one at a time. Watching it break is
the fastest way to internalise what each organ is for.

## Where it sits now

In 2026 the loop is the part under the most active redesign. The naive "let the model decide every
step forever" loop is exactly what production teams pull back from — see
[Why I banned probabilistic control flow](../FIELD-NOTES/banned-probabilistic-control-flow.md). The
organs are stable; how much autonomy you give the loop is the live engineering question, and the
answer in production is almost always *less than a demo uses*.

---

**Reference code:** [agent-anatomy](../REPOSITORIES/agent-anatomy.md) — four organs, toggle one off, zero setup, runs offline.

**Related:** [Agent memory](agent-memory.md) · [Multi-agent orchestration](multi-agent-orchestration.md) · Recipe: [Build an agent team](../SYSTEM-RECIPES/build-an-agent-team.md)
