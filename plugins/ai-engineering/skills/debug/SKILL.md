---
name: debug
description: Structured debugging session — reproduce, isolate, diagnose, and fix. Trigger with an error message or stack trace, "this works in staging but not prod", "something broke after the deploy", or when behavior diverges from expected and the cause isn't obvious.
argument-hint: "<error message or problem description>"
tier: engineering
contract: "1.0"
requires: [error, source-files]
produces: [debug-report]
feeds: [code-review, testing-strategy, tech-debt]
---

# /debug

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md). This skill follows the [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md) — it appends a `machine_output` block.

Run a structured debugging session to find and fix issues systematically.

## Usage

```
/debug $ARGUMENTS
```

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                       DEBUG                                        │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: REPRODUCE                                                │
│  ✓ Understand the expected vs. actual behavior                   │
│  ✓ Identify exact reproduction steps                             │
│  ✓ Determine scope (when did it start? who is affected?)        │
│                                                                    │
│  Step 2: ISOLATE                                                   │
│  ✓ Narrow down the component, service, or code path             │
│  ✓ Check recent changes (deploys, config changes, dependencies) │
│  ✓ Review logs and error messages                                │
│                                                                    │
│  Step 3: DIAGNOSE                                                  │
│  ✓ Form hypotheses and test them                                 │
│  ✓ Trace the code path                                           │
│  ✓ Identify root cause (not just symptoms)                      │
│                                                                    │
│  Step 4: FIX                                                       │
│  ✓ Propose a fix with explanation                                │
│  ✓ Consider side effects and edge cases                          │
│  ✓ Suggest tests to prevent regression                           │
└─────────────────────────────────────────────────────────────────┘
```

## What I Need From You

Tell me about the problem. Any of these help:
- Error message or stack trace (paste exactly, without modification)
- Steps to reproduce
- What changed recently (deployed code, configurations, data migrations)
- Logs, telemetry trace IDs, or context
- Expected vs. actual behavior

## Output

```markdown
## Debug Report: [Issue Summary]

### Scenario Diagnostics
- **Expected Behavior:** [What should happen]
- **Actual Behavior:** [What happens instead]
- **Scope of Impact:** [When did it start? Environment? Who/what is affected?]
- **Steps to Reproduce:**
  1. [Step 1]
  2. [Step 2]

### Root Cause Hypothesis & Analysis
[Clear, deductive reasoning of how the system entered the failing state. Detail the exact code path, variable value, or state transition that caused the divergence.]

### Proposed Fix
[Detailed code modifications, configuration fixes, or operational commands needed to remediate the bug.]

```[language]
// Before
```
```[language]
// After (Fixed)
```

### Prevention & Guardrails
- **Automated Test to Add:** [Unit/Integration test definition to prevent future regression]
- **Architectural Safeguard:** [Static analysis, runtime constraint, or configuration guard to block this state]
```

## Output Contract

This is a **process skill** — it diagnoses, so it OMITS the scorecard. After the debug report,
append a `machine_output` block per [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md). The root cause is
the load-bearing finding.

```yaml
machine_output:
  skill: debug
  version: "1.0"
  timestamp: <ISO-8601>
  status: complete
  findings:
    - id: F1
      severity: critical
      category: root-cause
      location: services/cache.js:88
      description: Cache key omits tenant id; users read each other's cached responses
  recommendations:
    - id: R1
      action: Include tenant id in the cache key and add a regression test
      effort: low
      addresses: [F1]
  artifacts:
    - debug-report
  next_actions:
    - skill: testing-strategy
      reason: Add the regression test that proves the bug stays fixed
    - skill: code-review
      reason: Check sibling cache call sites for the same key omission
```

## If Connectors Available

If **~~monitoring** is connected:
- Pull logs, error rates, and metrics around the time of the issue
- Show recent deploys and config changes that may correlate

If **~~source control** is connected:
- Identify recent commits and PRs that touched affected code paths
- Check if the issue correlates with a specific change

If **~~project tracker** is connected:
- Search for related bug reports or known issues
- Create a ticket for the fix once identified

## Tips

1. **Share error messages exactly** — Don't paraphrase. The exact text matters.
2. **Mention what changed** — Recent deploys, dependency updates, and config changes are top suspects.
3. **Include context** — "This works in staging but not prod" or "Only affects large payloads" narrows things fast.