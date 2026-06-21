---
name: prompt-review
description: Review or improve an LLM prompt or system prompt. Trigger with "review this prompt", "improve my system prompt", "why is the model ignoring instructions?", or when treating a prompt as a contract: clear instructions, structured output, examples, and failure handling.
argument-hint: "<prompt or system prompt to review>"
tier: intelligence
contract: "1.0"
requires: [agent-design-doc]
produces: [prompt-review-report]
feeds: [agent-design, hallucination-audit, testing-strategy]
---

# /prompt-review

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md). This skill follows the [SKILL-CONTRACT.md](../../SKILL-CONTRACT.md) — it appends a `machine_output` block.

Treat the prompt as a contract, not a wish. A good prompt states the role, the task, the exact
output shape, and what to do when the input is bad. This skill reviews against those properties
and rewrites where it helps. `produces` a `prompt-review-report` that agent-design and
hallucination-audit consume.

## Usage

```
/prompt-review <prompt or system prompt>
```

Review: @$1

If given a prompt with no context, ask what model it targets and what a correct vs incorrect
output looks like.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                     PROMPT REVIEW                                │
├─────────────────────────────────────────────────────────────────┤
│  STANDALONE (always works)                                       │
│  ✓ Role + task clarity (no ambiguous instructions)              │
│  ✓ Output contract (format, schema, constraints)               │
│  ✓ Few-shot examples where they earn their tokens               │
│  ✓ Failure handling (bad input, refusal, uncertainty)          │
│  ✓ Injection resistance + token efficiency                     │
├─────────────────────────────────────────────────────────────────┤
│  SUPERCHARGED (when you connect your tools)                      │
│  + Eval harness: score the rewrite against a test set            │
│  + Knowledge base: align with your prompt conventions            │
└─────────────────────────────────────────────────────────────────┘
```

## Review Dimensions

### Clarity
- Role and task are unambiguous; no instruction can be read two ways
- Conflicting instructions resolved (the model obeys the last/strongest by default)

### Output Contract
- The required format is specified exactly (JSON shape, fields, allowed values)
- The prompt says what to emit and *only* what to emit (no preamble leakage)

### Robustness
- Defined behavior for bad, empty, or adversarial input
- A path for "I don't know" so the model abstains instead of inventing
- Resistance to prompt injection from user-supplied content

### Efficiency
- Examples earn their token cost; redundant instructions removed
- Static context cacheable; the variable part isolated

## Output

```markdown
## Prompt Review: [name/purpose]

### Verdict
[The single biggest reason it underperforms.]

### Findings
| # | Dimension | Issue | Fix |
|---|-----------|-------|-----|

### Rewrite
[The improved prompt, ready to paste.]

### Scorecard
| Dimension | Score | Note |
|-----------|-------|------|
| Clarity | /100 | |
| Output contract | /100 | |
| Robustness | /100 | |
| Efficiency | /100 | |
```

## Output Contract

This is an **assessment skill**. Append a `machine_output` block per
[SKILL-CONTRACT.md](../../SKILL-CONTRACT.md). The rewrite is an artifact.

**Scorecard rubric** (each 0-100): 90-100 production-ready, 75-89 minor tightening, 50-74
unreliable outputs likely, below 50 rewrite.

```yaml
machine_output:
  skill: prompt-review
  version: "1.0"
  timestamp: <ISO-8601>
  status: complete
  scorecard:
    clarity: 74
    output_contract: 55
    robustness: 60
    efficiency: 80
  findings:
    - id: F1
      severity: high
      category: output_contract
      description: Asks for JSON but does not specify the schema; output shape drifts
    - id: F2
      severity: medium
      category: robustness
      description: No instruction for empty or off-topic input; model hallucinates an answer
  recommendations:
    - id: R1
      action: Specify the exact JSON schema and add "output only valid JSON, no prose"
      effort: low
      addresses: [F1]
    - id: R2
      action: Add an abstention path - return {"status":"insufficient_input"} when unsure
      effort: low
      addresses: [F2]
  artifacts:
    - prompt-review-report
    - rewritten-prompt
  next_actions:
    - skill: testing-strategy
      reason: Build an eval set so prompt changes are measured, not guessed
    - skill: hallucination-audit
      reason: Verify the abstention path actually suppresses invented answers
```

## If Connectors Available

If **~~eval harness** is connected:
- Score the rewrite against a held-out test set instead of eyeballing it

If **~~knowledge base** is connected:
- Align the prompt with your house conventions (format, tone, refusal policy)

## Tips

1. **Show me a good and a bad output** — the contract becomes obvious from the contrast.
2. **Name the model** — instruction-following and format adherence vary across models.
3. **Give the model an exit** — an abstention path removes most hallucinations on bad input.
