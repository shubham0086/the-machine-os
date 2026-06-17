# Workflows

The repos and architectures are the *what*. This section is the *how I actually work* — the daily
practice of building production AI systems with an AI coding agent (Claude Code) in the loop, without
the agent quietly corrupting state, losing context, or shipping something unpublishable.

These are operating disciplines, not tool tutorials. Each one came out of a real failure and became a
rule.

| Note | The problem it solves | Source |
|------|----------------------|--------|
| [Claude Code self-healing loop](claude-code-self-healing-loop.md) | Context dies between sessions; you re-feed it by hand | Hooks-based context system |
| [Reality-driven development](reality-driven-development.md) | The agent trusts stale docs and hallucinates the system's state | Sovereign SDLC operating rules |
| [Eval-driven development](eval-driven-development.md) | The agent reports success on output nobody verified | The 49-garbage-files collapse + the audit gates |
| [Repo publishing compliance](repo-publishing-compliance.md) | "Ship the repo" hides a dozen things that make it unsafe or unusable | Repo-compliance audit |

---

### The throughline

An AI coding agent is fast and confident and wrong often enough to matter. Every workflow here exists
to put a **deterministic guarantee** where you'd otherwise be trusting the model to remember, to be
truthful, or to be careful: hooks guarantee context survives a session boundary, reality files
guarantee the agent reads current truth instead of stale docs, and a publishing checklist guarantees
a repo is safe before it's public. The skill isn't prompting the agent better — it's building the rails
it runs on.

> Not covered here, on purpose: traditional CI/CD pipelines. The systems in this repo don't ship a real
> CI/CD setup yet, so there's no honest write-up to give — it's parked in [ROADMAP](../ROADMAP.md)
> until there is.
