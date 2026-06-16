# Agency OS

> Six specialized agents turn a single client brief into a shipping content artifact — research,
> strategy, copy, QA, formatting — with no human in the loop. The interesting engineering isn't the
> agents; it's everything that keeps the pipeline alive when the real world interferes.

## The problem

Content production for an Indian-market audience takes a human crew: research, strategy, copywriting,
QA, formatting, scheduling. Agency OS replaces that crew with six agents that run in sequence, stream
progress live to a dashboard, and produce a shipping artifact from one brief. Built on the
[agentic-saas-boilerplate](../REPOSITORIES/agentic-saas-boilerplate.md) engine (DAG orchestration, SSE
streaming, geo-routed billing).

## The six-agent pipeline

| # | Agent | Job | Output contract |
|---|-------|-----|-----------------|
| 1 | Brief Intake | classify job type, complexity, language; extract constraints | structured brief JSON |
| 2 | Research | multi-source scraping + competitor analysis | source notes + citations |
| 3 | Content Strategist | visual hooks, emotional triggers, tone | strategy spec |
| 4 | Creator | copy / WhatsApp DMs / script with pacing markers | draft content |
| 5 | QA Gate | regulatory compliance, brand safety, native tone (EN/HI/Hinglish) | pass/fail + notes |
| 6 | Formatter | final packaging + metadata (posting peaks, hashtags, cost) | shipping artifact |

Each step is durable, observable, and re-runnable; output of step N is the typed input of step N+1.
One job, one prompt shape, one output contract per agent.

## The operational maturity (the actual moat)

A pile of agents in sequence is a weekend project. These five things are why it survives production:

1. **Disk-persistent runs that survive restarts.** Multi-agent runs take 30–90s. If the server
   restarts mid-run, a naive in-memory orchestrator loses state silently. Every run is persisted to
   disk; on restart, any run still marked `running` is explicitly flipped to `interrupted` with an
   error — failure is *visible*, never a silent disappearance.

2. **Per-API-key sliding-window rate limiting.** Multi-tenant API, per-tenant hourly cap, enforced as
   a *rolling* window (not a fixed bucket) so abuse can't burst-and-wait at the window boundary.

3. **A background GC sweeper.** Run state, SSE event rings, and rate-limit counters all accumulate.
   A sweeper every 30 minutes evicts runs older than 24h from RAM (disk retained for audit), GCs empty
   SSE subscriber lists, and clears stale rate-limit entries. Policy *per collection* — active runs
   must outlive any uniform TTL, stale counters should die eagerly — which is why it's a sweeper, not a
   blanket TTL.

4. **SSE with reconnect-replay ring buffer.** Each run keeps a ring buffer of its last 50 events. When
   a dashboard client drops (mobile blip, Wi-Fi handoff) and reconnects, the server *replays* missed
   events instead of stranding the UI on a stale state. SSE over WebSocket on purpose: it survives
   Nginx/Cloudflare/firewall configs WebSockets struggle with, and the ring buffer adds the one thing
   SSE lacks.

5. **Hybrid zero-cost LLM routing.** Critical paths run free (MiniMax M2.5 via OpenCode Zen primary,
   OpenAI/Anthropic secondary, local Ollama fallback), so the backend runs at ~$0/month on critical
   paths during development and low-tier plans, with paid models reserved for high-quality reviews.

## Decisions worth calling out

- **Disk persistence over pure Redis state** — Redis loss = run loss; JSON-on-disk gives auditability
  and zero-config crash recovery. Redis is for pub/sub and ephemeral counters, not authoritative state.
- **Hinglish-native content** — the outreach copy is tuned for casual Hindi-English code-mixing, the
  actual register of Indian B2B WhatsApp. Western corporate templates get ~3× lower reply rates here.
  A real-market decision, not a model decision.

## Honest status

Built, runs internally, **pre-revenue**, targeting Indian SMBs and creator-founders. Published as a
case-study repo — architecture and orchestrator excerpts public, full source private to preserve the
commercial moat.

## Where it sits now

The 2026 multi-agent conversation over-indexes on agent *reasoning* and under-indexes on the
operational layer — persistence, backpressure, reconnects, GC — that decides whether a pipeline
survives contact with real users. Agency OS is a deliberate argument that the operational layer *is*
the engineering.

---

**Built on:** [agentic-saas-boilerplate](../REPOSITORIES/agentic-saas-boilerplate.md). **Related:** [The Sovereign SDLC engine](the-sovereign-sdlc-engine.md) · [ARCHITECTURES/multi-agent-orchestration](../ARCHITECTURES/multi-agent-orchestration.md) · Recipe: [Build an agent team](../SYSTEM-RECIPES/build-an-agent-team.md)
