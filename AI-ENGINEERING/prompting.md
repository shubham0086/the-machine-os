# Prompting as a contract

> A prompt that *asks* for JSON gets JSON most of the time. A prompt that *can only be answered*
> in JSON gets it every time. The difference between those two sentences is the difference
> between a demo and a system.

## The decision

In a one-shot chat, a loose prompt is fine — a human reads the output and fixes it. In an
autonomous pipeline, the output of one agent is the *input* to the next, parsed by code, with no
human in the loop. The moment a model returns prose where the next stage expected a file diff,
the run is corrupted, and it corrupts silently.

So in the Sovereign SDLC engine a prompt is not a request. It's a **contract** with three parts
the model cannot route around: a fixed pre-flight, a fixed output shape, and a fixed set of
invariants. The model gets to be creative about the *content*; it gets no say over the *form*.

## The three parts of the contract

**1. A pre-flight the model must run before it's allowed to think.** The Coder prompt opens with
a mandatory checklist — read `memory/current-state.md` (what's running now), `memory/incidents/index.md`
(what broke before), `docs/ghost-bugs/index.md` (known AI mistake patterns) — *before* proposing a
single change. This is prompt-level grounding: the model isn't trusted to remember the system
state, it's forced to load it. The same idea recurs in the engine's standing rule — *"if a previous
task result is missing from SQLite, assume it never happened. DO NOT guess."*

**2. A single legal output shape.** The Coder prompt ends with one instruction that closes every
other door:

```
Respond ONLY with valid JSON:
{
  "files": [{
    "path": "relative/path/to/file",
    "diff": "---SEARCH---\n(exact original code or empty for new file)\n---REPLACE---\n(new code)"
  }],
  "explanation": "what you changed and why"
}
IMPORTANT: Search block must be EXACT. For new files, leave SEARCH empty.
```

The output isn't free text that *contains* a change; it's a structured object whose only job is to
carry one. And because models still wrap JSON in prose or fences about 1-in-20 times, the contract
is enforced in code too: every agent runs `BaseAgent.cleanJSON(raw)` before `JSON.parse` — never
`JSON.parse` on raw model output. The prompt asks for the shape; the parser guarantees it. Belt
and suspenders, because the cost of a swallowed parse error mid-pipeline is a whole wasted run.

**3. Invariants stated as bans, not suggestions.** The prompt names the specific patterns that
have bitten before and forbids them inline:

```
ROUTE FILES (src/routes/*.js) — MANDATORY PATTERN:
Route files MUST export a factory function, NOT an Express Router.
CORRECT: module.exports = function(app, blackboard, eventStore) { ... }
WRONG:   module.exports = router;   ← causes liveness check failure
```

Note the `← causes liveness check failure`. The ban carries its *reason*, because a rule with its
rationale attached survives edge cases a bare rule doesn't — the model can reason about *why* and
apply it to a case the prompt didn't enumerate. This is the same instinct as the engine's
modification policy: *"Comment, don't delete. If an old setup is being deprecated, comment it out
so it remains as a fallback reference"* — a constraint that reads as earned, not arbitrary.

## Templating, not concatenation

The prompt is a template with typed slots — `{{title}}`, `{{description}}`, `{{feedback}}`,
`{{context}}`, `{{currentFiles}}` — filled by the harness, not hand-assembled per call. That
separation matters: the *instructions* are version-controlled and reviewable as a unit, while the
*data* (current files, prior feedback) is injected fresh each turn. When a prompt regresses you
diff the template, not a string built three layers deep in application code.

## Where it sits now

The 2026 consensus has a name for this: **structured output** (provider-enforced JSON schemas,
tool-call grammars) plus **prompts-as-code** — prompts versioned, templated, and tested like any
other artifact. Frontier models now offer constrained decoding that guarantees the shape at the
API level, which makes the *parser* half of the contract cheaper but not optional; the *content*
half — pre-flight grounding, banned-pattern invariants, reasons-attached-to-rules — is still
hand-built engineering, and still where reliability comes from. The deeper shift the field
agreed on is that wording is the small lever: refining phrasing moves task completion a few
points, while fixing what the model is *grounded in* and *constrained to* moves it far more.
That's why this note is short and the [context engineering](context-engineering.md) one isn't.

---

**Reference code:** the Coder prompt and `BaseAgent.cleanJSON()` live in the Sovereign SDLC engine — see [SYSTEMS/the-sovereign-sdlc-engine](../SYSTEMS/the-sovereign-sdlc-engine.md).

**Related:** [Context engineering](context-engineering.md) · [Tool-calling](tool-calling.md) · Field note: [Why I banned probabilistic control flow](../FIELD-NOTES/banned-probabilistic-control-flow.md)
