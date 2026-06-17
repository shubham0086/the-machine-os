# Roadmap

The Machine OS is a handbook for building **AI systems that don't break in production**.
It ships in layers. This page is the honest scope: what exists, what's next, and what's
deliberately parked. Nothing here is an empty folder pretending to be content - a section
only graduates into the repo once it has real, runnable, or cited material behind it.

> Convention: a folder ships only when it has **≥2 real pieces**. Until then it lives here
> as a checklist item, not a directory.

---

## Shipped (v1 skeleton)

- [x] **README** - the map: start here, pick your path, the autonomy ladder
- [x] **REPOSITORIES/** - index card per open-source repo (problem → architecture → lessons)
- [x] **FIELD-NOTES/** - pointers to the long-form essays (canonical home: the blog)
- [x] **SYSTEM-RECIPES/** - "build a RAG system / MCP server / agent team" entry points

## Shipped (v2 - depth)

- [x] **ARCHITECTURES/** - agent anatomy, multi-agent orchestration, memory, routing/resilience, MCP
- [x] **SECURITY/** - output sanitization, secret/key rotation, public-repo hygiene, agent execution safety, the MCP gateway threat model (real incidents + engine guards, not a generic OWASP restatement)
- [x] **WORKFLOWS/** - the Claude Code self-healing loop, reality-driven development, repo-publishing compliance
- [x] **SYSTEMS/** - deep write-ups of the production systems (Sovereign SDLC engine, Agency OS as a system-of-systems, WellnessInYou/BODH shipped product, the live portfolio RAG chatbot)

> CI/CD for agents is *not* shipped under WORKFLOWS — there's no real CI/CD pipeline in these systems
> yet, so it stays parked below rather than written up from theory.

## Shipped (v3 - the craft layer)

- [x] **AI-ENGINEERING/** - prompting as a contract, context engineering, evaluation, tool-calling. Four notes grounded in the real Coder prompt, the SQLite memory-routing policy, the three-layer RAG filter, RAGAS + TrueScore evals, and the deterministic tool boundary — each tied to current 2026 practice (structured output, context engineering, tiered LLM-as-judge, MCP).

> Fine-tuning is deliberately left out of AI-ENGINEERING: none of these systems fine-tune a model
> (they route across hosted providers), so writing it up would be theory. It stays parked below.

- [x] **CASE-STUDIES/** - postmortems + ADRs from real `memory/scars.md` and the `INC-*` log: the 49-garbage-files quality collapse (why "it ran" ≠ "it worked"), documentation drift in a fast-moving model market, and the ADR to keep the engine native / rent the tools via MCP. Operational failures and decisions, distinct from the SECURITY guards.
- [x] **WORKFLOWS/eval-driven-development** - the discipline that came out of the 49-files collapse: write the gate with the feature, gate on substance not "it ran", evals-as-guards, separate the eval harness from the agent harness.
- [x] **RESEARCH/** - the forward-looking section: the autonomy-ladder thesis (climb only as high as the problem needs; the loop is the dividing line) and where agent systems are heading (A2A, agent identity, small/specialised models, ambient agents - signal vs hype, grounded against this work).

## Later (parked on purpose)

These are real ambitions, not vaporware - but they ship only when there's signal worth
publishing. Listing them here instead of as empty folders is the whole point.

- [ ] **AI-ENGINEERING/fine-tuning** - parked until a real fine-tune ships (the rest of AI-ENGINEERING is live above)
- [ ] **PLAYBOOKS/** - startup MVP, AI SaaS, consultant engagement, repo audit, security review
- [ ] **WORKFLOWS/ci-cd** - CI/CD for agents (parked until a real pipeline exists to write up)
- [ ] **BENCHMARKS/** - models, frameworks, vector DBs, embeddings - *only with real numbers*
- [ ] **RESOURCES/** - a curated short list, not an exhaustive link dump

## Explicitly out of scope (here)

Identity stays focused on **production AI systems engineering**. The following live on the
[portfolio site](https://my-portfolio-github-io-beta-five.vercel.app), not in this repo:
career/resume material, certifications, and personal-philosophy writing.

---

## The 10 pillar essays

The spine of the handbook. Six are written; four are queued, each shipping as its own launch.

| # | Essay | Status |
|---|-------|--------|
| 1 | The Vibe Coding Hangover | ✅ live |
| 2 | The Token-Mix Fallacy | ✅ live |
| 3 | Why I Banned Probabilistic Control Flow | ✅ live |
| 4 | Stop Building Toy MCP Servers | ✅ live |
| 5 | Hybrid Retrieval Beats Vector Search (RAG in practice) | ✅ live |
| 6 | Zero-Cloud Local RAG | ✅ live |
| 7 | Agent Circuit Breakers | ⏳ queued |
| 8 | Production Postmortems | ⏳ queued |
| 9 | The AI Security Playbook (OWASP + agents) | ⏳ queued |
| 10 | Building AI Systems That Survive 3 AM | ⏳ queued |
