# Connectors

Every skill in this plugin works **standalone**. Paste a diff, an error, or a few
notes and you get a full result with no setup at all.

When you connect tools, the same skills get **supercharged**: instead of you pasting
context, the skill pulls it. A `~~placeholder` like `~~source control` is a stand-in
for "whatever tool you have connected that does this job." It is not a literal command.
If a skill mentions one and you have nothing connected, the skill just skips that step
and runs standalone.

In Claude Code, you connect a tool by adding its **MCP server** (`/mcp`, or an entry in
`.mcp.json` / `~/.claude/settings.json`). Once a server is connected, the skills below
can call it automatically.

---

## The placeholders

| Placeholder | What it stands for | Example MCP servers |
|-------------|--------------------|---------------------|
| `~~source control` | Reading code, diffs, commits, branches, and PRs | GitHub, GitLab, Bitbucket, or a local `git` MCP server |
| `~~project tracker` | Reading and writing tickets, epics, and sprints | Jira, Linear, GitHub Issues, Asana |
| `~~knowledge base` | Searching prior docs, ADRs, runbooks, and standards | Confluence, Notion, an internal wiki, or a RAG server |
| `~~monitoring` | Pulling logs, metrics, traces, and alerts | Datadog, Grafana, Sentry, New Relic, CloudWatch |
| `~~CI/CD` | Build status, test results, and coverage reports | GitHub Actions, CircleCI, Jenkins, GitLab CI |
| `~~chat` | Posting updates and reading discussion threads | Slack, Discord, Microsoft Teams |
| `~~incident management` | Paging on-call and tracking live incidents | PagerDuty, Opsgenie, Incident.io |
| `~~code-graph` | Structural dependency graph + blast radius of a change (who depends on a file) | [agent-context](https://github.com/shubham0086/agent-context) — a Machine OS spoke (see below) |
| `~~scar-memory` | Failure memory: has this error been seen and resolved before? | [mcp-agent-toolkit](https://github.com/shubham0086/mcp-agent-toolkit) `scar_lookup` / `scar_record` — a Machine OS spoke (see below) |
| `~~blackboard` | Shared state store for multi-agent runs (write/read/list artifacts) | [mcp-agent-toolkit](https://github.com/shubham0086/mcp-agent-toolkit) `blackboard_*` (+ `cache_*` for LLM response caching) — a Machine OS spoke |

> Both spellings appear in the wild: `~~source control` and `~~source-control` mean the
> same connector. The skills use the spaced form.

---

## Which skill uses which connector

| Skill | Uses |
|-------|------|
| `/code-review` | `~~source control`, `~~project tracker`, `~~knowledge base`, `~~code-graph` |
| `/debug` | `~~monitoring`, `~~source control`, `~~project tracker`, `~~scar-memory` |
| `/architecture` | `~~knowledge base`, `~~project tracker` |
| `/system-design` | `~~knowledge base`, `~~source control`, `~~project tracker` |
| `/deploy-checklist` | `~~source control`, `~~CI/CD`, `~~monitoring` |
| `/incident-response` | `~~monitoring`, `~~incident management`, `~~chat`, `~~scar-memory` |
| `/standup` | `~~source control`, `~~project tracker`, `~~chat` |
| `/tech-debt` | `~~source control`, `~~project tracker`, `~~knowledge base`, `~~code-graph` |
| `/testing-strategy` | `~~source control`, `~~CI/CD`, `~~project tracker` |
| `/documentation` | `~~source control`, `~~knowledge base`, `~~project tracker` |
| `/agent-design` | `~~blackboard`, `~~knowledge base` |

> The v2 skills (architecture-review, api-design, database-design, performance-review,
> security-review, threat-model, requirements-analysis, task-decomposition, prompt-review,
> rag-review, hallucination-audit) reference additional placeholders inline (`~~observability`,
> `~~database`, `~~eval harness`, `~~RAG spoke`, `~~web research`). Those resolve to whatever you
> connect; only the spoke-backed ones (`~~code-graph`, `~~scar-memory`, `~~blackboard`) ship with
> a Machine OS engine today.

---

## Machine OS spokes

The Machine OS repos can themselves be connected as MCP servers, satisfying these
placeholders with your own engines. Install them together via the **`ai-engineering-tools`**
plugin, or point any MCP client at them directly with an `mcp.json` entry.

**Built and shipping:**

| Spoke | Placeholder(s) | Engine | Tools |
|-------|----------------|--------|-------|
| **code-graph** | `~~code-graph` | [agent-context](https://github.com/shubham0086/agent-context) | `blast_radius`, `graph_summary` |
| **agent-memory** | `~~scar-memory`, `~~blackboard` | [mcp-agent-toolkit](https://github.com/shubham0086/mcp-agent-toolkit) | `scar_lookup`, `scar_record`, `blackboard_write/read/list`, `cache_get/set` |

**On the roadmap:** a `~~knowledge base` spoke onto
[rag-knowledge-engine](https://github.com/shubham0086/rag-knowledge-engine) so `/architecture`,
`/system-design`, and `/rag-review` can search a real indexed corpus. Not wired up yet; the
skills work standalone until it is.

When a spoke is added, this table is where it gets documented, so a skill's connector reference
always has a clear answer to "which server is that?"
