---
name: hallucination-audit
description: Audit an AI-generated output for unsupported claims. Trigger with "is this output grounded?", "check this for hallucinations", "verify these claims", "fact-check this answer", or when you need claim-by-claim groundedness, evidence, and a verifiability verdict on generated text.
argument-hint: "<AI output to audit, with its sources if available>"
tier: intelligence
contract: "1.0"
requires: [generated-output, source-context]
produces: [hallucination-audit-report]
feeds: [prompt-review, rag-review, documentation]
---

# /hallucination-audit

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md). This skill follows the [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md) — it appends a `machine_output` block.

Take a block of AI-generated text and check whether each claim is actually supported. The method is
**claim extraction**: decompose the output into atomic claims, then judge each one against the
available evidence. This makes "is it hallucinating" answerable claim by claim instead of as a
vibe. Usable well beyond AI outputs — research summaries, legal text, engineering write-ups,
content verification. `produces` a `hallucination-audit-report`.

## Usage

```
/hallucination-audit <AI output, with its sources if available>
```

Audit: @$1

If no sources are provided, ask for the grounding material (retrieved context, docs, data). Without
evidence, claims can only be rated by verifiability, not verified.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                  HALLUCINATION AUDIT                             │
├─────────────────────────────────────────────────────────────────┤
│  STANDALONE (always works)                                       │
│  ✓ Claim extraction (output -> atomic claims)                   │
│  ✓ Per-claim evidence check + groundedness                      │
│  ✓ Confidence + verifiability rating                            │
│  ✓ Flags unsupported, contradicted, and unverifiable claims     │
│  ✓ Overall reliability verdict                                  │
├─────────────────────────────────────────────────────────────────┤
│  SUPERCHARGED (when you connect your tools)                      │
│  + Knowledge base / RAG spoke: check claims against source docs  │
│  + Web research: verify external facts against live sources      │
└─────────────────────────────────────────────────────────────────┘
```

## Method

1. **Extract claims** — break the output into atomic, individually checkable statements.
2. **Match evidence** — for each claim, find supporting evidence in the provided sources.
3. **Judge** — label each claim:
   - **Supported** — evidence directly backs it
   - **Unsupported** — no evidence found (not necessarily false, but ungrounded)
   - **Contradicted** — evidence says otherwise
   - **Unverifiable** — no source could confirm or deny it
4. **Rate** — confidence (how strong the support) and verifiability (could it be checked at all).
5. **Verdict** — overall reliability, weighted by how load-bearing the unsupported claims are.

## Output

```markdown
## Hallucination Audit: [output name]

### Verdict
[Reliable / Mixed / Unreliable] — [the load-bearing claim that drives it]

### Claims
| # | Claim | Evidence | Status | Confidence | Verifiable |
|---|-------|----------|--------|------------|------------|
| 1 | [atomic claim] | [source span] | Supported | High | Yes |
| 2 | [atomic claim] | none found | Unsupported | - | Yes |

### Unsupported / Contradicted
- [The claims that need a source or removal]

### Scorecard
| Dimension | Score | Note |
|-----------|-------|------|
| Groundedness | /100 | % of claims supported, weighted |
| Evidence quality | /100 | |
| Verifiability | /100 | |
```

## Output Contract

This is an **assessment skill**. Append a `machine_output` block per
[SKILL-CONTRACT.md](../../SKILL-CONTRACT.md). The extracted `claims` array is the core artifact.

**Scorecard rubric** (each 0-100): groundedness = weighted share of supported claims (load-bearing
claims count more). 90-100 reliable, 75-89 minor gaps, 50-74 mixed, below 50 unreliable. Any
contradicted load-bearing claim caps the verdict at Unreliable.

```yaml
machine_output:
  skill: hallucination-audit
  version: "1.0"
  timestamp: <ISO-8601>
  status: complete
  scorecard:
    groundedness: 70
    evidence_quality: 78
    verifiability: 90
  claims:
    - id: C1
      claim: The API enforces a 15-minute token expiry
      evidence: "auth.js:44 sets exp = now + 900s"
      status: supported
      confidence: high
      verifiable: true
    - id: C2
      claim: The system is SOC 2 Type II certified
      evidence: none found
      status: unsupported
      confidence: null
      verifiable: true
    - id: C3
      claim: Latency improved 40% after the change
      evidence: "benchmark shows 12%"
      status: contradicted
      confidence: high
      verifiable: true
  findings:
    - id: F1
      severity: high
      category: contradicted
      location: C3
      description: Claimed 40% latency gain; source benchmark shows 12%
    - id: F2
      severity: medium
      category: unsupported
      location: C2
      description: Compliance claim has no backing evidence
  recommendations:
    - id: R1
      action: Correct C3 to the measured 12% or cite the benchmark that shows 40%
      effort: low
      addresses: [F1]
    - id: R2
      action: Remove or source the SOC 2 claim before publishing
      effort: low
      addresses: [F2]
  artifacts:
    - hallucination-audit-report
  next_actions:
    - skill: prompt-review
      reason: Add an abstention path so the generator stops asserting unsupported claims
    - skill: rag-review
      reason: Unsupported claims suggest the retrieval is not grounding the answer
```

## If Connectors Available

If **~~knowledge base / RAG spoke** is connected (e.g. the [rag-knowledge-engine](https://github.com/shubham0086/rag-knowledge-engine) spoke):
- Check each claim against the actual source documents instead of only the supplied context

If **~~web research** is connected:
- Verify external, real-world facts against live sources

## Tips

1. **Give me the sources** — without evidence I can rate verifiability but cannot verify.
2. **Mark the load-bearing claims** — one false claim the argument rests on outweighs ten trivia errors.
3. **Use it past AI output** — the same claim-extraction works on any text that asserts facts.
