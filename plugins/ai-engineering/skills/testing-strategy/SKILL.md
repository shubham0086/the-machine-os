---
name: testing-strategy
description: Design test strategies and test plans. Trigger with "how should we test", "test strategy for", "write tests for", "test plan", "what tests do we need", or when the user needs help with testing approaches, coverage, or test architecture.
argument-hint: "<component or system to test>"
tier: engineering
contract: "1.0"
requires: [requirements-spec, system-design]
produces: [test-plan]
feeds: [deploy-checklist, code-review]
---

# /testing-strategy

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md). This skill follows the [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md) — it appends a `machine_output` block.

Design effective testing strategies balancing coverage, execution speed, and long-term maintenance costs.

## Testing Pyramid

```
        /  E2E  \         Few, slow, high confidence, expensive
       / Integration \     Some, medium speed, service boundaries
      /    Unit Tests  \   Many, fast, focused, algorithmic logic
```

## Strategy by Component Type

- **API endpoints**: Unit tests for core business models and controllers; Integration testing for validation, serialization, and database adapters; Contract tests for verification of downstream consumers.
- **Data pipelines**: Strict schema and input validations, schema drift checks, translation accuracy testing, scale load tests, and pipeline idempotency verification.
- **Frontend applications**: Fast component behavior validation (testing DOM reactions to prop changes), integration flows (mocking API payloads), accessibility audits (a11y), and critical visual regression suites.
- **Infrastructure & Platform**: Automated validation testing (e.g., Terratest), smoke validation, auto-scaling verification, and load tolerance benchmarking.

## Coverage Boundaries

### Focus On:
- Business-critical user paths and revenue-generating state loops.
- Error validation, network failures, dependency degradation, and edge scenarios.
- Security-sensitive paths (e.g., auth, token verification, permission logic).
- Data accuracy, consistency transformations, and database constraint boundaries.

### Skip/Minimize:
- Trivial boilerplate logic, framework-native code, standard variable accessors.
- One-off tooling, short-lived migration scripts, or mock code configurations.

## Output

Produce a robust test plan document featuring:
1. **What to Test:** List of domain surfaces, APIs, and interfaces grouped by criticality.
2. **Test Class Matrix:** Classification of each test tier (Unit, Integration, E2E, Contract) with target environments and tools.
3. **Coverage Metrics & SLIs:** Target coverage bounds, execution speed budgets, and flakiness tolerance limits.
4. **Concrete Test Examples:** Code structures or pseudocode templates outlining execution paths and assertions for happy, unhappy, and edge cases.
5. **Coverage Gap Identification:** Highlights of existing testing gaps and priorities for immediate remediation.

## Output Contract

This is an **assessment skill** (it scores current test posture while producing the plan). Append a
`machine_output` block per [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md). The `test-plan` is the
artifact.

**Scorecard rubric** (each 0-100, higher is healthier): 90-100 well covered, 75-89 minor gaps,
50-74 critical paths exposed, below 50 inadequate for safe release.

```yaml
machine_output:
  skill: testing-strategy
  version: "1.0"
  timestamp: <ISO-8601>
  status: complete
  scorecard:
    coverage: 61
    critical_path: 70
    speed: 84
    reliability: 55
  findings:
    - id: F1
      severity: high
      category: gap
      location: checkout flow
      description: No E2E test on the checkout happy path; highest-revenue flow unguarded
    - id: F2
      severity: medium
      category: flakiness
      location: integration suite
      description: 6% flake rate is eroding trust in the suite
  recommendations:
    - id: R1
      action: Add an E2E test covering checkout happy and payment-decline paths
      effort: medium
      addresses: [F1]
  artifacts:
    - test-plan
  next_actions:
    - skill: deploy-checklist
      reason: Wire the coverage floor and flake budget into the release gate
    - skill: code-review
      reason: Enforce coverage on new changes during review
```

## If Connectors Available

If **~~source control** is connected:
- Read the existing test suite to find untested paths and the real coverage gaps
- Target tests at the files that change most often

If **~~CI/CD** is connected:
- Pull current coverage reports, pass rates, and flaky-test history to set realistic SLIs
- Wire the proposed gates (coverage floor, flake budget) into the pipeline

If **~~project tracker** is connected:
- Create test-writing tasks from the coverage-gap list, prioritized by criticality

## Tips

1. **Name the component.** "The checkout flow" yields a sharper plan than "the app."
2. **Set a flake budget.** A test suite nobody trusts gets ignored; bound flakiness explicitly.
3. **Test behavior, not implementation.** Tests bound to internals break on every refactor.
