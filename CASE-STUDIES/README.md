# Case Studies

The other sections tell you what to build and why it works. This one tells you what *broke*, and
what the failure taught — because the most honest signal a builder can give is the bug that cost two
days, written up straight.

Two kinds of write-up live here:

- **Postmortems** — a real failure, its root cause, the fix, and the rule that came out of it. No
  hindsight heroics; the timeline is what actually happened, including the part where it kept failing.
- **Architecture decision records (ADRs)** — a real fork in the road, the options on the table, the
  call that was made, and the consequences accepted. Decisions, not just outcomes.

Every entry here is from a system that shipped (the Sovereign SDLC engine, Agency OS), drawn from the
real `memory/scars.md`, the `INC-*` incident log, and a 2026 architecture review. The point of
publishing your own postmortems is the same as the point of running them internally: a failure you
can name is a failure that stops recurring.

| Entry | Type | What it cost / decided |
|-------|------|------------------------|
| [The 49-garbage-files collapse](postmortem-output-quality-collapse.md) | Postmortem | Two days lost; a "passing" pipeline that produced unusable output. Why "it ran" ≠ "it worked". |
| [Documentation drift in a fast-moving model market](postmortem-provider-drift.md) | Postmortem | Silent wrong-model selection; why docs lie and reality files don't. |
| [Keep the engine native, rent the tools](adr-keep-the-engine-native.md) | ADR | ~20 days of commodity tool-building was the real waste — not the engine. Adopt MCP through a gateway; do *not* migrate to a framework. |

---

### Why a postmortem is a credibility signal

Anyone can show you a green test suite. Showing you the run where 49 files "passed" and every one was
garbage — and then the specific gates that now make that impossible — is the thing a senior engineer
actually trusts. These are not failures hidden in a private journal; they're the reason the
[evaluation gates](../AI-ENGINEERING/evaluation.md), the [reality-first workflow](../WORKFLOWS/reality-driven-development.md),
and the [native-engine decision](adr-keep-the-engine-native.md) exist in the shape they do.
