# Public-repo hygiene

> The leak that hurts a solo builder is rarely a password. It's the strategy doc, the positioning
> analysis, the internal plan — context you never meant to publish, sitting in a public repo because
> the working directory and the published directory were the same folder.

## The real incident

A routine audit of the public portfolio repo found two files that did not belong there:

- `PLAN.md` — an internal strategy / roadmap document
- `career_positioning_analysis.md` — a private positioning analysis

Neither is a credential. Neither would trip a secret scanner. Both were genuinely sensitive — they
exposed strategy and intent — and both were public because the local planning files lived in the same
tree that gets pushed.

## The fix: remove, ignore by pattern, keep locally

1. **Remove from the published repo and push the removal** — the files were deleted from the website
   repo and a cleanup commit pushed so they're gone from the remote. (Note: `git` history still holds
   them unless you rewrite history; for truly sensitive data that matters, but for already-low-stakes
   strategy notes a removal commit was judged sufficient.)
2. **Harden `.gitignore` with *patterns*, not just filenames**, so the whole *class* of file can never
   be re-added:
   ```gitignore
   PLAN.md
   *positioning*.md
   *strategy*.md
   *planning*.md
   scratch/
   ```
3. **Keep the files locally** — they were restored to the parent planning directory (outside the repo,
   same principle as [secrets & key rotation](secrets-and-key-rotation.md)). The content is still
   useful; it just lives where it can't be published.

## The reusable rule

> **Decide what a repo is *for*, then keep everything else physically outside it.** A public repo is
> a publishing surface, not a working directory. Strategy, positioning, planning, and scratch work go
> in a sibling folder that is not under the repo root, and the repo's `.gitignore` blocks the patterns
> as a backstop.

The pattern-based ignore is the load-bearing part: filename-only ignores protect the one file you
thought of; `*strategy*.md` protects every future file you haven't named yet.

## Where it sits now

Two 2026 pressures make this sharper. First, AI-assisted workflows generate a lot of intermediate
artifacts — plans, analyses, notes — that pile up in the working tree. Second, those same public
repos are now scraped and ingested by AI crawlers for training and search, so a leaked strategy doc
doesn't just sit unnoticed in a repo, it can end up summarised in an answer engine. The cost of "I'll
clean it up later" went up.

---

**Related:** [Secrets & key rotation](secrets-and-key-rotation.md) · [Output sanitization & secret scanning](output-sanitization-and-secret-scanning.md) · [WORKFLOWS/repo-publishing-compliance](../WORKFLOWS/repo-publishing-compliance.md)
