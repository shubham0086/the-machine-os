# agent-extractor

> The stage every RAG pipeline assumes someone else did: messy financial PDF → validated,
> structured JSON, with the numbers proven to hold together.

## Problem

A financial filing is a *picture* of tables, merged cells, footnotes, multi-column layout.
Plain text extraction throws the structure away, and a vision model that misreads one cell
returns plausible, wrong numbers that no schema-shape check will catch.

## Architecture

Render each page to an image (PyMuPDF), extract schema-guided JSON with a vision-language
model, then validate, including **arithmetic coherence**: subtotals must sum and statement
identities (`gross_profit = total_revenue - cost_of_revenue`) must hold. That free,
deterministic correctness signal catches silent single-cell misreads. A field-level eval
harness (accuracy / precision / recall vs a gold record) makes a model swap measurable, not
vibes. 24 tests, all mocked, fully offline. Exposed as an MCP stdio server (Python, `uvx`).

## Lessons learned

- For numeric documents, arithmetic coherence beats any model-reported confidence score, it is ground truth, not more generation.
- Schema-guided extraction + defensive JSON parsing is the difference between a demo and a pipeline that survives unseen documents.
- A small hand-labeled gold set pays for itself the first time a model swap silently regresses.

## Demo

```bash
git clone https://github.com/shubham0086/agent-extractor
cd agent-extractor && pip install -r requirements.txt && pytest
```

## Repository

[github.com/shubham0086/agent-extractor](https://github.com/shubham0086/agent-extractor)

## Related

- Spoke for: the [/document-extraction](../plugins/ai-engineering/skills/document-extraction/SKILL.md) skill (the `~~extractor` connector)
- Downstream sibling: [rag-knowledge-engine](rag-knowledge-engine.md) — retrieve + rerank + ground over the structured text this produces
- Field notes: [RAG in Practice](../FIELD-NOTES/rag-in-practice.md)
