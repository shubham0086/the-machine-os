# agentkernel

> Six production engines - the infrastructure layer under an agent system - in both Python and
> JavaScript.

## Problem

Every serious agent system re-implements the same plumbing: scheduling, guardrails, memory,
routing. Most do it badly, under deadline, once per project.

## Architecture

6 production engines (including a DAG scheduler and input/output guardrails tested against
real prompt-injection and secret-leakage payloads), shipped in parallel Python and JavaScript
implementations. The "AgentKernel" - production patterns extracted into reusable engines.

## Lessons learned

- Guardrails must be tested against *real* attack payloads, not hypothetical ones.
- A parallel Python + JS implementation forces the design to be language-agnostic and honest.

## Demo

Clone and run the engine test suites in either language.

## Repository

[github.com/shubham0086/agentkernel](https://github.com/shubham0086/agentkernel)

## Related

- Built on patterns from [agentic-patterns](agentic-patterns.md)
- Powers [agentic-saas-boilerplate](agentic-saas-boilerplate.md)
