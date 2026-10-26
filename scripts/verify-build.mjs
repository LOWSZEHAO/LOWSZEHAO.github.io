/**
 * Post-build verification.
 *
 * Checks the things that are easy to break silently and embarrassing to ship:
 *
 *   1. Unapproved projects are genuinely absent from dist/ - no page, no card,
 *      no leaked prose, no sitemap entry.
 *   2. Every internal link resolves to a file that exists in dist/.
 *   3. Every internal link carries the configured base path, so nothing works
 *      only on localhost.
 *   4. The GitHub Pages essentials are present.
 *   5. External links are listed, with any obvious placeholder flagged.
 *
 * Run with `npm run verify` after `npm run build`. It exits non-zero on
 * failure, so CI stops rather than deploying a broken site.
 */

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const contentDir = path.join(root, 'src', 'content', 'projects');

const failures = [];
const warnings = [];
const notes = [];

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

if (!existsSync(dist)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

/* -- work out the configured base path ------------------------------------ */

// pathToFileURL matters here: a bare Windows path like G:\... is not a valid
// ESM specifier, and the import fails with ERR_UNSUPPORTED_ESM_URL_SCHEME.
const configUrl = pathToFileURL(path.join(root, 'astro.config.mjs'));
const { default: config } = await import(`${configUrl.href}?v=${Date.now()}`);
const base = (config.base ?? '/').replace(/\/+$/, '');

notes.push(`base path: ${base || '/'}`);
notes.push(`site: ${config.site}`);

/* -- collect built files --------------------------------------------------- */

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const builtFiles = await walk(dist);
const htmlFiles = builtFiles.filter((f) => f.endsWith('.html'));
const relativeBuilt = new Set(builtFiles.map((f) => `/${path.relative(dist, f).replace(/\\/g, '/')}`));

notes.push(`${htmlFiles.length} HTML page(s), ${builtFiles.length} file(s) total`);

/* -- 1. unapproved projects must be absent --------------------------------- */

const contentFiles = (await readdir(contentDir)).filter((f) => f.endsWith('.md'));
const unapproved = [];
const approved = [];

for (const file of contentFiles) {
  const source = await readFile(path.join(contentDir, file), 'utf8');
  const frontmatter = source.split(/^---\s*$/m)[1] ?? '';
  const isApproved = /^\s*approved:\s*true\s*$/m.test(frontmatter);
  const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
  const title = (titleMatch?.[1] ?? '').trim().replace(/^['"]|['"]$/g, '');
  const slug = file.replace(/\.md$/, '');
  (isApproved ? approved : unapproved).push({ slug, title, source });
}

notes.push(`${approved.length} approved, ${unapproved.length} withheld`);

const allHtml = await Promise.all(htmlFiles.map((f) => readFile(f, 'utf8')));
const haystack = allHtml.join('\n');

const sitemapFiles = builtFiles.filter((f) => f.endsWith('.xml'));
const sitemapText = (await Promise.all(sitemapFiles.map((f) => readFile(f, 'utf8')))).join('\n');

for (const project of unapproved) {
  if (relativeBuilt.has(`/projects/${project.slug}/index.html`)) {
    fail(`Withheld project "${project.slug}" generated a page in dist/.`);
  }
  if (project.title && haystack.includes(project.title)) {
    fail(`Withheld project title "${project.title}" appears in built HTML.`);
  }
  if (sitemapText.includes(`/projects/${project.slug}`)) {
    fail(`Withheld project "${project.slug}" appears in the sitemap.`);
  }

  // A distinctive sentence from the withheld body must not have leaked.
  const body = project.source.split(/^---\s*$/m).slice(2).join('---');
  const probe = body
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 50 && !line.startsWith('#') && !line.startsWith('<'));
  if (probe && haystack.includes(probe.slice(0, 50))) {
    fail(`Body text from withheld project "${project.slug}" appears in built HTML.`);
  }
}

/* -- 2 & 3. internal links ------------------------------------------------- */

const externalLinks = new Map();
let internalChecked = 0;

for (const [i, html] of allHtml.entries()) {
  const pageName = `/${path.relative(dist, htmlFiles[i]).replace(/\\/g, '/')}`;

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = match[1];

    if (/^(https?:)?\/\//i.test(href)) {
      if (!externalLinks.has(href)) externalLinks.set(href, new Set());
      externalLinks.get(href).add(pageName);
      continue;
    }
    if (href.startsWith('mailto:') || href.startsWith('#') || href.startsWith('data:')) continue;
    if (!href.startsWith('/')) continue; // relative, resolved by the browser

    internalChecked++;

    if (base && !href.startsWith(`${base}/`) && href !== base) {
      fail(`${pageName}: internal link "${href}" is missing the base path "${base}".`);
      continue;
    }

    const withoutBase = base ? href.slice(base.length) : href;
    const clean = withoutBase.split('#')[0].split('?')[0];
    const candidates = clean.endsWith('/')
      ? [`${clean}index.html`]
      : [clean, `${clean}/index.html`];

    if (!candidates.some((c) => relativeBuilt.has(c))) {
      fail(`${pageName}: internal link "${href}" does not resolve to a built file.`);
    }
  }
}

notes.push(`${internalChecked} internal link(s) resolved`);

/* -- 4. GitHub Pages essentials -------------------------------------------- */

for (const required of ['/.nojekyll', '/404.html', '/og.png', '/favicon.svg', '/sitemap-index.xml']) {
  if (!relativeBuilt.has(required)) fail(`Missing from dist/: ${required}`);
}

/* -- 5. external links and placeholders ------------------------------------ */

const PLACEHOLDER_PATTERNS = [
  /example\.com/i,
  /your-?(handle|name|username|profile)/i,
  /lorem/i,
  /TODO/,
  /CHANGEME/i,
];

for (const [href, pages] of externalLinks) {
  if (PLACEHOLDER_PATTERNS.some((p) => p.test(href))) {
    fail(`Placeholder URL shipped: "${href}" on ${[...pages].join(', ')}`);
  }
}

// TODO markers must never reach a rendered page.
for (const [i, html] of allHtml.entries()) {
  const pageName = `/${path.relative(dist, htmlFiles[i]).replace(/\\/g, '/')}`;
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '');
  if (/\bTODO\b/.test(text)) {
    fail(`"TODO" appears in rendered output: ${pageName}`);
  }
}

/* -- report ---------------------------------------------------------------- */

console.log('\nBuild verification\n' + '='.repeat(60));
for (const note of notes) console.log(`  ·  ${note}`);

console.log(`\nExternal links (${externalLinks.size}) — check these reach a real page:`);
for (const [href, pages] of [...externalLinks].sort()) {
  console.log(`  →  ${href}`);
  console.log(`     on ${[...pages].join(', ')}`);
}

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const w of warnings) console.log(`  !  ${w}`);
}

if (failures.length) {
  console.log(`\nFAILED (${failures.length}):`);
  for (const f of failures) console.log(`  ✗  ${f}`);
  console.log('');
  process.exit(1);
}

console.log('\n✓ All checks passed.\n');
