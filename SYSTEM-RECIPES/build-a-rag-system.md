# Recipe: Build a RAG System

A retrieval system that returns the *right* chunks, not plausible-but-wrong ones - and that
you can prove got better.

## The shape

1. **Ingest + chunk** your corpus, build a static index.
2. **Retrieve hybrid:** BM25 lexical + dense vectors in parallel.
3. **Fuse** the two result sets with Reciprocal Rank Fusion (RRF).
4. **Rerank** the fused set with a cross-encoder.
5. **Evaluate** faithfulness + relevance with RAGAS so changes are measurable.

## Why each step

Vector-only search misses exact terms; lexical-only misses paraphrase. Hybrid + rerank is the
combination that holds up in production. A reranked payload can send more input tokens and
still cost less - see the token-mix field note.

## Clone and run

- **Source repo:** [rag-knowledge-engine](../REPOSITORIES/rag-knowledge-engine.md) (25 tests, serverless mode)
- **Field notes:** [Hybrid Retrieval / RAG in Practice](../FIELD-NOTES/rag-in-practice.md), [The Token-Mix Fallacy](../FIELD-NOTES/token-mix-fallacy.md)
- **Privacy variant:** [Zero-Cloud Local RAG](../FIELD-NOTES/zero-cloud-local-rag.md)
- **Architecture:** retrieval pipeline (v2 `ARCHITECTURES/`)
- **Playbook:** AI SaaS productionization (queued - see [ROADMAP](../ROADMAP.md))
