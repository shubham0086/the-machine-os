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
- [x] **SECURITY/** - output sanitization, secret/key rotation, public-repo hygiene, agent execution safety (real incidents + engine guards, not a generic OWASP restatement)
- [x] **WORKFLOWS/** - the Claude Code self-healing loop, reality-driven development, repo-publishing compliance
- [x] **SYSTEMS/** - deep write-ups of the production systems (Sovereign SDLC engine, Agency OS, the live portfolio RAG chatbot)

> CI/CD for agents is *not* shipped under WORKFLOWS — there's no real CI/CD pipeline in these systems
> yet, so it stays parked below rather than written up from theory.

## Later (v3 - parked on purpose)

These are real ambitions, not vaporware - but they ship only when there's signal worth
publishing. Listing them here instead of as empty folders is the whole point.

- [ ] **AI-ENGINEERING/** - prompting, evaluation, context engineering, tool-calling, fine-tuning
- [ ] **PLAYBOOKS/** - startup MVP, AI SaaS, consultant engagement, repo audit, security review
- [ ] **WORKFLOWS/ci-cd** - CI/CD for agents (parked until a real pipeline exists to write up)
- [ ] **BENCHMARKS/** - models, frameworks, vector DBs, embeddings - *only with real numbers*
- [ ] **CASE-STUDIES/** - production failures, postmortems, architecture decision records
- [ ] **RESOURCES/** - a curated short list, not an exhaustive link dump
- [ ] **RESEARCH/** - the autonomy-ladder thesis and where agent systems are heading

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
