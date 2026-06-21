# The Machine OS — Skill Contract v1.0

Every skill in this plugin is a composable unit, not a one-off prompt. It takes an input,
produces a human-readable artifact, and appends a machine-readable block so other skills,
agents, and tools can consume its output **without parsing prose**.

```
Input  ->  Analysis  ->  Human Artifact  ->  machine_output  ->  Next Actions
```

This is what turns a skill library into a skill network.

---

## 1. Tiers (classification, not folders)

All skills live flat in `skills/`. The tier is **metadata** declared in frontmatter, used
for grouping in the README and for reasoning about where a skill sits in the lifecycle.

| Tier | `tier:` value | Purpose |
|------|---------------|---------|
| Engineering | `engineering` | Build the system right |
| Security & Operations | `security-ops` | Keep it safe and running |
| Intelligence | `intelligence` | The autonomy / AI layer |

---

## 2. Frontmatter (every SKILL.md)

```yaml
---
name: <skill-id>
description: <trigger description — keep the existing trigger phrasing>
argument-hint: "<...>"
tier: engineering | security-ops | intelligence
contract: "1.0"
requires: [<artifact-id or skill-id>, ...]   # upstream inputs; [] if this is an entry point
produces: [<artifact-id>, ...]               # what this skill emits
feeds: [<skill-id>, ...]                      # downstream skills that consume this output
---
```

`requires` / `produces` / `feeds` form the **skill graph**. A `produces` id from one skill is
referenced by another skill's `requires` or `feeds`. Unknown frontmatter keys are ignored by
the Claude Code loader, so these are safe to add to live skills.

---

## 3. Output contract

Every skill ends its response with a fenced ` ```yaml ` `machine_output` block, appended
**after** the human-readable artifact — never instead of it. One response, two audiences.

Required keys: `skill`, `version`, `timestamp`, `status`, `findings`, `recommendations`,
`artifacts`, `next_actions`. (`findings` and `recommendations` may be empty arrays.)
Optional: `scorecard` (assessment skills only — see §4).

```yaml
machine_output:
  skill: <skill-id>
  version: "1.0"
  timestamp: <ISO-8601>
  status: complete | needs-input | blocked
  scorecard:                 # OPTIONAL — assessment skills only
    <dimension>: <0-100>
  findings:
    - id: F1
      severity: critical | high | medium | low
      category: <string>
      location: <file:line or component>
      description: <one line>
  recommendations:
    - id: R1
      action: <imperative>
      effort: low | medium | high
      addresses: [F1]        # finding ids this fixes (optional)
  artifacts:
    - <artifact-id this skill produced>
  next_actions:
    - skill: <downstream skill-id>
      reason: <why run it next>
```

---

## 4. Assessment skills vs Process skills

The scorecard is **conditional**, not universal. A made-up `maintainability: 87` with no
rubric is false precision and is banned.

- **Assessment skills (12)** evaluate an existing artifact against criteria. They MUST emit a
  `scorecard`, and the skill body MUST state the rubric (what each 0-100 band means).
  *code-review, architecture-review, security-review, performance-review, api-design,
  database-design, rag-review, hallucination-audit, prompt-review, agent-design, tech-debt,
  testing-strategy.*

- **Process skills (10)** run a workflow or generate a plan. They OMIT the scorecard and carry
  their state / checklist / plan in `findings` + `artifacts`.
  *requirements-analysis, system-design, architecture, debug, documentation, deploy-checklist,
  incident-response, standup, threat-model, task-decomposition.*

---

## 5. Rules

- `machine_output` is **additive**: the human report stays on top, the yaml block is appended.
- Never invent a score without a stated rubric. No rubric, no scorecard.
- `next_actions` must reference real skills in this plugin — use the skill's `feeds` list as the
  candidate set.
- `timestamp` is the run time, ISO-8601.
- `status: needs-input` when the skill asked the user a question instead of producing the artifact;
  `status: blocked` when it could not proceed.
