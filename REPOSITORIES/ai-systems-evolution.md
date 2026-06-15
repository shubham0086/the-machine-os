# ai-systems-evolution

> The same task solved at six levels of autonomy, so you can *feel* the difference between
> a workflow, an agent, and a multi-agent system instead of arguing about definitions.

## Problem

"Agent" is the most overloaded word in the field. People ship a `while` loop and call it an
agent; people call a single LLM call an agent. You can't reason about reliability if you
can't even agree on what you built.

## Architecture

One task, six folders, increasing autonomy: plain code → single LLM call → workflow → agent
→ agent-with-memory (a bridge rung) → agentic team → swarm. Each runs in about a minute with
no setup. The ladder makes the trade-offs visceral: more autonomy buys flexibility and costs
determinism.

## Lessons learned

- Most "agentic" production work belongs on rungs 2–3 (workflow/agent), not 5 (swarm).
- Autonomy is a dial, not a destination. Pick the lowest rung that solves the problem.

## Demo

```bash
git clone https://github.com/shubham0086/AI-systems-evolution
cd AI-systems-evolution && node 00-plain-code/main.js   # then 01, 02, 03, 03.5, 04, 05
```

## Repository

[github.com/shubham0086/AI-systems-evolution](https://github.com/shubham0086/AI-systems-evolution)

## Related

- Field note: [Why I Banned Probabilistic Control Flow](../FIELD-NOTES/banned-probabilistic-control-flow.md)
- Next repo: [agent-anatomy](agent-anatomy.md)
