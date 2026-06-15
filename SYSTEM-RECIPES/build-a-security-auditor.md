# Recipe: Build a Security Auditor

An agent that reviews code or configurations for security issues - with guardrails so the
auditor itself can't be turned against you.

## The shape

1. **Scope the context.** Use a dependency graph + blast radius so the auditor reads the code
   that matters, not the whole repo.
2. **Run input/output guardrails** tested against real prompt-injection and secret-leakage
   payloads - an auditor that leaks secrets is worse than none.
3. **Persist findings as memory** so the auditor doesn't re-flag known-accepted issues or
   repeat past mistakes.
4. **Keep control flow deterministic** so a scan terminates instead of looping.

## Why each step

A security tool has to be more trustworthy than what it audits. The guardrails and bounded
control flow aren't features - they're the precondition for using it at all.

## Clone and run

- **Source repos:** [agentkernel](../REPOSITORIES/agentkernel.md) (guardrail engines, tested vs real payloads) · [agent-context](../REPOSITORIES/agent-context.md) (blast radius) · [agent-scars](../REPOSITORIES/agent-scars.md) (finding memory)
- **Field note:** [AI Agent Guardrails](../FIELD-NOTES/ai-agent-guardrails.md)
- **Architecture/Playbook:** `SECURITY/` (OWASP-LLM mapping, threat models) - v2, see [ROADMAP](../ROADMAP.md)
