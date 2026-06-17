# Tool-calling

> When a model returns text and it's wrong, you get a bad sentence. When a model returns a
> tool call and it's wrong, you get a deleted branch, a leaked secret, or a $40 API bill. Tool-calling
> is the point where a model's mistakes stop being words and start being actions — so it's the point
> where the determinism has to be hardest.

## The decision

A model that can *only* talk is safe and useless. A model that can *act* is useful and dangerous.
The engineering problem is to grant exactly the second without inheriting the danger — and the
answer, consistently, is that the model proposes and deterministic code disposes. The model picks
*what* to do; the harness decides *whether*, *how*, and *with what privileges* it actually happens.
Four guards make that real.

## 1. The loop is code, not a model decision

The most important rule first, because it's the one most tutorials get wrong: **the control loop
is deterministic.** What runs next, whether to retry, whether the task is done — these are decided
by the harness, not by asking the model "what should we do next?". A model deciding its own control
flow is how you get infinite loops, skipped validation, and an agent that declares victory on a
half-finished task. The SDLC pipeline is a fixed DAG —
`Goal → Researcher → Perceptor → Architect → [Coder ↔ Auditor]×3 → Documenter → autoCommit` — and the
`×3` is a hard cap in code, not a "keep going until it feels done." The model fills in the *content*
of each step; it never decides the *sequence*. The full argument is its own field note:
[Why I banned probabilistic control flow](../FIELD-NOTES/banned-probabilistic-control-flow.md).

## 2. Routing is a declared capability, not a free choice

The model doesn't pick its own provider or tool surface. In the engine, every call passes a
`taskClass` — `code`, `ui`, `simple` — and the *router* maps that class to an ordered model chain.
The model says "this is a code task"; the system decides which provider serves it, in what fallback
order, and trips a circuit breaker on any that fail. Tool access is scoped the same way: a role gets
a declared allowlist of tools and is structurally unable to reach the rest — a Researcher reads and
searches but cannot write files; a Coder writes within the project root but cannot touch `index.js`.
Capability scoping by role is the difference between "the agent can use tools" and "this agent can
use *these* tools, and no prompt injection can grant it more." The threat model behind per-agent
scoping is in [SECURITY/mcp-gateway-security-isolation](../SECURITY/mcp-gateway-security-isolation.md).

## 3. Tool output is validated before it's trusted

A tool call returns a string, and a string from a model is not yet data. Every agent runs
`BaseAgent.cleanJSON(raw)` before `JSON.parse` — never the raw parse — because models wrap structured
output in prose or fences often enough that the unguarded path fails in production, silently, mid-run.
The same posture extends to *what* the call is allowed to contain: file paths are run through
`path.resolve()` and verified to start with the project root before any guard check (never a raw
string scan for `..`), and generated code containing `eval()` / `exec()` / `child_process.exec()` is
rejected by the Auditor. The tool boundary is treated as untrusted input, because that's what it is.

## 4. Every action leaves a trace

A tool call you can't see is a tool call you can't debug or roll back. Every side effect emits a
structured EventStore event — `file.write`, `audit.pass`, `task.fail` — with a typed payload, not a
prose message string. That trace is what lets the recovery supervisor reconstruct what an agent did,
attribute a failure to a specific call, and (for git operations) roll back by tag with an
argument-array `execFileSync('git', ['reset', '--hard', tag])` rather than a shell string — closing
the injection door that a templated shell command would leave open. Observability isn't a nice-to-
have on the tool layer; it's how you make autonomous action reversible.

## Where it sits now

The 2026 stack converged on most of this. **MCP (Model Context Protocol)** became the standard way to
give tools a shared interface instead of bespoke glue — see [mcp-agent-toolkit](../REPOSITORIES/mcp-agent-toolkit.md)
and [ARCHITECTURES/mcp-integration](../ARCHITECTURES/mcp-integration.md) — and with it came a wave of
real CVEs (tool poisoning, rug-pulls, confused-deputy token theft), which is exactly why capability
scoping and a gateway are now treated as mandatory rather than optional. On the evaluation side, the
agent-specific metric the field settled on is **tool-selection quality** — measured by harnesses like
MCP-Bench — because the failure mode of an acting agent isn't usually a bad final answer, it's a
right answer reached through wrong, expensive, or unsafe tool calls. The frontier-model providers now
enforce tool-call schemas at the API level, which makes guard #3 cheaper but not removable: constrained
decoding guarantees the *shape* of a call, never its *safety*. The model proposing and deterministic
code disposing remains the whole design.

---

**Reference code:** [mcp-agent-toolkit](../REPOSITORIES/mcp-agent-toolkit.md) (MCP server: blackboard, scars, cache — 13 tests) · [agent-routing](../REPOSITORIES/agent-routing.md) (taskClass → ordered chain + circuit breaker).

**Related:** [Prompting as a contract](prompting.md) · [SECURITY/agent-execution-safety](../SECURITY/agent-execution-safety.md) · Field note: [Why I banned probabilistic control flow](../FIELD-NOTES/banned-probabilistic-control-flow.md) · [Stop building toy MCP servers](../FIELD-NOTES/production-mcp-server-blueprint.md)
