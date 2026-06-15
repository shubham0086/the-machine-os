# Recipe: Build an MCP Server

A Model Context Protocol server that exposes shared agent state - and survives contact with a
real data layer, not just a demo.

## The shape

1. **Define your tools** as a protocol surface (blackboard, memory, cache).
2. **Pick transport(s)** - stdio for local, HTTP for remote; ideally both.
3. **Add the production layer:** tenant isolation, token-bucket rate limiting, per-tool error
   boundaries, structured logging.
4. **Persist** with something real (`node:sqlite`), not an in-memory map.

## Why each step

The gap between a toy MCP server and a production one is entirely in step 3. The happy path is
forty lines; the isolation, limiting, and error boundaries are the actual work.

## Clone and run

- **Source repo:** [mcp-agent-toolkit](../REPOSITORIES/mcp-agent-toolkit.md) (13 tests: blackboard, scars, cache)
- **Field note:** [Stop Building Toy MCP Servers](../FIELD-NOTES/production-mcp-server-blueprint.md)
- **Architecture:** MCP patterns (v2 `ARCHITECTURES/`)
- **Playbook:** enterprise integration + security review (queued - see [ROADMAP](../ROADMAP.md))
