---
name: agent-context
description: MCP spoke "agent-context" exposing 3 tools: blast_radius, graph_summary, context_info. Generated from TOOLS.
---
# agent-context

> Generated from the spoke `TOOLS` export by `tools/skillmd-from-tools.mjs`.
> Do not edit the Tools section by hand; regenerate when `TOOLS` changes.
> Source: `../../02-solve/context/agent-context/src/mcp_tools.js`

This spoke exposes 3 tools: blast_radius, graph_summary, context_info.

## Tools

### `blast_radius`

Given a repo-relative file path, return its blast radius: the files that depend on it (dependents — these can break if it changes) and the files it depends on (dependencies). Call this before approving a change to see what it actually affects beyond the diff.

**Parameters:**

  - `file` (string, required): Repo-relative path of the file to analyze, e.g. "src/db.js".
  - `root` (string, optional): Optional repo root to analyze. Defaults to the current workspace; cannot escape it.

**Annotations:** `readOnlyHint: true`, `destructiveHint: false`, `idempotentHint: true`, `openWorldHint: false`

### `graph_summary`

Return a one-line structural summary of the repo dependency graph (file count, edge count). Use to confirm the codebase is analyzable before relying on blast_radius.

**Parameters:**

  - `root` (string, optional): Optional repo root. Defaults to the current workspace; cannot escape it.

**Annotations:** `readOnlyHint: true`, `destructiveHint: false`, `idempotentHint: true`, `openWorldHint: false`

### `context_info`

Return this spoke's identity: server name, version, and the list of available tool names. Read-only introspection with no side effects; use it to confirm what the server exposes.

**Parameters:**

_No parameters._

**Annotations:** `readOnlyHint: true`, `destructiveHint: false`, `idempotentHint: true`, `openWorldHint: false`

