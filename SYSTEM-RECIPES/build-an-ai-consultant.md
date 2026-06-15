# Recipe: Build an AI Consultant

A billable AI product - an agent service people pay for - with the plumbing that demos always
skip: billing, streaming, multi-tenancy, and a job scheduler.

## The shape

1. **Start from the boilerplate.** A real WorkflowEngine (DAG scheduler), an AgentRegistry,
   and per-run SSE event queues so concurrent users actually work.
2. **Wire billing** (Stripe/Razorpay) decoupled from the agent loop.
3. **Add the reliability layer:** multi-provider failover, circuit breakers, guardrails.
4. **Ground it in real knowledge** with a hybrid RAG engine over your domain content.

## Why each step

"I built an agent" and "I built a product" are different problems. Per-run streaming and
decoupled billing are where most agent demos fail to become businesses.

## Clone and run

- **Source repos:** [agentic-saas-boilerplate](../REPOSITORIES/agentic-saas-boilerplate.md) (22 tests, billable) · [agentkernel](../REPOSITORIES/agentkernel.md) · [agent-routing](../REPOSITORIES/agent-routing.md) · [rag-knowledge-engine](../REPOSITORIES/rag-knowledge-engine.md)
- **Field note:** [The Vibe Coding Hangover](../FIELD-NOTES/vibe-coding-hangover.md)
- **Playbook:** consultant engagement + AI SaaS GTM (queued - see [ROADMAP](../ROADMAP.md))
