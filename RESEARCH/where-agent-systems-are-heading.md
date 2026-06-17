# Where agent systems are heading

> The reliability problems that filled this handbook — memory, context, routing, drift, evals — are
> turning into *solved patterns*. That's the tell that the frontier has moved. The next hard problems
> aren't about making one agent reliable. They're about what happens when reliable agents have to deal
> with each other, with their own permissions, and with acting before anyone asks.

This is the one speculative note in the handbook, so it's held to the strictest version of the house
rule: separate signal from hype. For each direction below — what's actually load-bearing, and where this
body of work stands.

## 1. Agents talking to agents (the protocol layer climbs again)

MCP solved *agent-to-tool*. The 2026 move is **agent-to-agent (A2A)** — a protocol for agents to
discover, delegate to, and transact with *other* agents. It has real backing (Google's A2A with 50+
partners including SAP, Salesforce, PayPal), and the credible 2027 prediction is at-scale agent-to-agent
*commerce* — software agents negotiating and transacting on behalf of their principals with no human per
transaction.

**Signal vs. hype:** the protocol is signal; the "agentic web runs the economy by next year" framing is
hype. The honest read is that A2A is MCP's story repeating one rung up — and the [native-engine
ADR](../CASE-STUDIES/adr-keep-the-engine-native.md) already wrote the playbook: *differentiate vs. rent,
and mediate the boundary.* The same gateway logic that makes MCP safe (untrusted input, capability
scoping, audit) will be mandatory for A2A, for the same reason. **Where this work stands:** has the tool
protocol (MCP) and the threat model for it; does *not* yet have an agent-to-agent layer. That's the
clearest single gap.

## 2. Agents with identities (the security category nobody had)

An autonomous agent that holds an OAuth token *is* a privileged actor, and 2026 made that a product
category: governed agent identities, scoped and short-lived credentials, and audit trails built
specifically for agents (CrowdStrike, Descope, Microsoft's Entra agent identity, and others). The
confused-deputy and token-theft attack classes in the [MCP threat model](../SECURITY/mcp-gateway-security-isolation.md)
are exactly the problem these address.

**Signal vs. hype:** pure signal, and under-hyped relative to its importance. "Agent identity" is just
service-account discipline catching up to the fact that the service account can now be *talked into*
things. **Where this work stands:** had *capability scoping* (which tools a role may call) but not *agent
identity* (who the agent is, what credential it carries, how that's scoped and revoked) — so that became
the first forward bet built: [agent-identity](../REPOSITORIES/agent-identity.md), a scoped /
short-lived / signed credential broker with audit and revocation, written up in
[SECURITY/agent identity & authz](../SECURITY/agent-identity-and-authz.md). The most natural extension of
the security work already here, and the highest-leverage one.

## 3. Smaller, specialised models (the cost curve bends)

The forecast that organisations will use task-specific small models ~3× more than general-purpose LLMs by
2027 is the economic counterweight to "just call the frontier model." Small, distilled, or RL-tuned
models for narrow tasks are cheaper, faster, and — because their behaviour is narrower — often *more
predictable*, which is a reliability argument as much as a cost one.

**Signal vs. hype:** signal, with a caveat — "small models replace frontier models" is wrong; "a fleet of
small models handles the 80% of calls that are routine, frontier models handle the hard 20%" is right, and
it's a *routing* problem, which is familiar territory. **Where this work stands:** has the multi-provider
router and cost enforcer that would *dispatch* to small models, but has deliberately never *fine-tuned*
one — these systems route hosted providers. That's the one parked frontier the handbook is honest about
(see [ROADMAP](../ROADMAP.md)); it's a real bet, not a gap to paper over.

## 4. Agents that act before asked (ambient, and the reliability bill comes due)

The 2026 "Autopilot" / always-on category (e.g. Microsoft's Scout, with its own governed identity) is the
shift from *request-response* agents to **ambient** ones — long-running, event-triggered, proactive. This
is the literal "predictive" direction: an agent that notices a condition and acts, rather than waiting for
a prompt.

**Signal vs. hype:** the capability is signal; the readiness is overstated. An agent that acts unprompted,
unattended, at machine speed is the *exact* configuration that makes every failure mode in this handbook
catastrophic instead of annoying — the [49-files collapse](../CASE-STUDIES/postmortem-output-quality-collapse.md)
with no human watching. Which is why the genuinely next discipline isn't a new capability at all; it's
**reliability engineering for agents**: SLOs, error budgets, eval-as-runtime-guardrail, simulation before
deploy, standardised tracing (OpenTelemetry's GenAI conventions). **Where this work stands:** this is the
home brand, and the second forward bet built starts it concretely — [agent-sim](../REPOSITORIES/agent-sim.md),
a pre-deploy simulation harness that runs an agent through adversarial scenarios and gates on SLOs and
regression (the runnable form of [eval-driven development](../WORKFLOWS/eval-driven-development.md)). The
most defensible direction precisely because ambient agents make it non-optional: the capability frontier
and the reliability frontier are the same frontier, seen from two sides.

## The through-line

Every one of these is a *systems* problem wearing a new name. A2A is a protocol-and-gateway problem. Agent
identity is an authz problem. Small models are a routing problem. Ambient agents are a reliability problem.
None of them is solved by the model getting smarter — which is the whole bias of this section, and the
reason the next two years reward the people who build scaffolding over the people who chase capabilities.
The model is still the least reliable component and the only one you can't make deterministic. That hasn't
changed. The blast radius of trusting it has.
