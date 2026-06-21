---
name: performance-review
description: Find and prioritize performance bottlenecks in code, queries, or a system. Trigger with "why is this slow?", "review performance", "find the bottleneck", "will this scale?", or when profiling latency, throughput, memory, or database hotspots.
argument-hint: "<code, query, endpoint, or system to profile>"
tier: engineering
contract: "1.0"
requires: [source-files, data-model]
produces: [performance-report]
feeds: [tech-debt, architecture-review, task-decomposition]
---

# /performance-review

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md). This skill follows the [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md) — it appends a `machine_output` block.

Locate the bottlenecks that actually matter and rank them by impact, so effort goes where it
moves p99, not where it feels productive. `produces` a `performance-report` that tech-debt and
architecture-review consume.

## Usage

```
/performance-review <code, query, endpoint, or system>
```

Profile: @$1

If given a whole system, ask for the symptom (slow p99? high CPU? memory growth?) and the target,
so the review optimizes against a number, not a vibe.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                   PERFORMANCE REVIEW                             │
├─────────────────────────────────────────────────────────────────┤
│  STANDALONE (always works)                                       │
│  ✓ Algorithmic complexity + hot path analysis                   │
│  ✓ N+1 queries, missing indexes, unbounded loops                │
│  ✓ Memory allocation + resource leaks                           │
│  ✓ Caching, batching, and concurrency opportunities             │
│  ✓ Impact-ranked, not exhaustive                                │
├─────────────────────────────────────────────────────────────────┤
│  SUPERCHARGED (when you connect your tools)                      │
│  + Observability: read real traces, flame graphs, p99 latency    │
│  + Database: pull the slow query log + EXPLAIN plans             │
└─────────────────────────────────────────────────────────────────┘
```

## Review Dimensions

### Compute
- Algorithmic complexity in hot paths (O(n^2) where O(n) is reachable)
- Redundant work, recomputation, and missing memoization
- Serial work that could be batched or parallelized

### Data Access
- N+1 queries (the most common real-world bottleneck)
- Missing or unused indexes, and full scans on large tables
- Over-fetching columns/rows; unbounded result sets

### Memory & Resources
- Allocations in hot loops, large object retention, leaks
- Connection, file handle, and stream exhaustion

### Concurrency & Caching
- Lock contention and false serialization
- Cacheable results that are recomputed every call
- Cache invalidation correctness (a wrong cache is worse than none)

## Output

```markdown
## Performance Review: [target]

### Headline
[The single change with the biggest expected impact.]

### Bottlenecks (impact-ranked)
| # | Location | Issue | Est. impact | Fix effort |
|---|----------|-------|-------------|------------|
| 1 | [file/query] | [N+1, scan, etc.] | High | Low |

### Scorecard
| Dimension | Score | Note |
|-----------|-------|------|
| Compute | /100 | |
| Data access | /100 | |
| Memory | /100 | |
| Concurrency | /100 | |
```

## Output Contract

This is an **assessment skill**. Append a `machine_output` block per
[SKILL-CONTRACT.md](../../SKILL-CONTRACT.md).

**Scorecard rubric** (each 0-100): 90-100 efficient for the target load, 75-89 minor wins
available, 50-74 will not meet targets under load, below 50 redesign the hot path.

```yaml
machine_output:
  skill: performance-review
  version: "1.0"
  timestamp: <ISO-8601>
  status: complete
  scorecard:
    compute: 82
    data_access: 55
    memory: 88
    concurrency: 76
  findings:
    - id: F1
      severity: critical
      category: data_access
      location: services/feed.js:120
      description: Loads each author in a loop; N+1 across the timeline render
  recommendations:
    - id: R1
      action: Batch-load authors with a single IN query keyed by id
      effort: low
      addresses: [F1]
  artifacts:
    - performance-report
  next_actions:
    - skill: tech-debt
      reason: Track the remaining lower-impact hotspots as prioritized debt
    - skill: testing-strategy
      reason: Add a load test asserting the p99 target so it cannot regress
```

## If Connectors Available

If **~~observability** is connected:
- Read real traces and flame graphs so the review targets the actual hot path, not the suspected one

If **~~database** is connected:
- Pull the slow query log and EXPLAIN plans to confirm index and scan findings

## Tips

1. **Give me a number** — "p99 must be under 200ms" turns the review from opinion into a target.
2. **Measure before you cut** — I rank by expected impact; real profiles beat my estimates.
3. **One bottleneck at a time** — fixing the top item often moves the next one anyway.
