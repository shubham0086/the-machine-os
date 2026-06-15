# agent-scars

> Failure memory. Everyone stores successes; the bigger win is storing failures so the agent
> stops repeating them.

## Problem

An agent solves a problem, hits the same wall next session, and burns tokens re-discovering a
failure it already met. Success-only memory misses the most expensive lesson.

## Architecture

A persistent "scar" store keyed by failure signature. Before acting, the agent checks for a
matching scar and avoids the known dead end. Each scar prepends a prompt-injection guard so
stored failures can't become an attack surface. 7 tests.

## Lessons learned

- Failure memory is reality-first: only record what actually broke, never a prediction.
- A repeat-failure guard (SCAR) prevents the classic infinite "try the broken thing again" loop.

## Demo

```bash
git clone https://github.com/shubham0086/Agent-Scars
cd Agent-Scars && node main.js
```

## Repository

[github.com/shubham0086/Agent-Scars](https://github.com/shubham0086/Agent-Scars)

## Related

- Companion: [agent-recall](agent-recall.md) (solution memory)
- Field note: [Giving AI Agents Memory](../FIELD-NOTES/agent-memory.md)
