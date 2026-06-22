#!/usr/bin/env node
/**
 * build-desktop-skills.mjs — package the ai-engineering skills for Claude Desktop.
 *
 * Claude Code skills and Claude Desktop skills share the open Agent Skills format
 * (a folder containing SKILL.md). The only adjustment Desktop needs is that a skill
 * uploaded as a ZIP must be self-contained: the relative links to ../../CONNECTORS.md
 * and ../../SKILL-CONTRACT.md break once a single skill folder is zipped on its own.
 *
 * This script stages each skill into its own folder, bundles local copies of the two
 * shared docs, rewrites those links to point next to the SKILL.md, and emits one ZIP
 * per skill under dist/desktop-skills/. Upload a ZIP via Claude Desktop:
 *   Customize -> Skills -> Browse skills -> Upload.
 *
 * Usage:
 *   node desktop/build-desktop-skills.mjs            # build all skills
 *   node desktop/build-desktop-skills.mjs --only code-review   # build one (pilot)
 *
 * No npm dependencies: staging is pure Node fs; zipping shells out to the platform
 * archiver (PowerShell Compress-Archive on Windows, `zip` elsewhere).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const pluginDir = path.join(repoRoot, 'plugins', 'ai-engineering');
const skillsDir = path.join(pluginDir, 'skills');
const sharedFiles = ['CONNECTORS.md', 'SKILL-CONTRACT.md'];

const distDir = path.join(repoRoot, 'dist', 'desktop-skills');
const stagingDir = path.join(distDir, 'staging');

// --only <name> builds a single skill (used to pilot the format before the full batch).
const onlyIdx = process.argv.indexOf('--only');
const only = onlyIdx !== -1 ? process.argv[onlyIdx + 1] : null;

/** Rewrite the two shared-doc links so they resolve inside the zipped skill folder. */
function localizeLinks(markdown) {
  return markdown
    .replace(/\.\.\/\.\.\/(CONNECTORS\.md|SKILL-CONTRACT\.md)/g, '$1');
}

/** Zip a staged skill folder so the archive contains a top-level <name>/ directory. */
function zipFolder(name) {
  const zipPath = path.join(distDir, `${name}.zip`);
  fs.rmSync(zipPath, { force: true });
  if (process.platform === 'win32') {
    execFileSync('powershell', [
      '-NoProfile', '-NonInteractive', '-Command',
      `Compress-Archive -Path '${path.join(stagingDir, name)}' -DestinationPath '${zipPath}' -Force`,
    ], { stdio: 'pipe' });
  } else {
    execFileSync('zip', ['-r', '-q', zipPath, name], { cwd: stagingDir, stdio: 'pipe' });
  }
  return zipPath;
}

function build() {
  if (!fs.existsSync(skillsDir)) {
    console.error(`Skills directory not found: ${skillsDir}`);
    process.exit(1);
  }

  // Verify the shared docs exist before we promise to bundle them.
  for (const f of sharedFiles) {
    if (!fs.existsSync(path.join(pluginDir, f))) {
      console.error(`Missing shared doc: ${path.join(pluginDir, f)}`);
      process.exit(1);
    }
  }

  let names = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(skillsDir, d.name, 'SKILL.md')))
    .map((d) => d.name)
    .sort();

  if (only) {
    if (!names.includes(only)) {
      console.error(`--only "${only}" not found. Available: ${names.join(', ')}`);
      process.exit(1);
    }
    names = [only];
  }

  // Fresh staging each run; leave previously built ZIPs in place unless rebuilt.
  fs.rmSync(stagingDir, { recursive: true, force: true });
  fs.mkdirSync(stagingDir, { recursive: true });

  const built = [];
  for (const name of names) {
    const stageSkill = path.join(stagingDir, name);
    // Copy the whole skill folder (SKILL.md + any resources it ships with).
    fs.cpSync(path.join(skillsDir, name), stageSkill, { recursive: true });

    // Bundle local copies of the shared docs next to SKILL.md.
    for (const f of sharedFiles) {
      fs.copyFileSync(path.join(pluginDir, f), path.join(stageSkill, f));
    }

    // Rewrite the ../../ links in SKILL.md to the now-local docs.
    const skillMd = path.join(stageSkill, 'SKILL.md');
    fs.writeFileSync(skillMd, localizeLinks(fs.readFileSync(skillMd, 'utf8')));

    const zipPath = zipFolder(name);
    built.push(name);
    console.log(`  packaged ${name} -> ${path.relative(repoRoot, zipPath)}`);
  }

  console.log(`\nDone. ${built.length} skill ZIP(s) in ${path.relative(repoRoot, distDir)}/`);
  console.log('Upload via Claude Desktop: Customize -> Skills -> Browse skills -> Upload.');
}

build();
