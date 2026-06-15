# agent-recall

> Solution memory. When the agent has solved something before, recall the solution instead of
> paying to re-derive it.

## Problem

Stateless agents re-solve the same task every session - same tokens, same latency, same cost,
for an answer they already found last week.

## Architecture

A persistent solution store: successful task → solution, retrieved by similarity before the
agent starts from scratch. Each recalled item prepends an injection guard. 9 tests. Pairs with
[agent-scars](agent-scars.md) - recall what worked, avoid what didn't.

## Lessons learned

- Recall and scars are two halves of one memory system; shipping only one leaves value on the table.
- Similarity retrieval needs a relevance floor, or the agent "recalls" loosely-related junk.

## Demo

```bash
git clone https://github.com/shubham0086/Agent-Recall
cd Agent-Recall && node main.js
```

## Repository

[github.com/shubham0086/Agent-Recall](https://github.com/shubham0086/Agent-Recall)

## Related

- Companion: [agent-scars](agent-scars.md) (failure memory)
- Field note: [Giving AI Agents Memory](../FIELD-NOTES/agent-memory.md)
