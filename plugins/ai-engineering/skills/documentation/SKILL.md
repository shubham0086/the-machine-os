---
name: documentation
description: Write and maintain technical documentation. Trigger with "write docs for", "document this", "create a README", "write a runbook", "onboarding guide", or when the user needs help with any form of technical writing — API docs, architecture docs, or operational runbooks.
argument-hint: "<what to document>"
tier: engineering
contract: "1.0"
requires: [api-spec, system-design, code-review-report]
produces: [docs]
feeds: []
---

# /documentation

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md). This skill follows the [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md) — it appends a `machine_output` block.

Write clear, maintainable technical documentation for different audiences and purposes.

## Document Types

### README
- **What this is and why it exists:** High-level project context.
- **Quick start (< 5 minutes to first success):** Precise setup steps, dependencies, configuration details, and commands.
- **Configuration and usage:** Interactive commands, examples, and customization.
- **Contributing guide:** Rules on styling, pull requests, and standard development loops.

### API Documentation
- **Endpoint Reference:** Complete REST/GraphQL/gRPC definitions with parameter schemas, strict typing, headers, and payload structures.
- **Request/Response Examples:** Fully copy-pasteable JSON or curl snippets.
- **Authentication & Authorization:** Scopes, headers, and token mechanics.
- **Error Codes:** Exhaustive matrix of status codes, custom system-error types, and remediation paths.
- **System Constraints:** Rate limits, pagination formats, and timeouts.

### Runbook
- **Trigger Scenario:** When to use this runbook (alerts, symptoms, error signatures).
- **Prerequisites & Credentials:** Necessary access permissions, dependencies, and environment contexts.
- **Step-by-Step Procedure:** Copy-paste commands with expected outcomes at each interval.
- **Rollback & Verification:** Steps to revert changes and verify the system is stable again.
- **Escalation Path:** Who to contact if this runbook does not resolve the issue.

### Architecture Doc (ADR / High-Level Design)
- **Context & Objectives:** The problem statement and engineering goals.
- **System Architecture:** Visual C4 level container structures or dataflow mappings.
- **Strategic Trade-offs:** Detailed log of accepted trade-offs, tech debt created, or scalability parameters.
- **Integrations & Contracts:** Upstream and downstream dependencies.

### Onboarding Guide
- **Local Environment Bootstrap:** Precise dependency installation and setup instructions.
- **System Map:** Walkthrough of high-level microservices, event topics, or storage zones.
- **Task Walkthroughs:** Steps to execute the first standard task (e.g., run locally, trigger a test, deploy to staging).
- **Escalation Matrix:** Points of contact for various sub-systems.

## Principles

1. **Write for the reader** — Identify who is reading the document and structure the detail to match their technical scope.
2. **Lead with utility** — Put execution commands, troubleshooting tables, and quickstarts at the top. Avoid long introductory preambles.
3. **Show, don't tell** — Use standard syntax blocks, schemas, diagrams, and concrete execution outputs.
4. **Link, don't duplicate** — Link to source control or existing specs. Prevent fragmented, outdated duplication.
5. **Keep it current** — If code changes, documentation update steps must be part of the PR definition.

## Output Contract

This is a **process skill** — it writes docs, so it OMITS the scorecard. Append a `machine_output`
block per [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md); doc gaps go in `findings`.

```yaml
machine_output:
  skill: documentation
  version: "1.0"
  timestamp: <ISO-8601>
  status: complete
  findings:
    - id: D1
      severity: low
      category: gap
      location: README
      description: Quickstart omits the required environment variables
  recommendations:
    - id: R1
      action: Add an env-var table to the quickstart so first run succeeds
      effort: low
      addresses: [D1]
  artifacts:
    - docs
  next_actions: []
```

## If Connectors Available

If **~~source control** is connected:
- Read the code being documented so examples and signatures stay accurate
- Link to source files and specs instead of duplicating them

If **~~knowledge base** is connected:
- Check for existing docs on the topic to extend rather than fork
- Match the team's established structure, voice, and terminology

If **~~project tracker** is connected:
- Create documentation tasks for the gaps found and link them to the work that created them

## Tips

1. **Name the audience.** A README for users and a runbook for on-call need different detail.
2. **Lead with the quickstart.** Readers want first success fast, not a preamble.
3. **Tie doc updates to the PR.** Docs that update with the code do not go stale.
