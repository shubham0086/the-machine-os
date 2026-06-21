---
name: api-design
description: Design or review an API contract (REST or GraphQL). Trigger with "design an API for", "review this endpoint", "is this REST API well designed?", or when defining resources, methods, status codes, pagination, versioning, idempotency, and error shapes.
argument-hint: "<resource/domain, or an existing API spec to review>"
tier: engineering
contract: "1.0"
requires: [requirements-spec]
produces: [api-spec]
feeds: [security-review, performance-review, database-design, documentation]
---

# /api-design

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md). This skill follows the [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md) — it appends a `machine_output` block.

Design a new API contract or review an existing one against the properties that make APIs safe to
build on: consistency, correct semantics, evolvability, and resilience. `produces` an `api-spec`
that security-review, performance-review, and documentation consume.

## Usage

```
/api-design <resource/domain to design, or an existing spec to review>
```

Design or review: @$1

If designing from scratch, ask for the core resources, the consumers (public/internal/partner),
and the read/write ratio.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                       API DESIGN                                 │
├─────────────────────────────────────────────────────────────────┤
│  STANDALONE (always works)                                       │
│  ✓ Resource modeling + method/verb semantics                    │
│  ✓ Status codes, error shapes, validation                       │
│  ✓ Pagination, filtering, sorting                               │
│  ✓ Versioning + backward compatibility                          │
│  ✓ Idempotency, rate limits, auth model                         │
├─────────────────────────────────────────────────────────────────┤
│  SUPERCHARGED (when you connect your tools)                      │
│  + Source control: diff against the deployed OpenAPI spec        │
│  + Knowledge base: enforce your org's API style guide            │
└─────────────────────────────────────────────────────────────────┘
```

## Review Dimensions

### Consistency
- Naming (plural resources, consistent casing), predictable URL structure
- Uniform error envelope across every endpoint
- One pagination style, one filtering style

### Semantics
- Correct verbs and status codes (201 vs 200, 409 vs 400, 422 for validation)
- Safe and idempotent methods behave as the spec promises

### Versioning & Evolvability
- A versioning strategy exists (URL, header, or media type) and is applied
- Additive changes do not break existing clients; breaking changes are gated

### Resilience
- **Idempotency keys** on unsafe operations (the classic miss on POST)
- Rate limits and quotas defined per consumer class
- Pagination is mandatory on list endpoints (no unbounded responses)

## Output

```markdown
## API Design: [domain]

### Resources & Endpoints
| Method | Path | Purpose | Success | Errors |
|--------|------|---------|---------|--------|
| GET | /v1/orders | List orders (cursor paginated) | 200 | 401, 429 |

### Error Envelope
[The single shape every error returns.]

### Scorecard
| Dimension | Score | Note |
|-----------|-------|------|
| Consistency | /100 | |
| Semantics | /100 | |
| Versioning | /100 | |
| Resilience | /100 | |

### Findings & Fixes
- [Issue → concrete change]
```

## Output Contract

This is an **assessment skill**. Append a `machine_output` block per
[SKILL-CONTRACT.md](../../SKILL-CONTRACT.md).

**Scorecard rubric** (each 0-100): 90-100 safe to publish, 75-89 minor inconsistencies, 50-74
clients will hit friction, below 50 redesign.

```yaml
machine_output:
  skill: api-design
  version: "1.0"
  timestamp: <ISO-8601>
  status: complete
  scorecard:
    consistency: 91
    semantics: 88
    versioning: 94
    resilience: 70
  findings:
    - id: F1
      severity: high
      category: resilience
      location: POST /v1/payments
      description: No idempotency key; client retries can double-charge
    - id: F2
      severity: medium
      category: resilience
      location: GET /v1/orders
      description: List endpoint is unpaginated and can return unbounded results
  recommendations:
    - id: R1
      action: Require an Idempotency-Key header on all unsafe mutations
      effort: medium
      addresses: [F1]
    - id: R2
      action: Add cursor pagination with a default and max page size
      effort: low
      addresses: [F2]
  artifacts:
    - api-spec
  next_actions:
    - skill: security-review
      reason: Auth model and input validation need a dedicated pass
    - skill: documentation
      reason: Generate reference docs from the finalized spec
```

## If Connectors Available

If **~~source control** is connected:
- Diff the proposed contract against the deployed OpenAPI/GraphQL schema to flag breaking changes

If **~~knowledge base** is connected:
- Enforce your organization's API style guide (naming, error format, versioning policy)

## Tips

1. **Say who consumes it** — a public partner API and an internal service API have different rules.
2. **Bring the write operations** — idempotency and consistency issues live in the mutations.
3. **Decide versioning up front** — retrofitting a versioning strategy is the expensive path.
