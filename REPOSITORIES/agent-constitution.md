# agent-constitution

> A versioned constitution plus a drift detector that catches an agent quietly breaking its
> own rules - before your users do.

## Problem

A system prompt edited a little each week eventually stops following its own rules. Nobody
notices until a 2am production incident. Drift is silent by default.

## Architecture

Version the agent's constitution (its rules), then run a drift detector that flags when
behavior diverges from the stated rules. Born from a real production incident. 6 tests.

## Lessons learned

- Drift is a slow leak, not a crash - you need a detector, because you won't feel it happen.
- Versioning the rules makes "when did this change?" answerable instead of archaeological.

## Demo

```bash
git clone https://github.com/shubham0086/agent-constitution
cd agent-constitution && node main.js
```

## Repository

[github.com/shubham0086/agent-constitution](https://github.com/shubham0086/agent-constitution)

## Related

- Field note: [AI Agent Guardrails: Detecting Drift Before It Ships](../FIELD-NOTES/ai-agent-guardrails.md)
