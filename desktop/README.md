# The Machine OS on Claude Desktop

The Machine OS ships as a Claude Code plugin (`/plugin install`). Claude Desktop uses a
different delivery model, so this folder packages the same assets for Desktop:

- **Skills** → one ZIP per skill, uploaded via **Customize → Skills**.
- **MCP tools (spokes)** → packaged as `.mcpb` extensions in each spoke's own repo (see
  [agent-context](https://github.com/shubham0086/agent-context) for the first one). Not built
  here; this folder is skills only.

The skill bodies are **not** edited in place — the build stages copies and only rewrites the
two shared-doc links so each ZIP is self-contained.

## Build the skill ZIPs

```bash
node desktop/build-desktop-skills.mjs            # all skills -> dist/desktop-skills/*.zip
node desktop/build-desktop-skills.mjs --only code-review   # build one (pilot)
```

No npm dependencies. Zipping uses the platform archiver (PowerShell `Compress-Archive` on
Windows, `zip` elsewhere). Output (`dist/`) is gitignored.

Each ZIP contains a top-level `<skill>/` folder with `SKILL.md` plus local copies of
`CONNECTORS.md` and `SKILL-CONTRACT.md` (the `../../` links are rewritten to point next to
the SKILL.md).

## Install in Claude Desktop

1. **Customize → Skills → Browse skills → Upload**.
2. Upload a `dist/desktop-skills/<skill>.zip`.
3. The skill registers and triggers on its description (the same trigger phrasing as in
   Claude Code). Skills also appear in Cowork.

## Notes / things to verify on first upload

- **Frontmatter:** SKILL.md carries Machine OS keys beyond `name`/`description` (`tier`,
  `contract`, `requires`, `produces`, `feeds`, `argument-hint`). The Agent Skills standard
  only requires `name` + `description`; extra keys are expected to be ignored. If Desktop
  rejects a skill on unknown keys, add a frontmatter-stripping step to the build.
- **Slash-command body bits:** the `# /skill-name` heading and `@$1` argument injection are
  Claude Code conventions. In Desktop they read as plain instructions; confirm they degrade
  gracefully on the pilot upload.
- **Bundle vs per-skill:** these are one ZIP per skill. If Desktop adds multi-skill bundle
  upload, the staging output can be zipped as a group instead.
