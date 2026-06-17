# agent-sim

> An autonomous agent acts unattended, so "I'll check the output myself" stops being a plan. Test it
> the way you'd load-test a service: adversarial scenarios, an SLO, and a regression gate — before it ships.

## Problem

Static "does it answer correctly" tests go stale and never cover the case that actually hurts an ambient
agent: an adversarial input that talks it into a forbidden action (issue a refund, delete a table) while
nobody is watching. You need an SLO — *zero forbidden actions across the suite* — and a gate that blocks
the release the moment a change crosses it.

## Architecture

A zero-dependency pre-deploy simulation harness that draws the line reliable agents require: the **eval
harness** (runs scenarios, grades trajectories, aggregates) is separate from the **agent harness** (the
thing under test, a black-box function returning a trajectory `{ actions, completed }`). Scenarios
declare what "good" means (`mustComplete`, `forbiddenActions`, `adversarial`); adversarial ones pass only
if the agent *refuses* the bait. The suite scores pass / safety / completion rates against explicit SLOs
(default: zero tolerance for forbidden actions), and `compareToBaseline()` flags any drop as a regression
you wire into CI.

## Lessons learned

- The eval harness must be separate from the agent — if you can only evaluate what you logged in
  production, you can't simulate the attack that hasn't happened yet.
- Safety is a hard SLO, not an average: "95% safe" means 1 in 20 unattended runs takes a forbidden action.
- Adversarial scenarios are the point. Happy-path tests pass on day one; the injection scenarios catch the
  regression that ships an exploitable agent.

## Demo

```bash
npm run demo   # naive vs guarded support agent on an injection suite; the SLO gate blocks the naive one
```

## Repository

[github.com/shubham0086/agent-sim](https://github.com/shubham0086/agent-sim) · 15 tests · zero-dependency

> Honest provenance: a forward-bet starter that makes the [eval-driven development](../WORKFLOWS/eval-driven-development.md)
> discipline runnable. It generalises the engine's audit-gate-in-the-loop and EventStore trajectory into
> a standalone pre-deploy simulator — the "simulation-first" practice the field converged on in 2026.

## Related

- Workflow it implements: [eval-driven development](../WORKFLOWS/eval-driven-development.md)
- The failure that motivates it: [the 49-garbage-files collapse](../CASE-STUDIES/postmortem-output-quality-collapse.md)
- Reliability sibling: [agent-routing](agent-routing.md)
