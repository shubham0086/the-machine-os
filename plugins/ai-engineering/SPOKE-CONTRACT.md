# The Machine OS - MCP Spoke Contract v1.0

The single canonical SOP for building an MCP **spoke** (a tool backend) for The Machine OS.
This is to spokes what [SKILL-CONTRACT.md](./SKILL-CONTRACT.md) is to skills. It encodes the
proven template once so the next spoke is a copy, not a redesign.

Modeled on the discipline we took from HKUDS/CLI-Anything's `HARNESS.md`
(see `docs/strategy/cli-anything-okf-learnings-2026-06-24.md`, P1 items): one progressive-
disclosure source of truth, real-backend output verification, fail-loud tools, cross-runtime
registration. We steal the discipline, not the breadth.

```
Pure tool logic  ->  Thin transport wiring  ->  Verified real output  ->  Packaged + registered
```

A spoke is a curated MCP server exposing a small set of typed tools that a skill can call.
Vertical depth, not surface area. Keep the tool count low and the contract sharp.

---

## 1. Structure (the proven template)

The non-negotiable rule: **transport (the MCP SDK) is imported only at the edge.** The tool
logic is a pure module that takes a name plus args and returns a plain object or throws. This
is what makes a spoke unit-testable without spawning a transport.

### Node spoke

```
src/
  mcp_tools.js     # PURE: exports TOOLS (array) + handleTool(name, args). No SDK import.
  mcp_server.js    # THIN: imports the SDK, wires stdio, delegates every call to handleTool.
  <engine>.js      # the real backend (e.g. Graphify.js). Pure class/functions, no side effects.
```

- `mcp_tools.js` exports two things and nothing transport-related:
  - `TOOLS` is an array of `{ name, description, inputSchema, annotations? }` objects.
  - `handleTool(name, args = {})` is a `switch` on `name` that calls the engine and returns a
    plain object, or `throw new Error(...)` for unknown tools / bad input.
  - Reference implementation: `repos/02-solve/context/agent-context/src/mcp_tools.js:64`
    (the `TOOLS` export) and `:103` (`handleTool`). No SDK import appears in that file by design
    (see its header comment, `:1`).
- `mcp_server.js` is the only file that imports `@modelcontextprotocol/sdk`. It registers the
  `ListTools` handler to return `TOOLS`, registers the `CallTool` handler to call
  `handleTool(name, args)` and wrap the result, then connects a `StdioServerTransport`. It owns
  zero business logic.
- The engine (e.g. `Graphify.js`) must be side-effect-free at import (`Graphify.js:1` is just a
  class definition). Top-level side effects break dynamic import and our generator.

### Python spoke

```
src/
  <engine>.py      # PURE: a _dispatch(name, args) function + the real backend. No mcp import here.
  main.py / __main__# THIN: imports mcp ONLY inside main(); wires stdio; delegates to _dispatch.
```

- `_dispatch(name, args)` is the Python twin of `handleTool`: pure, returns a dict or raises.
- `import mcp` (or `mcp.server`) appears **only inside `main()`**, never at module top level, so the
  dispatch logic imports and tests without the transport dependency present. This mirrors the Node
  rule: transport at the edge only.

---

## 2. Tool annotations (required)

Every tool in `TOOLS` declares its safety profile so an agent can reason before it acts.

```js
{
  name: 'graph_summary',
  description: '...what it does and WHEN to call it...',
  inputSchema: { type: 'object', properties: { ... }, required: [...] },
  annotations: {
    title: 'Graph Summary',
    readOnlyHint: true,        // true = no state change. Default to true; prove otherwise.
    destructiveHint: false,    // true only if it can delete / overwrite.
    idempotentHint: true,      // same args => same effect.
    openWorldHint: false       // true if it reaches an external/unbounded system.
  }
}
```

Rules:
- Read-only by default. A tool without `readOnlyHint: true` is assumed to mutate; mark it honestly.
- Provide introspection tools (`info` / `status` / `list` / a `*_summary`) so an agent can read
  state before calling a mutating tool. `agent-context` does this with `graph_summary`
  (`mcp_tools.js:86`): a cheap one-line probe that confirms the backend is usable.
- Descriptions state **what** the tool does and **when** to call it (see the `blast_radius`
  description, `mcp_tools.js:67`). The agent picks tools from descriptions; vague descriptions
  cause wrong calls.

---

## 3. Testing - real-backend output verification, not exit-0

The CLI-Anything rule we adopted: **"it ran without errors" is not sufficient.** A test that only
asserts the call returned proves nothing.

- Assert the **shape and content** of the returned object, not merely that no error was thrown.
  For `blast_radius`, assert the dependents/dependencies and the counts against a known fixture
  repo, not just that a result came back.
- Run against the **real engine** on a small committed fixture. Do not mock the backend away; the
  backend correctness is the thing under test.
- Tests **fail loud** when the backend or fixture is missing. Never silently skip; a skipped test
  reads as a passing test and hides a broken spoke.
- Cover the error paths: unknown tool name throws, missing required arg throws, and any security
  confinement holds (e.g. `agent-context`'s `root` arg cannot escape the anchor,
  `mcp_tools.js:35`).
- A spoke ships only when its tests assert correct **output** on a real run.

---

## 4. Packaging (`.mcpb` for Claude Desktop)

- Build the `.mcpb` and `mcpb validate` it, then verify the **packed artifact** (extract it and run
  an `initialize` handshake), not just the source. Validation passing does not prove the bundle runs.
- `.mcpbignore` lesson (scar `scar-mcpbignore-strips-sdk-dist`): an **unanchored** `dist/` pattern
  matches `node_modules/.../dist/` and strips the bundled MCP SDK, shipping a broken `.mcpb`.
  **Anchor directory patterns to the bundle root**: write `/dist/`, never bare `dist/`. Same for any
  other dir name that also appears inside dependencies (`build/`, `lib/`).
- After packing, extract the artifact and confirm the SDK `dist/` is present and the server answers
  `initialize`. Treat a green `mcpb validate` plus a failed handshake as a failed build.

---

## 5. Cross-runtime registration (`mcp.json`)

A spoke is a stdio MCP server; register it the same way everywhere. Ship/document a `mcp.json`
snippet so the spoke runs outside Claude too (Cursor, Cline, Codex). The hub keeps an aggregate
example at [`mcp/mcp.json`](../../mcp/mcp.json) and a README section.

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

This is the same `mcpServers` shape the `ai-engineering-tools` plugin already uses
(`plugins/ai-engineering-tools/.claude-plugin/plugin.json`). Node spokes launch via `npx`, Python
spokes via `uvx --from git+... <entry>`. Keep `MACHINE_OS_TIER: local` for the local read-only tier.

---

## 6. Keeping docs in sync - generate, don't hand-maintain

Each spoke's `SKILL.md` tool listing is **generated from its `TOOLS` export** so the docs never
drift from the code (the CLI-Anything "Phase 6.5" lesson). Use the hub generator:

```
node tools/skillmd-from-tools.mjs <path-to-spoke>/src/mcp_tools.js > <out>/SKILL.md
```

See [`tools/skillmd-from-tools.mjs`](../../tools/skillmd-from-tools.mjs) and the demo output in
[`examples/generated/`](../../examples/generated/). Regenerate whenever `TOOLS` changes; never edit
the generated tool table by hand.

---

## 7. Checklist (a new spoke is done when)

- [ ] `mcp_tools.js` exports `TOOLS` + `handleTool` and imports no SDK (Python: `_dispatch`, `mcp`
      inside `main()` only).
- [ ] Every tool has a `when-to-call` description, an `inputSchema`, and honest `annotations`.
- [ ] At least one read-only introspection tool exists.
- [ ] Tests assert real-backend output content on a fixture, fail loud on missing backend, and
      cover unknown-tool / bad-arg / confinement paths.
- [ ] `.mcpb` builds, `mcpb validate` passes, AND the packed artifact answers `initialize`
      (`.mcpbignore` uses anchored `/dist/`).
- [ ] An `mcp.json` snippet is added to the hub aggregate and the spoke is wired into
      `ai-engineering-tools` if it backs a skill.
- [ ] `SKILL.md` tool table is regenerated from `TOOLS`, not hand-written.

---

**Cross-refs:** [SKILL-CONTRACT.md](./SKILL-CONTRACT.md) ·
`docs/strategy/cli-anything-okf-learnings-2026-06-24.md` ·
scar `scar-mcpbignore-strips-sdk-dist` ·
reference spoke `repos/02-solve/context/agent-context/src/mcp_tools.js`.
