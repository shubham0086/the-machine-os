# Output sanitization & secret scanning

> An agent's output is not trusted text. It can echo a key it saw, leak a secret from its context,
> or carry an injection payload downstream. Sanitize what comes *out* of the model, not just what
> goes in.

## The pattern: redact key-shaped strings from model output

Guardrails are usually discussed as *input* defense (block prompt injection). The other half is
*output* defense: before an agent's output is logged, returned, or passed to the next agent, scan it
for things that look like secrets — `sk-…` API keys, `AIza…` Google keys, bearer tokens, long
high-entropy strings — and redact them. The model can surface a secret that was in its context window
without "intending" to; the sanitizer is the deterministic net that catches it regardless of intent.

This is implemented in the agentkernel guardrails and tested against real-looking payloads — the test
suite deliberately feeds the sanitizer a string containing fake-but-realistic keys and asserts they
come out redacted. Which leads to a second, instructive incident.

## The real incident: a secret-scan *false positive*

GitHub's automated secret scanning flagged a Google API key across four files in the
`agentic-systems` repo. The scan was working correctly. The "keys" were not real:

```js
const rawOutput = 'key=sk-1234567890abcdef... and key2=AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q';
```

These are **intentional dummy strings inside the guardrail tests** — the whole point of those tests
is to verify the system detects and redacts key-shaped patterns. `AIzaSyA1B2C3…` is a well-known fake
key used in security examples across the internet. A full scan of all three repos confirmed no real
secrets anywhere.

## The lessons

1. **Test your redaction with realistic fakes** — that's correct and necessary, and it *will* trip
   automated scanners. Expect the alert; it means your tests look like the real thing.
2. **A scanner alert is a prompt to verify, not proof of a leak.** The right response is a full audit
   (confirm it's a test fixture), not a panicked key rotation. Reserve rotation for confirmed real
   exposure — see [secrets & key rotation](secrets-and-key-rotation.md).
3. **Consider neutering the fakes** so they're obviously not real (e.g. `AIza_EXAMPLE_NOT_A_REAL_KEY`)
   to keep scanners quiet — a trade-off against the test reading like genuine output.

## Where it sits now

Output guardrails moved from "nice to have" to baseline in 2026, because agents increasingly act on
each other's output in multi-step chains — one agent's leaked secret becomes the next agent's input.
Treating model output as untrusted, and sanitizing it deterministically in code rather than asking
the model to "please don't leak secrets," is the same code-not-prompt principle that runs through
this whole handbook.

---

**Related:** [Agent execution safety](agent-execution-safety.md) · [Public-repo hygiene](public-repo-hygiene.md) · Reference: [agentkernel](../REPOSITORIES/agentkernel.md) (guardrails) · Field note: [AI agent guardrails](../FIELD-NOTES/ai-agent-guardrails.md)
