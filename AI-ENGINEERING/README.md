# AI Engineering

The repos show *what* to build. The architectures show how the pieces fit. This section is
the layer underneath both: the craft of getting reliable work out of a probabilistic model —
prompting, context, evaluation, and tool-calling.

These are **engineering notes**, not prompt-pack listicles. Each one frames a decision, points
at the real code or prompt that implements it, and is honest about where the model still wins
and where the scaffolding has to. The reference implementations are the open-source repos and
the production engines behind them (the Sovereign SDLC engine, Agency OS) — see [SYSTEMS/](../SYSTEMS/).

| Note | The question it answers | Reference code |
|------|------------------------|----------------|
| [Prompting as a contract](prompting.md) | How do you stop a prompt from being a wish and make it a spec the model can't wander off? | [agentic-sdlc coder prompt](../REPOSITORIES/agentic-systems.md) |
| [Context engineering](context-engineering.md) | What does the model see at each turn, and how do you keep the window from collapsing? | [agent-recall](../REPOSITORIES/agent-recall.md), [rag-knowledge-engine](../REPOSITORIES/rag-knowledge-engine.md) |
| [Evaluation](evaluation.md) | How do you know a change made the system better instead of just different? | [rag-knowledge-engine](../REPOSITORIES/rag-knowledge-engine.md), [agent-constitution](../REPOSITORIES/agent-constitution.md) |
| [Tool-calling](tool-calling.md) | How do you let a model act without letting it improvise control flow or escape its lane? | [mcp-agent-toolkit](../REPOSITORIES/mcp-agent-toolkit.md), [agent-routing](../REPOSITORIES/agent-routing.md) |

---

### The thread running through all four

By mid-2025 the field's centre of gravity moved from *prompt engineering* — wording a single
instruction well — to **context engineering**: owning the whole token lifecycle, from the first
system-prompt token to the last compacted summary. The reason is measurable. Spending three
weeks refining a prompt typically moves task completion a few points (85% → 88%); redesigning
the context pipeline so the model sees the right information at the right time moves it far more
(83% → 96%). Wording is the small lever. What the model can *see*, what it's *measured against*,
and what it's *allowed to do* are the large ones.

Every note here is a version of that same claim: reliability is engineered around the model
call, not inside it. A prompt is a contract. Context is a budget. Evaluation is the only thing
that tells you whether either is working. Tool-calling is where a model's mistakes stop being
text and start being actions — so it's where the determinism has to be hardest.
