# Cross-runtime MCP registration

The Machine OS spokes are stdio MCP servers. They register the same way in any MCP-capable
runtime. Copy the entries you want from [`mcp.json`](./mcp.json) into your runtime's config.

The shape is identical to the `mcpServers` block in
[`../plugins/ai-engineering-tools/.claude-plugin/plugin.json`](../plugins/ai-engineering-tools/.claude-plugin/plugin.json).
Node spokes launch via `npx`; Python spokes via `uvx --from git+... <entry>`. Keep
`MACHINE_OS_TIER: local` for the local, read-only tier.

## Cursor

Add to `.cursor/mcp.json` in your project (or the global `~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "code-graph": {
      "command": "npx",
      "args": ["-y", "github:shubham0086/agent-context"],
      "env": { "MACHINE_OS_TIER": "local" }
    }
  }
}
```

## Cline (VS Code)

Add to Cline's `cline_mcp_settings.json` (Cline panel: MCP Servers, Configure). Same shape:

```json
{
  "mcpServers": {
    "agent-memory": {
      "command": "npx",
      "args": ["-y", "github:shubham0086/mcp-agent-toolkit"],
      "env": { "MACHINE_OS_TIER": "local" }
    }
  }
}
```

## Codex

Add to your Codex MCP config (`~/.codex/config` `mcp_servers`, or the equivalent `mcp.json`):

```json
{
  "mcpServers": {
    "agent-extractor": {
      "command": "uvx",
      "args": ["--from", "git+https://github.com/shubham0086/agent-extractor", "agent-extractor"],
      "env": { "MACHINE_OS_TIER": "local" }
    }
  }
}
```

## Claude

Already wired through the `ai-engineering-tools` plugin (`/plugin install`). The plugin's
`mcpServers` block is the canonical copy; this folder mirrors it for non-Claude runtimes.

## Verifying a spoke launches

A registered spoke should answer the MCP `initialize` handshake on stdio. If it does not,
re-check packaging (see `SPOKE-CONTRACT.md` section 4, especially the anchored `/dist/`
`.mcpbignore` rule) before assuming the runtime config is wrong.
