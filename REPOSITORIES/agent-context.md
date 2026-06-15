# agent-context

> A dependency graph + blast-radius scoring so you feed the model the 200 tokens that matter,
> not 8,000 of noise.

## Problem

The naive fix for "the agent lacks context" is to stuff more code into the prompt. That blows
the token budget, raises cost, and *lowers* answer quality by burying the signal.

## Architecture

Build a dependency graph of the codebase, score the **blast radius** of a change (what it can
break), and inject only the relevant slice. Context engineering as a retrieval problem, not a
dump-everything problem. 6 tests.

## Lessons learned

- More context is not better context. Relevance beats volume on both cost and accuracy.
- Blast radius is the right ranking signal for code tasks - it maps to what actually matters.

## Demo

```bash
git clone https://github.com/shubham0086/Agent-Context
cd Agent-Context && node main.js
```

## Repository

[github.com/shubham0086/Agent-Context](https://github.com/shubham0086/Agent-Context)

## Related

- Field note: [Context Engineering in 2026](../FIELD-NOTES/context-engineering.md)
- Field note: [The Token-Mix Fallacy](../FIELD-NOTES/token-mix-fallacy.md)
