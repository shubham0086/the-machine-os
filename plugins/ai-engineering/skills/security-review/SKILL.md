---
name: security-review
description: Audit code, an API, or a design for security vulnerabilities. Trigger with "security review", "is this secure?", "check for vulnerabilities", "audit this for OWASP", or when assessing injection, auth, secrets, access control, and data exposure before shipping.
argument-hint: "<code, API spec, or design to audit>"
tier: security-ops
contract: "1.0"
requires: [source-files, api-spec, data-model]
produces: [security-report]
feeds: [tech-debt, deploy-checklist, task-decomposition]
---

# /security-review

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md). This skill follows the [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md) — it appends a `machine_output` block.

Audit a change, an API, or a design for the vulnerability classes that actually cause breaches,
and rank them by exploitability. Where code-review touches security in passing, this is the
dedicated pass. `produces` a `security-report` that deploy-checklist and tech-debt consume.

## Usage

```
/security-review <code, API spec, or design>
```

Audit: @$1

If given a whole system, ask what data it handles (PII? payments? credentials?) and what the trust
boundaries are, so the audit weights the real attack surface.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY REVIEW                               │
├─────────────────────────────────────────────────────────────────┤
│  STANDALONE (always works)                                       │
│  ✓ Injection (SQL, command, template, XSS)                      │
│  ✓ AuthN / AuthZ and broken access control (BOLA/IDOR)          │
│  ✓ Secrets, tokens, and credential handling                     │
│  ✓ Sensitive data exposure + insecure deserialization          │
│  ✓ Exploitability-ranked, with remediation                     │
├─────────────────────────────────────────────────────────────────┤
│  SUPERCHARGED (when you connect your tools)                      │
│  + Source control: pull the PR diff and changed surface          │
│  + Code graph: trace tainted input to its sinks                  │
│  + Knowledge base: enforce your security baseline                │
└─────────────────────────────────────────────────────────────────┘
```

## Review Dimensions

### Injection & Input Handling
- SQL/NoSQL injection, command injection, template injection, XSS, SSRF
- Untrusted input reaching a sensitive sink without validation or parameterization

### Access Control
- Broken Object Level Authorization (IDOR): can user A read user B's resource?
- Missing function-level authorization and privilege escalation paths
- Auth checks enforced server-side, not just hidden in the UI

### Secrets & Data
- Hardcoded secrets, tokens, or keys in code or config
- PII/credentials stored or logged in plaintext
- Encryption in transit and at rest where the data class requires it

### Dependencies & Config
- Known-vulnerable dependencies and outdated crypto
- Insecure defaults, verbose error leakage, missing security headers

## Output

```markdown
## Security Review: [target]

### Summary
[Overall posture + the single most exploitable finding.]

### Findings (exploitability-ranked)
| # | Severity | Class | Location | Exploit scenario | Remediation |
|---|----------|-------|----------|------------------|-------------|
| 1 | Critical | Injection | [file:line] | [how it's abused] | [fix] |

### Scorecard
| Dimension | Score | Note |
|-----------|-------|------|
| Injection | /100 | |
| Access control | /100 | |
| Secrets & data | /100 | |
| Dependencies & config | /100 | |

### Verdict
[SAFE TO SHIP] / [FIX BEFORE SHIP] / [DO NOT SHIP]
```

## Output Contract

This is an **assessment skill**. Append a `machine_output` block per
[SKILL-CONTRACT.md](../../SKILL-CONTRACT.md).

**Scorecard rubric** (each 0-100): 90-100 no material risk, 75-89 low-severity only, 50-74
exploitable issues present, below 50 critical exposure. A single critical finding caps the verdict
at DO NOT SHIP regardless of the average.

```yaml
machine_output:
  skill: security-review
  version: "1.0"
  timestamp: <ISO-8601>
  status: complete
  scorecard:
    injection: 60
    access_control: 72
    secrets_data: 90
    dependencies_config: 84
  findings:
    - id: F1
      severity: critical
      category: injection
      location: api/search.js:31
      description: Raw req.query.q interpolated into a SQL LIKE clause
    - id: F2
      severity: high
      category: access_control
      location: api/orders/[id].js:18
      description: Order fetched by id with no ownership check (IDOR)
  recommendations:
    - id: R1
      action: Parameterize the search query and validate the input length
      effort: low
      addresses: [F1]
    - id: R2
      action: Enforce that the order's owner matches the authenticated user
      effort: medium
      addresses: [F2]
  artifacts:
    - security-report
  next_actions:
    - skill: deploy-checklist
      reason: Block the release until F1 and F2 are verified fixed
    - skill: threat-model
      reason: The IDOR suggests the access-control model needs a system pass
```

## If Connectors Available

If **~~source control** is connected:
- Pull the PR diff and scope the audit to the changed attack surface

If **~~code-graph** is connected (e.g. the [agent-context](https://github.com/shubham0086/agent-context) spoke):
- Trace tainted input from its entry point to every sink it can reach

If **~~knowledge base** is connected:
- Enforce your organization's security baseline and required controls

## Tips

1. **Tell me the data class** — payments and PII raise the bar on every finding.
2. **Name the trust boundary** — most real bugs live where untrusted input crosses it.
3. **Ask for the exploit, not just the label** — a finding with a scenario gets fixed faster.
