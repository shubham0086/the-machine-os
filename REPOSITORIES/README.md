# Repositories

Every repo below was pulled out of a system that actually shipped, then reduced to the
smallest thing you can clone and run in a minute. Each card follows the same shape:
**Problem → Architecture → Lessons learned → Demo → Repository → Related**.

This turns a pile of repos into a navigable knowledge base: start from the problem you
have, not the repo name you happened to find.

## Understand what an agent is

| Repo | One line |
|------|----------|
| [ai-systems-evolution](ai-systems-evolution.md) | The same task at six levels of autonomy, plain code → swarm |
| [agent-anatomy](agent-anatomy.md) | One agent dissected into four organs; toggle one off, watch it break |

## Solve one hard problem (each extracted from production)

| Repo | Problem it isolates | Tests |
|------|--------------------|-------|
| [agent-scars](agent-scars.md) | Agents repeat past failures | 7 |
| [agent-recall](agent-recall.md) | Agents forget past solutions | 9 |
| [agent-context](agent-context.md) | Token waste re-reading code | 6 |
| [agent-routing](agent-routing.md) | A single LLM provider goes down | 23 |
| [agent-constitution](agent-constitution.md) | Agents drift from their own rules | 6 |
| [rag-knowledge-engine](rag-knowledge-engine.md) | RAG returns junk | 25 |
| [mcp-agent-toolkit](mcp-agent-toolkit.md) | Tools have no shared protocol | 13 |
| [research-agent](research-agent.md) | Research a topic end to end | 9 |
| [content-analyzer](content-analyzer.md) | Turn a URL into structured data | 4 |
| [video-engine-starter](video-engine-starter.md) | Turn a brief into a video | demo |

## Build and ship a whole system

| Repo | What you get |
|------|--------------|
| [agentic-patterns](agentic-patterns.md) | 7 architecture patterns, runnable Node + Python |
| [agentic-systems](agentic-systems.md) | 5 complete, standalone agent systems |
| [agentkernel](agentkernel.md) | 6 production engines, Python and JavaScript |
| [agentic-saas-boilerplate](agentic-saas-boilerplate.md) | A billable multi-agent SaaS template |
