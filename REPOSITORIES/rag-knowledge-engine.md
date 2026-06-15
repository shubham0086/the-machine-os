# rag-knowledge-engine

> Hybrid retrieval done right: BM25 + vector with RRF fusion, cross-encoder rerank, and a
> RAGAS eval harness so you can prove it got better.

## Problem

Pure vector search returns plausible-but-wrong chunks. "We added RAG" without measurement
just moves the hallucination one layer down.

## Architecture

Hybrid retrieval (BM25 lexical + dense vector), fused with Reciprocal Rank Fusion, then
re-ordered by a cross-encoder reranker. A RAGAS evaluation harness scores faithfulness and
relevance so changes are measurable, not vibes. Ships a serverless mode + static index
builder. 25 tests. Powers the live portfolio chatbot.

## Lessons learned

- Hybrid beats either method alone - lexical catches exact terms vectors miss, and vice versa.
- A reranked payload can send *more* input tokens and still lower the total bill (see token-mix).
- Without an eval harness you cannot tell an improvement from a regression.

## Demo

```bash
git clone https://github.com/shubham0086/rag-knowledge-engine
cd rag-knowledge-engine && npm install && npm test
```

## Repository

[github.com/shubham0086/rag-knowledge-engine](https://github.com/shubham0086/rag-knowledge-engine)

## Related

- Recipe: [Build a RAG System](../SYSTEM-RECIPES/build-a-rag-system.md)
- Field notes: [Hybrid Retrieval / RAG in Practice](../FIELD-NOTES/rag-in-practice.md), [The Token-Mix Fallacy](../FIELD-NOTES/token-mix-fallacy.md), [Zero-Cloud Local RAG](../FIELD-NOTES/zero-cloud-local-rag.md)
