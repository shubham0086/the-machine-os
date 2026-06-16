# Agent execution safety

> A chatbot that hallucinates wastes your time. An *agent* that hallucinates writes a file, runs a
> command, or resets your git tree. The blast radius of a mistake scales with the privileges you
> hand the loop.

This note is the threat model for an agent that **acts** — it writes code and runs git — drawn from
the real guards in the Sovereign SDLC engine. The principle throughout: the model proposes, but
deterministic code in the harness decides what is actually allowed to happen.

## 1. Ban the dangerous primitives outright

The engine's forbidden list is enforced as a hard rule, not a suggestion:

- **No `eval()` / no `exec()`** in any file — the two functions that turn "the model wrote a string"
  into "the machine ran arbitrary code." This is the single most important line.
- **No `JSON.parse()` on raw LLM output** — model JSON is malformed often enough that naive parsing is
  both a crash risk and an injection surface. All parsing goes through a `cleanJSON()` helper that
  strips fences and repairs common breakage before parsing.
- **CommonJS only, no new files in `src/core/` without a logged decision** — constraints that keep the
  agent from quietly expanding its own attack surface.

## 2. Protect the files the agent must never touch

The agent edits code, including potentially its *own* code. A `SELF_PROTECTED_FILES` guard (and a
`PROTECTED_FILE` error class) means the Coder refuses to modify guarded paths — the agent cannot edit
the very guardrails that constrain it. A `fileGuardian` and a `goalSanitizer` sit on the input side,
cleaning the goal before it ever reaches planning.

## 3. Make destructive actions injection-safe

The recovery system can perform a **hard git rollback** (`git reset --hard <tag>`) when a task is
unrecoverable. That tag often originates from agent/model-influenced state, so feeding it straight to
a shell would be a command-injection hole. The real code validates it first:

```js
const tagRegex = /^[a-zA-Z0-9_\-\.\/]+$/;
if (!tagRegex.test(task.rollbackTag)) {
  this.blackboard.log('Recovery', `Rollback tag is invalid/hazardous: ${task.rollbackTag}`, 'error');
  return;
}
// and it uses execFileSync('git', ['reset', '--hard', tag]) — argument array, never a shell string
```

Two defenses stacked: an allowlist regex on the value, and `execFileSync` with an **argument array**
instead of a shell string so there's no shell to inject into. That is the correct shape for *any*
agent action that touches a shell.

## 4. Bound the loop with cost and retries

An autonomous loop's worst non-security failure is also a kind of safety issue: burning money or
spinning forever. The engine caps a run at a hard dollar budget (`COST_CUTOFF_REACHED` throws once
the run exceeds it), caps recovery at 3 retries, caps the recovery *cost* at the run budget, and
**quarantines** a task that exhausts its retries instead of retrying it forever. A bounded loop is a
safe loop.

## 5. For MCP and external tools: gateway, not raw connection

When the agent reaches outside itself — MCP servers, third-party tools — the safe default is a
**self-hosted gateway with per-agent capability scoping**, never a raw connection to an unvetted
server. The 2025 MCP wave shipped a lot of insecure servers (multiple CVEs, including in
widely-used reference servers, plus registry-poisoning research); a gateway gives you one place to
enforce auth, scope capabilities, and log every tool call. See
[ARCHITECTURES/mcp-integration](../ARCHITECTURES/mcp-integration.md).

## Where it sits now

"Agent security" became a distinct discipline in 2026 precisely because agents crossed from
*answering* to *acting*. The OWASP LLM Top-10 covers the model-layer risks (prompt injection,
insecure output handling); this note is the *execution* layer — the part that's specific to giving a
probabilistic system real hands. The throughline: every irreversible action gets a deterministic
guard in front of it, and the model never gets to vote on whether the guard applies.

---

**Related:** [Output sanitization & secret scanning](output-sanitization-and-secret-scanning.md) · [ARCHITECTURES/mcp-integration](../ARCHITECTURES/mcp-integration.md) · [SYSTEMS/the-sovereign-sdlc-engine](../SYSTEMS/the-sovereign-sdlc-engine.md) · Field note: [Why I banned probabilistic control flow](../FIELD-NOTES/banned-probabilistic-control-flow.md)
