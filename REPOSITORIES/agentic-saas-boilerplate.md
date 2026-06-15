# agentic-saas-boilerplate

> A billable multi-agent SaaS template - DAG scheduler, per-run SSE streaming, Stripe/Razorpay
> - the top rung of the ladder.

## Problem

"I built an agent" and "I built a product people pay for" are different problems. Billing,
streaming, multi-tenancy, and a job scheduler are where demos go to die.

## Architecture

A shippable SaaS template: a real ACE WorkflowEngine (DAG scheduler), per-run SSE event
queues, an AgentRegistry, and billing via Stripe/Razorpay. 22 tests. The destination the
[autonomy ladder](ai-systems-evolution.md) was climbing toward.

## Lessons learned

- Per-run SSE queues (not one global stream) are what make concurrent users actually work.
- Billing and the agent loop are orthogonal - keep them decoupled or both become unmaintainable.

## Demo

```bash
git clone https://github.com/shubham0086/agentic-saas-boilerplate
cd agentic-saas-boilerplate && npm install && npm test
```

## Repository

[github.com/shubham0086/agentic-saas-boilerplate](https://github.com/shubham0086/agentic-saas-boilerplate)

## Related

- Built on [agentkernel](agentkernel.md)
- Recipe: [Build an AI Consultant](../SYSTEM-RECIPES/build-an-ai-consultant.md)
