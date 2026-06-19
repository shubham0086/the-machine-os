---
name: testing-strategy
description: Design test strategies and test plans. Trigger with "how should we test", "test strategy for", "write tests for", "test plan", "what tests do we need", or when the user needs help with testing approaches, coverage, or test architecture.
argument-hint: "<component or system to test>"
---

# /testing-strategy

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md).

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
