---
name: document-extraction
description: Design or review a document-extraction pipeline (PDF/scan → structured data) and decide the extraction strategy first. Trigger with "extract structured data from these PDFs", "is OCR or a VLM right here?", "review my document parsing", "why is table extraction wrong?", or when turning messy documents (filings, invoices, reports) into validated JSON.
argument-hint: "<documents, extraction pipeline, or use case to evaluate>"
tier: intelligence
contract: "1.0"
requires: [requirements-spec]
produces: [document-extraction-report]
feeds: [rag-review, hallucination-audit, database-design]
---

# /document-extraction

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md). This skill follows the [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md) — it appends a `machine_output` block.

Most "messy PDF" problems are lost before retrieval: the document is a *picture* of tables,
and the pipeline threw the structure away on page one. This skill leads with an
**extraction-strategy decision** (the cheapest method that survives your documents), then
reviews the pipeline, with the hardest question made first-class: **how do you know the
extracted values are right?**

## Usage

```
/document-extraction <documents, extraction pipeline, or use case>
```

Evaluate: @$1

If given only a use case, ask: are the documents born-digital or scanned, how regular is
the layout, do the numbers need to be exactly right (financial/legal) or roughly right, and
how many document types must it handle.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    DOCUMENT EXTRACTION                           │
├─────────────────────────────────────────────────────────────────┤
│  STANDALONE (always works)                                       │
│  ✓ Extraction-strategy DECISION (method is chosen, not assumed) │
│  ✓ Parse fidelity: layout, tables, multi-column, footnotes     │
│  ✓ Structured output: schema-guided, defensive JSON parsing    │
│  ✓ Correctness: required fields, types, arithmetic coherence   │
│  ✓ Eval: field accuracy / precision / recall on a gold set     │
├─────────────────────────────────────────────────────────────────┤
│  SUPERCHARGED (when you connect your tools)                      │
│  + agent-extractor spoke: run a real page and validate it       │
│  + Eval harness: score extraction on a labeled set, not by eye   │
└─────────────────────────────────────────────────────────────────┘
```

## Step 1 — The Decision (do this first)

Pick the extraction method before reviewing any pipeline. Cheapest that survives your documents wins.

| Decision | When it fits |
|----------|--------------|
| **Plain text extract** | Born-digital PDFs, simple flowing text, no tables that matter (pdfplumber/PyMuPDF text) |
| **Layout/OCR model** | Scanned or image PDFs with regular structure; you need bounding boxes + reading order (Azure Document Intelligence, Google Document AI, Docling) |
| **VLM (vision-language)** | Irregular layouts, dense tables, merged cells, footnotes; one model that *reads the page* and returns fields |
| **Hybrid (layout + VLM)** | High volume where a cheap layout pass handles 80% and a VLM handles the hard pages |
| **Template/rules** | A handful of fixed forms that never change; a parser beats any model on cost and determinism |

State the decision and why. If "plain text extract" covers it, stop, you do not need a model.

## Step 2 — Pipeline Review (only if a model is warranted)

- **Render** — resolution high enough for dense tables; right pages targeted, not the whole doc
- **Extract** — schema-guided (the output shape is declared, not hoped for); raw model text is parsed defensively, never `json.loads` straight
- **Correctness** — required fields present; types coerce; **arithmetic coherence** for numeric docs (subtotals sum, statement identities hold). This is the check that catches silent single-cell misreads
- **Eval** — field accuracy measured against a gold set, so a prompt/model change is provably better
- **Cost** — token cost per page tracked; cheapest method that hits the accuracy bar

## Output

```markdown
## Document Extraction Review: [system]

### Decision
**[Plain text / Layout-OCR / VLM / Hybrid / Template]**
[Why this and not the others, given the documents.]

### Pipeline Findings (if a model is warranted)
| # | Stage | Issue | Fix |
|---|-------|-------|-----|

### Scorecard
| Dimension | Score | Note |
|-----------|-------|------|
| Parse fidelity | /100 | |
| Extraction accuracy | /100 | |
| Correctness checks | /100 | |
| Cost/throughput | /100 | |
```

## Output Contract

This is an **assessment skill**. Append a `machine_output` block per
[SKILL-CONTRACT.md](../../SKILL-CONTRACT.md). The extraction `decision` is a first-class field.

**Scorecard rubric** (each 0-100): 90-100 trustworthy on unseen documents, 75-89 reliable with
spot-checks, 50-74 needs human review on every doc, below 50 rework the approach.

```yaml
machine_output:
  skill: document-extraction
  version: "1.0"
  timestamp: <ISO-8601>
  status: complete
  decision: vlm              # plain-text | layout-ocr | vlm | hybrid | template
  decision_reason: Dense financial tables with merged cells; layout models mis-order columns
  scorecard:
    parse_fidelity: 70
    extraction_accuracy: 64
    correctness_checks: 40
    cost_throughput: 80
  findings:
    - id: F1
      severity: high
      category: correctness_checks
      description: No arithmetic validation; a misread subtotal ships silently
    - id: F2
      severity: medium
      category: extraction_accuracy
      description: Schema is implicit in the prompt; output shape drifts between runs
  recommendations:
    - id: R1
      action: Add coherence checks (subtotals sum, statement identities) as a hard gate
      effort: low
      addresses: [F1]
    - id: R2
      action: Declare an explicit schema and parse defensively (strip fences, slice braces)
      effort: low
      addresses: [F2]
  artifacts:
    - document-extraction-report
  next_actions:
    - skill: rag-review
      reason: The extracted text feeds retrieval; review whether RAG is even warranted next
    - skill: hallucination-audit
      reason: Verify downstream answers cite the extracted values, not invented ones
```

## If Connectors Available

If **~~extractor** is connected (the [agent-extractor](https://github.com/shubham0086/agent-extractor) spoke):
- Run a real page through `extract_page` and read its validation report instead of reviewing by inspection
- Use `list_schemas` to ground the review in the actual output contract

If **~~eval harness** is connected:
- Score field accuracy / precision / recall on a labeled set rather than eyeballing a few pages

## Tips

1. **Decide before you build** — most teams reach for a VLM when plain text extraction would have done it cheaper and deterministically.
2. **Make the numbers prove themselves** — for financial/legal docs, arithmetic coherence is a free, deterministic correctness signal a confidence score can never be.
3. **Label a gold set early** — 30 hand-checked pages turn "seems better" into a measured delta, and they pay for themselves the first time a model swap silently regresses.
