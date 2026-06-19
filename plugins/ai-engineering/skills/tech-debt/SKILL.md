---
name: tech-debt
description: Identify, categorize, and prioritize technical debt. Trigger with "tech debt", "technical debt audit", "what should we refactor", "code health", or when the user asks about code quality, refactoring priorities, or maintenance backlog.
argument-hint: "[codebase area or scope]"
---

# /tech-debt

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md).

Systematically identify, categorize, and prioritize technical debt using quantitative prioritization scoring.

## Categories

| Type | Examples | Risk |
|------|----------|------|
| **Code debt** | Duplicated logic, poor abstractions, cognitive complexity, magic numbers | Rapidly mounting bugs, regression risk, slow development cycles |
| **Architecture debt** | High component coupling, misplaced boundaries, monolith extraction | Bottlenecks, hard scaling limits, single points of failure |
| **Test debt** | Low coverage, fragile tests, slow running suites, missing integration tests | High regression escape rate, deploy anxiety, build flakes |
| **Dependency debt** | Highly outdated frameworks, unmaintained libraries, security vulnerability risks | CVE exposures, build breaks, unsupported tooling upgrades |
| **Documentation debt** | Missing installation steps, stale API specs, legacy internal runbooks | Onboarding friction, operational downtime, tribal knowledge dependency |
| **Infrastructure debt** | Manual deployment loops, lack of runtime alerting, missing IaC templates | Operational incidents, recovery time drift, environment drift |

## Prioritization Framework (Weighted Shortest Job First - WSJF)

Evaluate and catalog each technical debt registry item using this weighted math framework on a scale of `1-5`:
- **Business Value (BV):** How much does fixing this improve development velocity or end-user UX?
- **Risk Reduction (RR):** Does this resolve active performance bottlenecks, security flaws, or incident vectors?
- **Job Size (JS):** How complex, risky, or resource-heavy is the remediation effort?

$$\text{WSJF Priority Score} = \frac{\text{Business Value (BV)} + \text{Risk Reduction (RR)}}{\text{Job Size (JS)}}$$

*Note: Items with higher priority scores represent high-value, fast-remediating tasks that should be tackled first.*

## Output

Produce a highly prioritized technical debt remediation document containing:
1. **Uncovered Technical Debt Registry Table:** Itemized list with categories, score metrics (BV, RR, JS), and absolute WSJF scores.
2. **Business Justifications:** Strategic explanations for non-technical stakeholders explaining why resolving these items will directly improve product velocity.
3. **Phased Remediation Plan:** Phased execution roadmap (e.g., Phase 1 Quick Wins vs Phase 2 Major Initiatives) mapped cleanly to execute alongside standard product sprints.

## If Connectors Available

If **~~source control** is connected:
- Scan the codebase for duplication, complexity hotspots, and stale dependencies to seed the registry
- Use change frequency (churn) to weight which debt is actually slowing the team down

If **~~project tracker** is connected:
- Create prioritized remediation tickets straight from the WSJF table
- Cross-link debt items to the features they are blocking

If **~~knowledge base** is connected:
- Pull prior debt audits and architecture decisions to avoid re-litigating known trade-offs

## Tips

1. **Scope the audit.** "The payments service" gives a sharper registry than "the whole repo."
2. **Bring churn data if you have it.** Debt in code nobody touches matters less than debt on the hot path.
3. **Lead with the WSJF table.** Stakeholders fund the high-value, low-effort wins first.
