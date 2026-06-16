# WellnessInYou / BODH

> The shipped, consumer-facing product in the portfolio — a full-stack wellness ecosystem (Next.js 15
> web + Expo 54 React Native mobile) with a real async multi-agent AI pipeline and security
> engineering done properly: hardware-encrypted storage, leak-proof SSO, redacted telemetry, and
> idempotent payment webhooks. This is the "proof of production," not a claim of it.

## Why it's in a handbook about AI *systems*

Most of this handbook is agent infrastructure. WellnessInYou earns its place for two reasons. First,
its AI layer is a textbook case of running an LLM pipeline **inside a real product's constraints** —
serverless timeouts, runaway-cost risk, multi-tenant data. Second, it's the answer to the fair
challenge every infra portfolio gets: *"but have you actually shipped a product to real users?"* The
Sovereign SDLC engine is honest that it's a builder's tool, not a product; WellnessInYou is where the
product engineering lives.

## The AI pipeline: an LLM workflow that respects production limits

Generating an in-depth psychological + Ayurvedic wellness plan takes longer than a serverless function
is allowed to run (e.g. a 10s lambda limit). The design works *with* that limit instead of fighting it:

- **Async, out-of-band.** A user's health metrics are handed to a **CrewAI** multi-agent team
  (running on Gemini 3.1 Pro) in the background; the request returns immediately. The agents perform
  the analysis and compile a high-fidelity PDF plan off the request path.
- **A 24-hour cost cap, in code.** Results are cached in Postgres with a `lastAnalyzedAt` timestamp; a
  cache-validation check (bypassable only via an authenticated `?force=true`) prevents the same expensive
  multi-agent run from firing repeatedly. This is the same instinct as the SDLC's cost enforcer —
  **LLM spend is a bounded, enforced quantity, not a surprise on the bill** — applied to a consumer app.

## Four pieces of real security engineering

These are the kind of problems that don't show up in a demo and absolutely show up in production:

### 1. A leak-proof WebView SSO bridge
The mobile app renders web-portal pages inside a WebView. The naive approach passes the session token
as a query parameter (`?token=jwt`) — which leaks it to referrers, server logs, and redirect attacks.
The fix: intercept WebView requests, verify them against a strict host allowlist, pass the JWT *only*
in the `Authorization` header to a dedicated endpoint that verifies server-side, sets an HTTP-only
cookie, and 302-redirects. Every query-string token exposure eliminated.

### 2. Hardware-encrypted local storage with self-healing migration
Sensitive health data (journals, AI coach chat logs) sits on-device. Plaintext `AsyncStorage` (the RN
default) loses it all if the device is compromised. The fix: a data-access wrapper over
`expo-secure-store` (hardware-backed AES-256-GCM keychain), plus a migration that detects legacy
plaintext data on first read, moves it into the keychain, and **wipes the insecure source** — so
existing users are upgraded silently with no data loss.

### 3. Telemetry redaction (output sanitization, product edition)
Crash logs and trackers love to ingest PII, JWTs, and health declarations by accident. A centralized
logger recursively parses and **redacts sensitive keys** (`Authorization`, `token`, `password`,
`email`, `medicalConditions`, …) before anything is printed or sent to remote monitoring. This is the
exact pattern in [output sanitization](../SECURITY/output-sanitization-and-secret-scanning.md) — treat
your *own* outbound data as untrusted — applied to logs instead of model output.

### 4. Idempotent, signature-verified payment webhooks
Razorpay and Stripe webhooks fire multiple times; naive handlers double-charge or double-grant. The
fix is two layered defenses: **SHA-256 HMAC signature verification** with a constant-time compare
(`hmac.compare_digest`) so a forged `payment.captured` can't spoof an upgrade, and an **idempotent
schema** — inside a Prisma transaction, a known transaction ID short-circuits to `200 OK` before any
state change. No double-spend, no payment spoofing.

## The stack, briefly

Next.js 15 (App Router) + React 19 web · Expo 54 / React Native mobile · Prisma + Neon Postgres ·
Upstash Redis (distributed rate limit) · Clerk auth · CrewAI + Gemini 3.5 Flash / 3.1 Pro · Razorpay +
Stripe · Sentry with a PII-redaction layer · a 51-test Playwright E2E suite (parallelized; runtime cut ~35%).

## Honest status

The web portal (wellnessinyou.in) is **live**; the **BODH mobile app is in closed app-store beta**
(TestFlight / Play closed testing) and the product is **pre-revenue — no paying users yet**. That's the
honest line, and it's still a strong one: the unproven part is distribution/GTM, not the engineering.
Shipping a cross-platform product solo — web + native mobile + an AI pipeline + payments, security-
hardened and E2E-tested — is the hard, learnable-by-few part; distribution is the learnable-by-many part
that comes next. ("BODH" is also reused internally as the name of an unrelated React dashboard on the
SDLC engine — different things, same word.) Full source is private; what's public is the architecture
and the engineering decisions.

## Where it sits now

The 2026 reality for AI products is that the *model call is the easy 10%* — the hard 90% is shipping it
safely inside a real app: async around serverless limits, cost caps so a multi-agent run can't bankrupt
you, encryption and redaction so health data doesn't leak, idempotency so payments don't double. This
system is that 90%, done.

---

**Related:** [Agency OS](agency-os.md) (the other production system) · [The Sovereign SDLC engine](the-sovereign-sdlc-engine.md) · [SECURITY/output-sanitization & secret scanning](../SECURITY/output-sanitization-and-secret-scanning.md) · [SECURITY/secrets & key rotation](../SECURITY/secrets-and-key-rotation.md)
