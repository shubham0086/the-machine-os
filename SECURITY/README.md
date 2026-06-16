# Security

AI systems fail in two extra ways ordinary software doesn't: the model can be *talked into*
misbehaving (prompt injection), and the agent can *act* with real privileges (write files, run
code, call APIs). On top of that, the ordinary supply-chain risks — leaked keys, secrets in public
repos — get worse, because agent repos ship `.env.example` files, dummy keys in tests, and a lot of
generated code.

This section is not a generic OWASP-LLM restatement. Every note here is a **real incident or a real
guard from code that shipped** — what happened, what the fix was, and the pattern to reuse.

| Note | What it covers | Source |
|------|----------------|--------|
| [Output sanitization & secret scanning](output-sanitization-and-secret-scanning.md) | Redacting key-shaped strings from model output; the GitHub secret-scan false-positive on intentional test keys | Guardrails system + real scan alert |
| [Secrets & key rotation](secrets-and-key-rotation.md) | A live API key found inside a public-repo `.env`; rotate-and-relocate to a non-git parent dir | Real env-security fix |
| [Public-repo hygiene](public-repo-hygiene.md) | Internal strategy/positioning docs found in a published repo; removal + `.gitignore` hardening | Real portfolio audit |
| [Agent execution safety](agent-execution-safety.md) | Guarding an agent that writes files and runs git: banned calls, protected files, injection-safe rollback | Sovereign SDLC engine guards |
| [The MCP gateway: security isolation](mcp-gateway-security-isolation.md) | The 5 MCP attack classes, the 7 gateway controls, capability scoping — adopt MCP without exposing an autonomous engine | Designed architecture + threat model |

---

### The one-line threat model

For an autonomous agent, the dangerous primitives are **the keys it holds, the files it can write,
and the commands it can run**. Lock those three down and most of the scary scenarios lose their
teeth. The four notes here are those three primitives, each with a real story attached.
