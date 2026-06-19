---
name: system-design
description: Design systems, services, and architectures. Trigger with "design a system for", "how should we architect", "system design for", "what's the right architecture for", or when the user needs help with API design, data modeling, or service boundaries.
argument-hint: "<system or service to design>"
---

# /system-design

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md).

Help design highly scalable systems and evaluate complex architectural decisions.

## Framework

### 1. Requirements & Constraints Definition
- **Functional Requirements:** Core user-facing features, user loops, and domain behaviors.
- **Non-Functional Requirements (NFRs):** Specific targets (e.g., target throughput (RPS), target latency P99 < 150ms, data availability constraints, geographical regions, cost thresholds).
- **Hard Constraints:** Stack choices, team constraints, time to market, or regulatory compliance (GDPR, HIPAA).

### 2. High-Level Design (C4 Model Approach)
- **Container / Architecture Topology:** Component diagrams, system communication flows, storage components, and network boundaries.
- **Data Flow & Pipelines:** Operational paths, ingestion rates, caching waterfalls, and async messaging models.

### 3. Deep Dive Analysis
- **Strict Data Modeling:** Database selection, physical schema maps, primary/secondary indexes, partitioning keys, and relationships.
- **API Contracts:** Complete API endpoint definitions (REST formats, gRPC payloads, or GraphQL schemas) with strict response structures and system status codes.
- **Caching & Replication Strategy:** Cache eviction protocols, read-replicas, write policies (e.g., write-through), and replication-lag mitigations.
- **Event-Driven Mechanics:** Partitioning strategies, dead-letter-queues (DLQ), retry logic (exponential backoff), and idempotency guarantees.

### 4. Reliability, Failover & Resiliency Matrix
For every single component defined, trace and catalog its behavior during system degradation.

| Component | Failure Scenario | Detection Method | Mitigation Strategy | Blast Radius |
|-----------|------------------|------------------|---------------------|--------------|
| e.g., Cache Store | Cluster crash | Elevated DB load | Fallback to database with active circuit breaker | Slow page loads |

## Output

Produce a highly structured, comprehensive system architecture design document containing:
1. Requirements Baseline (Functional and NFRs explicitly quantified).
2. Architecture Diagram (using Mermaid.js formatting standard).
3. API Contracts & Database Schema structures (complete with schemas/data-types).
4. System Resilience and Trade-off Matrix (detailing what we are actively optimizing for vs. what we are trading off).

## If Connectors Available

If **~~knowledge base** is connected:
- Search for prior ADRs, design docs, and existing service contracts to ground the design
- Reuse established patterns and naming conventions instead of inventing new ones

If **~~source control** is connected:
- Read the current codebase to anchor the design in what already exists
- Identify the real service boundaries and data stores in play today

If **~~project tracker** is connected:
- Link the design to related epics and create implementation tasks

## Tips

1. **Quantify the NFRs** so the design has hard targets: "10K rps, P99 under 150ms, 99.9% availability."
2. **State hard constraints upfront.** Stack, team size, deadline, and compliance all change the answer.
3. **Ask for the resiliency matrix.** The failure modes are where most designs quietly break.
