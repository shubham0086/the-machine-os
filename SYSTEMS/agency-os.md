# Agency OS

> Not one system — a system *of* systems. An orchestration engine (ACE) coordinates a research
> engine, a self-improving content-intelligence engine, a programmatic video renderer, and a CRM /
> outreach layer, so a single brief becomes a researched, scripted, rendered, QA'd, and published
> artifact with no human in the loop. Each constituent maps to a pattern extracted into a public repo.

## The problem

Running a content/marketing agency is really running five jobs at once: research, strategy, scripting,
production, and outreach. Each is its own system with its own failure modes. Agency OS is the argument
that these compose — an orchestrator on top, specialized engines underneath, one shared job model — and
that the composition is where the real engineering lives.

## The system map

```
            AGENCY DASHBOARD (Next.js)  ── job submission · live SSE progress
                         │
            ACE ORCHESTRATION ENGINE  ── FastAPI + Redis/BullMQ + Neon Postgres
            (DAG executor, job classification, SSE, dual-currency billing)
                         │
        ┌────────────────┼─────────────────┬──────────────────┐
        ▼                ▼                  ▼                  ▼
   AIOps Research    KAAL Engine        MY-VIDEO          Founder Growth OS
   (LangChain        (self-improving    (Remotion         + ChaiPitch
    multi-source)    content loop)      render-as-code)   (CRM + outreach)
```

| Constituent | What it is | Pattern → public repo |
|-------------|-----------|------------------------|
| **ACE** | Async DAG orchestrator (Kahn's topo-sort), SSE streaming, quota + Razorpay/Stripe billing, circuit-breaker routing | [agentic-saas-boilerplate](../REPOSITORIES/agentic-saas-boilerplate.md) |
| **AIOps Research** | LangChain agent over SerpAPI/Tavily/Brave with auto-failover + relevance/sentiment scoring | [research-agent](../REPOSITORIES/research-agent.md) |
| **KAAL** | Self-improving content intelligence: a metrics → insight → directive feedback loop | content-intelligence (media track) |
| **MY-VIDEO** | Programmatic 9:16 renderer: JSON scene-DNA → React/Remotion → headless Chrome → MP4 | [video-engine-starter](../REPOSITORIES/video-engine-starter.md) |
| **Founder Growth OS / ChaiPitch** | 22-page CRM + Hinglish outreach + Instagram comment-to-DM | (sales arm) |

## The content pipeline (ACE's flagship workflow)

The six-agent pipeline is what ACE looks like pointed at content production. Each agent has one job,
one prompt shape, one output contract; output of step N is the typed input of N+1:

Brief Intake (classify + extract constraints) → Research (AIOps) → Content Strategist (KAAL: hooks,
tone) → Creator (copy/DM/script with pacing markers) → QA Gate (compliance, brand safety, EN/HI/Hinglish
tone) → Formatter (packaging + metadata).

## Three pieces of real engineering worth calling out

### 1. KAAL: a self-improving loop, not a passive template

Most "AI content" runs a prompt and stops. KAAL closes a reinforcement loop: every published asset is
scored by a custom **TrueScore** metric (`retention×0.4 + saves×0.3 + comments×0.3`), platform metrics
are scraped back and mapped to specific script segments, and the intelligence layer turns the winners
into *directives* that seed the next generation of scripts. The system gets better from real outcomes,
not from vibes. A separate **Visual Entropy Scorer** is the cost-conscious half: a *heuristic*
(non-LLM) pass parses the timeline JSON, detects low-entropy zones (e.g. >120 static frames), and
auto-injects Ken Burns zooms / B-roll / jump-cuts — interventions that prevent viewer drop-off without
paying for an LLM call.

### 2. Operational maturity (the part that survives real users)

The orchestration layer is where a pile of agents becomes a system you can leave running:

- **Disk-persistent runs that survive restarts** — any run still `running` after a restart is
  explicitly flipped to `interrupted`, never silently lost.
- **Per-key sliding-window rate limiting** — a rolling window, so abuse can't burst-and-wait.
- **A background GC sweeper** — policy *per collection* (active runs outlive any TTL; stale counters
  die eagerly), so memory doesn't grow unbounded.
- **SSE with reconnect-replay** — a 50-event ring buffer per run replays missed events when a dashboard
  client reconnects, instead of stranding the UI on a stale state. SSE over WebSocket on purpose:
  it survives the proxy/firewall configs WebSockets struggle with.
- **A circuit breaker with real states** — Closed → (2 failures) → Open → (15s) → Half-Open probe,
  with fallback to an alternate provider or an offline mock so the pipeline never hard-locks.

### 3. Production hardening (security baked in, not bolted on)

- **Shell-injection defense** — every process spawn (Remotion CLI, Python) uses parameterized,
  array-based `execFileSync` with regex-enforced UUID validation. This is the exact pattern in
  [agent execution safety](../SECURITY/agent-execution-safety.md), shipped.
- **Atomic queue locks** — a directory-based lock (`.job_queue.json`) prevents race conditions across
  parallel pipeline runs.
- **Row-Level Security** — Supabase tables (reels, hooks, metrics, runs) carry brand-level RLS so
  tenants can't read each other's data.
- **Hybrid zero-cost routing** — MiniMax M2.5 (free via OpenCode Zen) primary → OpenAI/Anthropic →
  local Ollama, so critical paths run at ~$0/month with paid models reserved for high-quality reviews.

## Honest status

Built, runs internally, **pre-revenue**, targeting Indian SMBs and creator-founders. Published as a
**case-study repo** — architecture and orchestrator excerpts public; the constituent engines' full
source stays private to preserve the commercial moat. The Hinglish-native outreach (ChaiPitch) is a
real-market decision, not a model decision: Western corporate templates get materially lower reply
rates in Indian B2B WhatsApp.

## Where it sits now

The 2026 multi-agent conversation over-indexes on agent *reasoning* and under-indexes on the layer that
decides whether a pipeline survives real users — persistence, backpressure, reconnects, GC, tenant
isolation. Agency OS is a deliberate argument that *composition + the operational layer* is the
engineering, and that a self-improving feedback loop (KAAL) beats a smarter one-shot prompt.

---

**Built on:** [agentic-saas-boilerplate](../REPOSITORIES/agentic-saas-boilerplate.md). **Constituents map to:** [research-agent](../REPOSITORIES/research-agent.md), [video-engine-starter](../REPOSITORIES/video-engine-starter.md). **Related:** [The Sovereign SDLC engine](the-sovereign-sdlc-engine.md) · [WellnessInYou / BODH](wellnessinyou-bodh.md) · [ARCHITECTURES/multi-agent-orchestration](../ARCHITECTURES/multi-agent-orchestration.md) · Recipe: [Build an agent team](../SYSTEM-RECIPES/build-an-agent-team.md)
