# Secrets & key rotation

> A gitignored `.env` inside a public repo folder is one `git add -f`, one tooling mistake, or one
> wrong-glob away from a leak. The safe place for a key is somewhere git physically cannot reach.

## The real incident

A live Gemini API key was sitting in `repos/.../rag-knowledge-engine/.env` — *inside* a folder that
is itself a public git repo. It was gitignored, so it had never been committed. But "gitignored
inside a public repo" is a weak guarantee:

- a `git add -f`, an over-broad `git add .` after an ignore-rule edit, or a misconfigured tool can
  stage it anyway,
- and the key's blast radius if it *did* leak is real: quota theft, abuse billed to you, and (on a
  paid tier) direct cost.

## The fix: rotate, then relocate out of git's reach

Two moves, in order:

1. **Rotate the key.** Once a secret has lived somewhere it shouldn't, treat it as burned. The old
   key was revoked and a new one issued — you cannot "un-expose" a credential, you can only replace
   it.
2. **Relocate to a non-git parent directory.** The new key (and all the failover-provider keys) moved
   to `D:\dev\Shubham-Portfolio-Analysis\.env` — the parent folder, which is **not a git repository
   at all**. A secret that lives above every repo root cannot be committed to any of them, no matter
   what `git add` does. Local tooling still reads it (VS Code's `python.envFile` points there), so dev
   ergonomics are unchanged.

For deployed code, the same principle is "the secret lives in the platform's secret store, never in
the repo" — the portfolio chatbot's production keys live in the Vercel environment dashboard, not in
any file.

## The reusable rule

> **A key belongs in exactly one of two places: the platform secret store (for deployed code) or a
> directory that is not under any git root (for local dev). Never inside a repo, gitignored or not.**

And the order on exposure is always **rotate first, investigate second** — the opposite of the
false-positive case in [output sanitization](output-sanitization-and-secret-scanning.md), where a
*test fixture* that looks like a key should be verified before anyone rotates anything. The
discriminator: is the exposed string a real, live credential? Real → rotate now. Test fake → verify,
don't rotate.

## Where it sits now

Secret sprawl got worse with AI-assisted development, not better: generated code scaffolds `.env`
files freely, agents read and write config, and more repos ship per-provider keys for failover
chains. Push-protection secret scanning (GitHub and others) is now on by default and is a real safety
net — but it catches leaks at push time, after the secret already exists in a working tree. Keeping
the credential physically outside every git root removes the failure mode instead of detecting it.

---

**Related:** [Output sanitization & secret scanning](output-sanitization-and-secret-scanning.md) · [Public-repo hygiene](public-repo-hygiene.md) · [WORKFLOWS/repo-publishing-compliance](../WORKFLOWS/repo-publishing-compliance.md)
