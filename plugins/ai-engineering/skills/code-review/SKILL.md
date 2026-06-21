---
name: code-review
description: Review code changes for security, performance, and correctness. Trigger with a PR URL or diff, "review this before I merge", "is this code safe?", or when checking a change for N+1 queries, injection risks, missing edge cases, or error handling gaps.
argument-hint: "<PR URL, diff, or file path>"
tier: engineering
contract: "1.0"
requires: [diff, source-files]
produces: [code-review-report]
feeds: [security-review, performance-review, tech-debt, testing-strategy]
---

# /code-review

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md). This skill follows the [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md) — it appends a `machine_output` block.

Review code changes with a structured lens on security, performance, correctness, and maintainability.

## Usage

```
/code-review <PR URL or file path>
```

Review the provided code changes: @$1

If no specific file or URL is provided, ask what to review.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                      CODE REVIEW                                   │
├─────────────────────────────────────────────────────────────────┤
│  STANDALONE (always works)                                       │
│  ✓ Paste a diff, PR URL, or point to files                      │
│  ✓ Security audit (OWASP top 10, injection, auth)               │
│  ✓ Performance review (N+1, memory leaks, complexity)           │
│  ✓ Correctness (edge cases, error handling, race conditions)    │
│  ✓ Style (naming, structure, readability)                        │
│  ✓ Actionable suggestions with code examples                    │
├─────────────────────────────────────────────────────────────────┤
│  SUPERCHARGED (when you connect your tools)                      │
│  + Source control: Pull PR diff automatically                    │
│  + Project tracker: Link findings to tickets                     │
│  + Knowledge base: Check against team coding standards           │
│  + Code graph: See the blast radius of each changed file         │
└─────────────────────────────────────────────────────────────────┘
```

## Review Dimensions

### Security
- SQL injection, XSS, CSRF (especially string interpolation in queries)
- Authentication, authorization flaws, and Broken Object Level Authorization (BOLA)
- Secrets, credentials, or raw tokens in code
- Insecure deserialization, path traversal, and SSRF

### Performance
- N+1 database queries (especially within loops or ORM lazy-loading)
- Unnecessary memory allocations and hot path CPU bottlenecks
- Algorithmic complexity ($O(n^2)$ or worse in critical execution flows)
- Missing database indexes on new or heavily filtered columns
- Unbounded queries, loops, or open resource leaks (connections, file streams)

### Correctness
- Edge cases (empty arrays, null inputs, boundary values, integer overflows)
- Concurrency issues, race conditions, and lack of transaction safety
- Error handling, proper catch propagation, and silent failure suppression
- Off-by-one errors and type-safety violations

### Maintainability
- Naming clarity, cognitive complexity, and self-documenting code
- Single Responsibility Principle (SRP) and separation of concerns
- Redundant or duplicated logic
- Test coverage adequacy (checking both happy and error paths)

## Output

```markdown
## Code Review: [PR title or file]

### Summary
[1-2 sentence overview of the changes, focusing on overall quality, architectural alignment, and key patterns detected.]

### Critical Issues (Blockers)
*Note: These are high-priority issues that must be addressed before this pull request can safely merge.*

| # | File | Line | Issue Category | Description & Root Cause | Actionable Code Suggestion / Remediation |
|---|------|------|----------------|--------------------------|-----------------------------------------|
| 1 | [file] | [line] | [e.g., Security] | [Detailed description of bug/flaw] | ```[lang]
// Code fix
``` |

### Suggestions (Nitpicks & Optimizations)
*Note: Structural, performance, or stylistic suggestions to improve long-term maintainability.*

| # | File | Line | Suggestion | Category | Impact/Effort |
|---|------|------|------------|----------|---------------|
| 1 | [file] | [line] | [Description of improvement] | [e.g., Performance] | [Low/Med/High] |

### What Looks Good
- [Positive architectural choices, clean implementations, or thorough test coverage noted in the changes]

### Verdict
[APPROVE] / [REQUEST CHANGES] / [NEEDS DISCUSSION]
```

## Output Contract

This is an **assessment skill**. After the human-readable review above, append a
`machine_output` block per [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md).

**Scorecard rubric** (each 0-100): 90-100 ship-ready, 75-89 minor issues, 50-74 needs work
before merge, below 50 not mergeable.
- `security` — injection, auth, secrets, deserialization exposure
- `performance` — N+1, complexity, resource leaks, missing indexes
- `correctness` — edge cases, concurrency, error handling
- `maintainability` — naming, SRP, duplication, test coverage

```yaml
machine_output:
  skill: code-review
  version: "1.0"
  timestamp: <ISO-8601>
  status: complete
  scorecard:
    security: 88
    performance: 91
    correctness: 84
    maintainability: 79
  findings:
    - id: F1
      severity: critical
      category: security
      location: api/users.js:42
      description: SQL built via string interpolation on req.query.id
  recommendations:
    - id: R1
      action: Use a parameterized query for the id lookup
      effort: low
      addresses: [F1]
  artifacts:
    - code-review-report
  next_actions:
    - skill: security-review
      reason: Confirm the injection fix and sweep for sibling patterns
    - skill: testing-strategy
      reason: No regression test covers the malformed-id path
```

## If Connectors Available

If **~~source control** is connected:
- Pull the PR diff automatically from the URL
- Check CI status and test results

If **~~project tracker** is connected:
- Link findings to related tickets
- Verify the PR addresses the stated requirements

If **~~knowledge base** is connected:
- Check changes against team coding standards and style guides

If **~~code-graph** is connected (e.g. the [agent-context](https://github.com/shubham0086/agent-context) spoke):
- For each changed file, call it to get the blast radius — the files that depend on it
- Flag changes to high-dependent files and list the call sites that must be re-checked
- Catch breaking changes the diff alone cannot show (a signature change in a file 12 others import)

## Tips

1. **Provide context** — "This is a hot path" or "This handles PII" helps me focus.
2. **Specify concerns** — "Focus on security" narrows the review.
3. **Include tests** — I'll check test coverage and quality too.