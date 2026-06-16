# The Claude Code self-healing context loop

> Every new session, the agent starts amnesiac and you re-explain where you left off. The fix is to
> make context survive the session boundary *deterministically* — in code that runs whether or not
> any model is awake.

## The decision

There are three ways to "run something automatically" with Claude Code, and they are not
interchangeable:

| | **Hook** | **/loop** | **Scheduled agent** |
|---|---|---|---|
| Triggered by | a lifecycle event | a timer | a cron schedule (cloud) |
| What runs | a shell command *I* wrote | the *model* re-runs my prompt | the model, on a server |
| Thinks (AI)? | No — deterministic | Yes | Yes |
| Costs tokens? | No | Yes, a full turn each time | Yes |
| Best for | **guarantees** | polling while I watch | unattended recurring work |

The rule that falls out of this table: **a guarantee must never depend on a model being awake.**
"A session summary always exists" is a guarantee, so it's a hook — not a `/loop`, not a hopeful note
in the prompt.

## What's built

A two-sided loop using two of Claude Code's nine lifecycle hooks:

```
SessionEnd   → write a breadcrumb   (docs/sessions/session-YYYY-MM-DD.md)
SessionStart → read it back into context at the next session start
```

- **`SessionEnd` hook** auto-creates the dated session file and appends an end-of-session breadcrumb
  every single time — deterministic, no model call, cannot fail. A dated file *always* exists even if
  a rich summary was skipped.
- **`SessionStart` hook** surfaces the latest `session-*.md` plus the memory index into the new
  session's context automatically, so a fresh session restores where the last one ended instead of
  depending on anyone remembering to point at it.

The harness writes on exit and reads on entry; continuity never depends on the model remembering.
That is the whole trick.

## The mistakes worth avoiding

1. **Using a hook to do AI work.** Hooks run scripts, not the model — they cannot summarise a session.
2. **Auto-spawning the model from `SessionEnd`** (`claude -p "summarize…"`). That headless session also
   ends, re-fires `SessionEnd`, and you've built an infinite loop. Keep hooks deterministic.
3. **Reaching for `/loop` to poll work the harness already notifies you about** — it just burns tokens.

## Where it sits now

This is one concrete instance of the **harness** — the deterministic control plane around the model
that the [agent anatomy](../ARCHITECTURES/the-agent-anatomy.md) work calls the "fifth organ." The 2026
direction in agent tooling is exactly this: push reliability *out of the prompt and into the
runtime*. Hooks, lifecycle events, and durable state stores are how a model that forgets everything
becomes a system that doesn't.

---

**Canonical write-up (platform-agnostic):** the harness section of [agent-anatomy](../REPOSITORIES/agent-anatomy.md) (`parts/5-the-harness/`).

**Related:** [Reality-driven development](reality-driven-development.md) · [ARCHITECTURES/the-agent-anatomy](../ARCHITECTURES/the-agent-anatomy.md) · [ARCHITECTURES/agent-memory](../ARCHITECTURES/agent-memory.md)
