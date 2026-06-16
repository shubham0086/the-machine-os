# Reality-driven development

> An AI coding agent's most dangerous habit is confident invention: it reads a stale doc, assumes a
> system state that isn't true, and builds on the fiction. The fix is to give it a *source of truth*
> that is not the documentation and not its own chat history.

This is the operating discipline behind the Sovereign SDLC engine — the rules that let an autonomous
agent modify a real codebase for hours without drifting into hallucinated state. They generalise to
any serious work with Claude Code (or Cursor, or any coding agent).

## 1. Reality files outrank documentation

The engine keeps a `memory/reality/*.yaml` set — `pipeline.yaml`, `agents.yaml`, `llm-providers.yaml`
— that record what is *actually true right now*: which models are wired, what the pipeline shape is,
what's running. The standing rule:

> **If docs and code conflict, trust `memory/reality/*.yaml` and the actual code over stale
> documentation.**

Documentation rots. A README written three weeks ago describes a system that no longer exists. By
designating a small set of machine-readable "reality" files as authoritative — and reading them
*before* any architectural change — the agent plans against the system as it is, not as it was
documented to be. Even the cost enforcer loads its pricing from a reality file
(`memory/reality/llm-providers.yaml`) rather than a hardcoded table.

## 2. Durable truth lives in a store, not in chat history

> **All operational state lives in SQLite and the blackboard, not in your chat history.**

Chat context is lossy and gets compacted. State that matters — completed tasks, solutions, failures —
goes to SQLite. The memory-routing policy is blunt about the consequence: *"If a previous task result
is missing from SQLite, assume it never happened. DO NOT guess."* The hallucination guard is a storage
rule: no record, no claim.

## 3. Context hygiene: never load the whole repo

> **Never load the full repo. Use the structural code graph for navigation.**

Loading an entire codebase into context is how you waste tokens *and* drown the signal. The engine
uses a dependency graph (Graphify) to navigate structurally — pulling only the blast radius of a
change — instead of pattern-matching over the whole tree. This is [context engineering](../FIELD-NOTES/context-engineering.md)
as a daily rule, not a buzzword.

## 4. Improvise and merge — comment, don't delete

The modification policy exists because of real past damage:

> **Never blindly overwrite or delete existing configs, code, or docs to implement a new
> optimization. Merge with the existing reality. If something is deprecated, comment it out so it
> survives as a fallback reference. Review the file completely before writing.**

An agent's instinct is to rewrite a file wholesale to satisfy the immediate goal, destroying
undocumented context in the process. The rule forces additive, surgical change — the same instinct a
careful senior engineer has, encoded so the agent can't skip it.

## 5. Anti-drift, learned the hard way

The discipline isn't theoretical. A real SCAR in the engine's own history: a goal mentioning a
particular subsystem was run against the wrong project root, and the agent generated **49 files in the
wrong repository — two days of wasted work.** The fix became a permanent rule (verify the project root
and the expected directory *exist* before planning), and the incident was logged as a scar so the same
mistake injects a warning next time. That is reality-driven development closing its own loop: a
failure becomes a check, a check becomes durable memory.

## Where it sits now

This is "context engineering" and "agents as software" stated as concrete practice. The 2026 lesson
across the industry is the same one these rules encode: the bottleneck in agentic coding is not the
model's intelligence, it's whether the model is operating on *true, current, well-scoped context*.
Reality files, a durable state store, structural navigation, and additive edits are how you guarantee
it is.

## The reusable version

These rules — plus the agent contract, recovery supervisor, cost enforcer, and security contract —
are packaged as a copy-paste, platform-agnostic template you can drop onto any stack:
**[the production multi-agent template](https://github.com/shubham0086/Agent-Anatomy/blob/main/parts/5-the-harness/production-multi-agent-template.md)**.
It opens with *why* raw LLMs drift and forget, and how an IDE-integrated coding agent's harness fixes
it — the teaching version of everything above.

---

**Related:** [Claude Code self-healing loop](claude-code-self-healing-loop.md) · [ARCHITECTURES/agent-memory](../ARCHITECTURES/agent-memory.md) · [SYSTEMS/the-sovereign-sdlc-engine](../SYSTEMS/the-sovereign-sdlc-engine.md) · Field note: [Context engineering](../FIELD-NOTES/context-engineering.md)
