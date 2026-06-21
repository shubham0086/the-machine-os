---
name: rag-review
description: Review a retrieval strategy and decide whether RAG is even the right approach. Trigger with "review my RAG pipeline", "is RAG the right call here?", "improve retrieval quality", or when evaluating chunking, embeddings, retrieval, reranking, and grounding for an LLM system.
argument-hint: "<RAG pipeline, retrieval setup, or use case to evaluate>"
tier: intelligence
contract: "1.0"
requires: [requirements-spec]
produces: [rag-review-report]
feeds: [hallucination-audit, performance-review, agent-design]
---

# /rag-review

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md). This skill follows the [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md) — it appends a `machine_output` block.

RAG is a means, not a default. The most valuable output of this skill is often "you do not need
RAG here." It leads with a **retrieval-strategy decision**, then, if retrieval is warranted,
reviews the pipeline. `produces` a `rag-review-report` that hallucination-audit consumes.

## Usage

```
/rag-review <RAG pipeline, retrieval setup, or use case>
```

Evaluate: @$1

If given only a use case, ask how often the knowledge changes, how large the corpus is, and
whether answers must cite sources.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                       RAG REVIEW                                 │
├─────────────────────────────────────────────────────────────────┤
│  STANDALONE (always works)                                       │
│  ✓ Retrieval-strategy DECISION (RAG is questioned, not assumed) │
│  ✓ Chunking + embedding fit                                     │
│  ✓ Retrieval: dense / sparse / hybrid + reranking              │
│  ✓ Grounding + citation faithfulness                           │
│  ✓ Eval: context relevance, answer faithfulness               │
├─────────────────────────────────────────────────────────────────┤
│  SUPERCHARGED (when you connect your tools)                      │
│  + Eval harness: score retrieval + faithfulness on a test set    │
│  + RAG spoke: inspect the live index and retrieval quality       │
└─────────────────────────────────────────────────────────────────┘
```

## Step 1 — The Decision (do this first)

Pick the retrieval strategy before reviewing any pipeline. Possible values:

| Decision | When it fits |
|----------|--------------|
| **No retrieval needed** | Knowledge is stable and fits in context, or lives in the model already |
| **Traditional RAG** | Large, semi-static corpus; semantic lookup is enough |
| **Hybrid RAG** | Keyword precision matters (codes, names, IDs) alongside semantics |
| **Agentic retrieval** | Multi-hop questions; the system must decide what to fetch and when |
| **Knowledge graph** | Relationships and traversal matter more than passage similarity |
| **Fine-tuning** | Stable domain behavior/format; not fresh facts |

State the decision and the reason. If it is "No retrieval needed," stop here — that is the finding.

## Step 2 — Pipeline Review (only if retrieval is warranted)

- **Chunking** — size and overlap fit the content; boundaries do not split meaning
- **Embeddings** — model suits the domain and query style
- **Retrieval** — dense vs sparse vs hybrid; top-k justified; reranking where precision matters
- **Grounding** — answers cite retrieved spans; the prompt forbids ungrounded claims
- **Eval** — context relevance and answer faithfulness measured, not assumed

## Output

```markdown
## RAG Review: [system]

### Decision
**[Traditional RAG / Hybrid / Agentic / Knowledge Graph / Fine-Tuning / No Retrieval Needed]**
[Why this and not the others.]

### Pipeline Findings (if retrieval warranted)
| # | Stage | Issue | Fix |
|---|-------|-------|-----|

### Scorecard
| Dimension | Score | Note |
|-----------|-------|------|
| Retrieval quality | /100 | |
| Grounding/faithfulness | /100 | |
| Efficiency/cost | /100 | |
```

## Output Contract

This is an **assessment skill**. Append a `machine_output` block per
[SKILL-CONTRACT.md](../../SKILL-CONTRACT.md). The retrieval `decision` is a first-class field.

**Scorecard rubric** (each 0-100): 90-100 production-grade retrieval, 75-89 tunable, 50-74
answers are unreliable, below 50 rework.

```yaml
machine_output:
  skill: rag-review
  version: "1.0"
  timestamp: <ISO-8601>
  status: complete
  decision: hybrid-rag        # traditional-rag | hybrid-rag | agentic | knowledge-graph | fine-tuning | no-retrieval
  decision_reason: Corpus mixes prose with exact identifiers; dense alone misses the IDs
  scorecard:
    retrieval_quality: 68
    grounding_faithfulness: 72
    efficiency_cost: 85
  findings:
    - id: F1
      severity: high
      category: retrieval_quality
      description: Pure vector search; exact-match queries (SKUs, error codes) miss
    - id: F2
      severity: medium
      category: grounding_faithfulness
      description: No reranking; top-k includes off-topic chunks that dilute the answer
  recommendations:
    - id: R1
      action: Add BM25 alongside vectors and fuse with RRF
      effort: medium
      addresses: [F1]
    - id: R2
      action: Add a cross-encoder reranker over top-k before generation
      effort: medium
      addresses: [F2]
  artifacts:
    - rag-review-report
  next_actions:
    - skill: hallucination-audit
      reason: Verify answers are actually grounded in the retrieved spans
    - skill: performance-review
      reason: Reranking adds latency; confirm it stays within the target
```

## If Connectors Available

If **~~eval harness** is connected:
- Score context relevance and answer faithfulness on a held-out set instead of by inspection

If **~~RAG spoke** is connected (e.g. the [rag-knowledge-engine](https://github.com/shubham0086/rag-knowledge-engine) spoke):
- Inspect the live index and run real queries to ground the review

## Tips

1. **Be willing to hear "no RAG"** — the cheapest pipeline is the one you do not build.
2. **Bring failing queries** — retrieval problems are obvious once you see what it returns.
3. **Separate retrieval from generation failures** — fix the wrong half and nothing improves.
