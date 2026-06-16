# Repo publishing compliance

> "Push the repo" sounds like one action. It hides a dozen: is there a leaked key, does a stranger
> know how to run it in five minutes, are the guardrails actually on, is the LICENSE right. A
> checklist turns a risky vibe into a repeatable gate.

## The decision

A portfolio of open-source repos only helps you if each repo is *safe to publish* and *usable by a
stranger*. Both fail silently. Nobody files a bug saying "your README assumes context I don't have"
or "you shipped a real key" — they just leave. So publishing runs through a fixed checklist applied
identically to every repo, the same way the compliance audit was applied across `agentic-patterns`,
`agentic-systems`, and `agentkernel` in one pass.

## The checklist

**Safe to publish**
- [ ] No real secrets anywhere — and the *fake* keys in tests are obviously fake (see
      [output sanitization](../SECURITY/output-sanitization-and-secret-scanning.md))
- [ ] No internal docs in the tree — strategy/positioning/planning files excluded by `.gitignore`
      *pattern*, not just filename (see [public-repo hygiene](../SECURITY/public-repo-hygiene.md))
- [ ] `.env.example` present and documented — every required var, with free-tier links and what
      happens if it's missing
- [ ] LICENSE correct for the content type (MIT for code, CC BY 4.0 for writing)

**Usable by a stranger**
- [ ] A quick-start that runs in 3–6 steps, not 7+
- [ ] Runs offline / keyless by default where possible (mock mode), so the first run needs no signup
- [ ] A "pick your path" on-ramp for different skill levels, not one wall of text
- [ ] An explicit problem → solution framing so a reader knows in ten seconds whether this repo is for
      them

**Actually production-shaped**
- [ ] Guardrails (input + output) verified by tests, not just claimed
- [ ] `CONTRIBUTING.md` present — even solo, it signals the repo is maintained and sets the security
      bar for any PR

## Why a checklist beats judgment

The compliance audit found the same gaps repeated across repos — a missing `.env.example` here, a 7-step
quick-start there, guardrails tested in one repo but only asserted in another. None were hard to fix;
all were easy to *miss* doing it by feel. A list applied uniformly is how three repos reach the same
bar in one session instead of drifting to three different ones.

## Where it sits now

Two 2026 realities raise the stakes on the "safe to publish" half. AI-assisted development generates
more incidental files (plans, scratch, generated config) that end up in the tree, and public repos are
now ingested by AI crawlers — so a leak doesn't sit quietly, it propagates into answer engines. The
"usable by a stranger" half matters more too: with an infinite supply of generated repos, the ones
that win are the ones a reader can run and understand immediately.

---

**Related:** [Secrets & key rotation](../SECURITY/secrets-and-key-rotation.md) · [Public-repo hygiene](../SECURITY/public-repo-hygiene.md) · [Output sanitization & secret scanning](../SECURITY/output-sanitization-and-secret-scanning.md)
