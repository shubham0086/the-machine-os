---
name: database-design
description: Design or review a data model and schema. Trigger with "design the schema for", "review this data model", "should this be normalized?", "what indexes do I need?", or when choosing keys, relationships, indexing, and the SQL-vs-NoSQL fit for a workload.
argument-hint: "<domain/entities to model, or an existing schema to review>"
tier: engineering
contract: "1.0"
requires: [requirements-spec, api-spec]
produces: [data-model]
feeds: [performance-review, security-review, system-design]
---

# /database-design

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md). This skill follows the [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md) — it appends a `machine_output` block.

Design a data model that fits the access patterns, or review an existing schema for correctness,
performance, and integrity. `produces` a `data-model` that performance-review and security-review
consume.

## Usage

```
/database-design <entities to model, or an existing schema to review>
```

Design or review: @$1

If designing from scratch, ask for the main entities, the read/write ratio, and the top 3 queries
the system must serve fast.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE DESIGN                              │
├─────────────────────────────────────────────────────────────────┤
│  STANDALONE (always works)                                       │
│  ✓ Entity + relationship modeling                               │
│  ✓ Keys, constraints, referential integrity                     │
│  ✓ Normalization vs deliberate denormalization                  │
│  ✓ Indexing strategy from real query patterns                   │
│  ✓ SQL vs NoSQL fit for the workload                            │
├─────────────────────────────────────────────────────────────────┤
│  SUPERCHARGED (when you connect your tools)                      │
│  + Database: read the live schema, sizes, and slow query log     │
│  + Observability: ground index choices in real query stats       │
└─────────────────────────────────────────────────────────────────┘
```

## Review Dimensions

### Correctness & Integrity
- Primary/foreign keys, uniqueness, and not-null where invariants demand it
- Referential integrity and cascade behavior
- The model can represent every required state and no invalid ones

### Access Patterns
- Indexes derived from the actual queries, not guessed
- Avoids over-indexing (write amplification) and under-indexing (table scans)
- Composite index column order matches query predicates

### Shape & Scale
- Normalization level justified by the workload; denormalization is deliberate, not accidental
- Partitioning/sharding strategy where data volume demands it
- SQL vs NoSQL chosen from consistency and access-pattern needs, not fashion

### Safety
- No secrets or PII modeled in plaintext where it should be hashed or encrypted
- Migration path is reversible and online-safe for large tables

## Output

```markdown
## Data Model: [domain]

### Entities
| Entity | Key | Notable columns | Relationships |
|--------|-----|-----------------|---------------|

### Indexes
| Table | Index | Columns | Serves query |
|-------|-------|---------|--------------|

### Scorecard
| Dimension | Score | Note |
|-----------|-------|------|
| Integrity | /100 | |
| Access patterns | /100 | |
| Scale fit | /100 | |
| Safety | /100 | |

### Findings & Fixes
- [Issue → concrete change]
```

## Output Contract

This is an **assessment skill**. Append a `machine_output` block per
[SKILL-CONTRACT.md](../../SKILL-CONTRACT.md).

**Scorecard rubric** (each 0-100): 90-100 sound for the stated workload, 75-89 minor fixes, 50-74
will degrade under load, below 50 remodel.

```yaml
machine_output:
  skill: database-design
  version: "1.0"
  timestamp: <ISO-8601>
  status: complete
  scorecard:
    integrity: 86
    access_patterns: 64
    scale_fit: 78
    safety: 90
  findings:
    - id: F1
      severity: high
      category: access_patterns
      location: orders.customer_id
      description: Frequent filter on customer_id has no index; full scans under load
    - id: F2
      severity: medium
      category: integrity
      location: order_items.order_id
      description: Missing FK; orphaned line items possible
  recommendations:
    - id: R1
      action: Add an index on orders(customer_id, created_at) to serve the listing query
      effort: low
      addresses: [F1]
    - id: R2
      action: Add a foreign key with ON DELETE CASCADE on order_items.order_id
      effort: low
      addresses: [F2]
  artifacts:
    - data-model
  next_actions:
    - skill: performance-review
      reason: Validate the index plan against the real query mix
    - skill: security-review
      reason: Confirm PII columns are encrypted or hashed at rest
```

## If Connectors Available

If **~~database** is connected:
- Read the live schema, table sizes, and slow query log to ground the review in reality

If **~~observability** is connected:
- Use real query frequency and latency to choose which indexes actually pay for themselves

## Tips

1. **Bring your top queries** — indexes follow access patterns, not table structure.
2. **State the scale** — 10k rows and 10B rows want different designs.
3. **Justify denormalization** — it is a performance trade, never a default.
