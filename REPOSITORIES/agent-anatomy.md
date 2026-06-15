# agent-anatomy

> One agent dissected into four organs - brain, hands, memory, loop. Toggle one off and
> watch exactly how it breaks.

## Problem

You can wire up an agent from a tutorial without understanding which part does what. Then it
fails in production and you have no mental model for *where* it failed.

## Architecture

A single agent split into four isolated organs: the **brain** (the LLM call), the **hands**
(tools), the **memory** (state across turns), and the **loop** (control flow). Each organ
has an ablation: disable it and observe the specific failure mode it was preventing.

## Lessons learned

- Most "the agent is dumb" complaints are actually a missing-memory or broken-loop problem.
- Separating the loop from the brain is the single most important design decision - it's what
  the [banned probabilistic control flow](../FIELD-NOTES/banned-probabilistic-control-flow.md)
  argument is really about.

## Demo

Clone and run each organ's ablation to see the failure it prevents.

## Repository

[github.com/shubham0086/Agent-Anatomy](https://github.com/shubham0086/Agent-Anatomy)

## Related

- Recipe: [Build an Agent Team](../SYSTEM-RECIPES/build-an-agent-team.md)
- Memory organs in depth: [agent-scars](agent-scars.md), [agent-recall](agent-recall.md)
