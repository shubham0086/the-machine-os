# mcp-agent-toolkit

> An MCP server that exposes the agent's shared state - blackboard, failure memory, and cache -
> over the Model Context Protocol.

## Problem

Most MCP examples are forty-line toy scripts. The moment tools need to share state across an
agent team, you need a real protocol surface, not ad-hoc function calls.

## Architecture

An MCP server exposing three tools: a **blackboard** (shared agent state), **scars** (failure
memory), and a **cache**. Built on `node:sqlite`, stdio transport. 13 tests. This is the
"blueprint" referenced in the production-MCP essay - honest about what it does and doesn't do.

## Lessons learned

- A toy MCP server and a production one differ by tenant isolation, rate limiting, structured
  logging, and per-tool error boundaries - not by the happy path.
- Exposing shared state over a standard protocol is what lets independent tools cooperate.

## Demo

```bash
git clone https://github.com/shubham0086/mcp-agent-toolkit
cd mcp-agent-toolkit && npm install && npm test
```

## Repository

[github.com/shubham0086/mcp-agent-toolkit](https://github.com/shubham0086/mcp-agent-toolkit)

## Related

- Recipe: [Build an MCP Server](../SYSTEM-RECIPES/build-an-mcp-server.md)
- Field note: [Stop Building Toy MCP Servers](../FIELD-NOTES/production-mcp-server-blueprint.md)
