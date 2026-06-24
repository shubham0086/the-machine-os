#!/usr/bin/env node
/**
 * skillmd-from-tools.mjs - generate a SKILL.md from a spoke's TOOLS export.
 *
 * Part of The Machine OS hub. Implements the SPOKE-CONTRACT.md rule "generate, don't
 * hand-maintain": a spoke's tool documentation is derived from its live `TOOLS` array
 * (name, description, inputSchema params, annotations) so docs never drift from code.
 * This mirrors CLI-Anything's "Phase 6.5" skill_generator, adapted to our MCP-first
 * TOOLS shape.
 *
 * Pure-by-design dependency: it dynamically imports the spoke's `src/mcp_tools.js`,
 * which (per the contract) imports no MCP SDK and whose engine has no import-time side
 * effects, so importing it here is safe and gives us the REAL export (no regex parsing).
 *
 * No new dependencies. Node 18+ ESM + pathToFileURL only.
 *
 * Usage:
 *   node tools/skillmd-from-tools.mjs <path-to/src/mcp_tools.js> [--name <id>] [--description "<text>"]
 *   node tools/skillmd-from-tools.mjs <path> > out/SKILL.md
 *
 * Flags:
 *   --name         override the skill id (default: derived from the spoke directory name)
 *   --description  override the frontmatter description (default: a generated one-liner)
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function fail(msg) {
  process.stderr.write(`skillmd-from-tools: ${msg}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--name') out.name = argv[++i];
    else if (a === '--description') out.description = argv[++i];
    else out._.push(a);
  }
  return out;
}

// Derive a sensible skill id from a .../<spoke>/src/mcp_tools.js path.
function deriveName(toolsPath) {
  const parts = path.resolve(toolsPath).split(path.sep);
  const srcIdx = parts.lastIndexOf('src');
  if (srcIdx > 0) return parts[srcIdx - 1];
  return path.basename(parts[parts.length - 1], path.extname(parts[parts.length - 1]));
}

// Render an inputSchema's properties as a compact param list.
function renderParams(schema) {
  if (!schema || schema.type !== 'object' || !schema.properties) return '_No parameters._';
  const required = new Set(schema.required || []);
  const names = Object.keys(schema.properties);
  if (names.length === 0) return '_No parameters._';
  const lines = names.map((p) => {
    const spec = schema.properties[p] || {};
    const type = spec.type || 'any';
    const req = required.has(p) ? 'required' : 'optional';
    const desc = (spec.description || '').trim();
    return `  - \`${p}\` (${type}, ${req})${desc ? `: ${desc}` : ''}`;
  });
  return lines.join('\n');
}

// Render the annotations object as a compact inline summary.
function renderAnnotations(ann) {
  if (!ann || typeof ann !== 'object') return '_No annotations declared._';
  const order = ['title', 'readOnlyHint', 'destructiveHint', 'idempotentHint', 'openWorldHint'];
  const keys = [...order.filter((k) => k in ann), ...Object.keys(ann).filter((k) => !order.includes(k))];
  if (keys.length === 0) return '_No annotations declared._';
  return keys.map((k) => `\`${k}: ${JSON.stringify(ann[k])}\``).join(', ');
}

function renderTool(t) {
  const desc = (t.description || '').trim() || '_No description._';
  return [
    `### \`${t.name}\``,
    '',
    desc,
    '',
    '**Parameters:**',
    '',
    renderParams(t.inputSchema),
    '',
    `**Annotations:** ${renderAnnotations(t.annotations)}`,
    '',
  ].join('\n');
}

function buildSkillMd({ name, description, tools, sourceRel }) {
  const toolNames = tools.map((t) => t.name).join(', ');
  const fm = [
    '---',
    `name: ${name}`,
    `description: ${description}`,
    '---',
    '',
  ].join('\n');

  const body = [
    `# ${name}`,
    '',
    '> Generated from the spoke `TOOLS` export by `tools/skillmd-from-tools.mjs`.',
    '> Do not edit the Tools section by hand; regenerate when `TOOLS` changes.',
    `> Source: \`${sourceRel}\``,
    '',
    `This spoke exposes ${tools.length} tool${tools.length === 1 ? '' : 's'}: ${toolNames}.`,
    '',
    '## Tools',
    '',
    tools.map(renderTool).join('\n'),
  ].join('\n');

  return `${fm}${body}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const toolsPath = args._[0];
  if (!toolsPath) fail('usage: node tools/skillmd-from-tools.mjs <path-to/src/mcp_tools.js> [--name id] [--description text]');

  const abs = path.resolve(toolsPath);
  let mod;
  try {
    mod = await import(pathToFileURL(abs).href);
  } catch (e) {
    fail(`could not import ${abs}: ${e.message}`);
  }

  const tools = mod.TOOLS;
  if (!Array.isArray(tools)) fail(`${abs} does not export a TOOLS array (got ${typeof tools})`);
  if (tools.length === 0) fail(`${abs} exports an empty TOOLS array`);

  const name = args.name || deriveName(abs);
  const description =
    args.description ||
    `MCP spoke "${name}" exposing ${tools.length} tool${tools.length === 1 ? '' : 's'}: ` +
      `${tools.map((t) => t.name).join(', ')}. Generated from TOOLS.`;

  const sourceRel = path.relative(process.cwd(), abs).split(path.sep).join('/');
  process.stdout.write(buildSkillMd({ name, description, tools, sourceRel }));
}

main();
