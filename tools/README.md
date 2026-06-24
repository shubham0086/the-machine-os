# Hub tools

Small, dependency-free scripts that support the spoke build process.
See [`SPOKE-CONTRACT.md`](../plugins/ai-engineering/SPOKE-CONTRACT.md) for the methodology.

## `skillmd-from-tools.mjs`

Generates a `SKILL.md` from a spoke's `TOOLS` export so the tool docs never drift from the
code (the "generate, don't hand-maintain" rule in the spoke contract).

It dynamically imports the spoke's `src/mcp_tools.js` and reads the live `TOOLS` array, so it
documents the real export rather than parsing source text. This works because a contract-
compliant spoke imports no MCP SDK in `mcp_tools.js` and its engine has no import-time side
effects.

### Usage

```
node tools/skillmd-from-tools.mjs <path-to/src/mcp_tools.js> [--name <id>] [--description "<text>"]
```

Write to a file:

```
node tools/skillmd-from-tools.mjs ../../02-solve/context/agent-context/src/mcp_tools.js \
  --name agent-context > examples/generated/agent-context.SKILL.md
```

Flags:

- `--name` overrides the skill id (default: derived from the spoke directory above `src/`).
- `--description` overrides the frontmatter description (default: a generated one-liner).

### Output

YAML frontmatter (`name`, `description`) plus a `## Tools` section listing each tool's name,
description, parameters (from `inputSchema`), and annotations. A worked sample is checked in at
[`examples/generated/agent-context.SKILL.md`](../examples/generated/agent-context.SKILL.md),
generated read-only from the `agent-context` spoke.

Note: tool descriptions are reproduced verbatim from the spoke source, so any punctuation in
them (including em dashes) is the spoke author's, not this generator's.
