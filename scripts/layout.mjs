#!/usr/bin/env node
/**
 * LAYOUT.MJS — Fundação Fênix193
 * Mantém o cabeçalho e o rodapé IGUAIS em todas as páginas a partir de um único modelo.
 *
 *   partials/header.html  →  tudo entre <!-- @layout:header --> e <!-- @/layout:header -->
 *   partials/footer.html  →  tudo entre <!-- @layout:footer --> e <!-- @/layout:footer -->
 *
 * O link do menu que corresponde à página atual recebe aria-current="page" automaticamente.
 *
 * Uso:
 *   node scripts/layout.mjs           atualiza os arquivos (rodar após editar um partial)
 *   node scripts/layout.mjs --check   só confere; termina com erro se algum arquivo estiver desatualizado
 *
 * No Cloudflare (Workers Builds), configure "Build command" = node scripts/layout.mjs
 * e o site é atualizado a cada deploy, sem mexer página por página.
 * Sem dependências: só precisa do Node.js.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CHECK = process.argv.includes('--check');

// Rotas que pertencem a um item do menu mesmo sem ter link próprio
const ALIAS = { '/pages/noticia': '/pages/noticias' };

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

function urlPathOf(file) {
  let p = '/' + relative(ROOT, file).split(sep).join('/');
  p = p.replace(/\.html$/, '');
  if (p.endsWith('/index')) p = p.slice(0, -'/index'.length) || '/';
  return p || '/';
}

function markCurrent(headerHtml, current) {
  const target = ALIAS[current] || current;
  const hrefs = [...headerHtml.matchAll(/<a\b[^>]*\bhref="([^"#?]*)"/g)].map((m) => m[1]);
  let best = null;
  for (const h of hrefs) {
    if (h === '/') { if (target === '/') best = '/'; continue; }
    if (target === h || target.startsWith(h + '/')) { if (!best || h.length > best.length) best = h; }
  }
  if (!best) return headerHtml;
  const re = new RegExp(`(<a\\b[^>]*\\bhref="${best.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}")(?![^>]*aria-current)`);
  return headerHtml.replace(re, '$1 aria-current="page"');
}

const partials = {};
for (const name of ['header', 'footer']) {
  const p = join(ROOT, 'partials', `${name}.html`);
  if (!existsSync(p)) { console.error(`Faltou partials/${name}.html`); process.exit(1); }
  partials[name] = readFileSync(p, 'utf8').trim();
}

const files = [join(ROOT, 'index.html'), join(ROOT, 'pesquisa.html'), ...walk(join(ROOT, 'pages'))].filter(existsSync);
let changed = 0;
for (const file of files) {
  const before = readFileSync(file, 'utf8');
  let after = before;
  for (const name of ['header', 'footer']) {
    const re = new RegExp(`<!-- @layout:${name} -->[\\s\\S]*?<!-- @/layout:${name} -->`);
    if (!re.test(after)) continue;
    let body = partials[name];
    if (name === 'header') body = markCurrent(body, urlPathOf(file));
    after = after.replace(re, () => `<!-- @layout:${name} -->\n${body}\n<!-- @/layout:${name} -->`);
  }
  if (after !== before) {
    changed++;
    console.log(`${CHECK ? 'desatualizado' : 'atualizado'}: ${relative(ROOT, file)}`);
    if (!CHECK) writeFileSync(file, after);
  }
}
console.log(`${files.length} páginas verificadas, ${changed} ${CHECK ? 'desatualizadas' : 'atualizadas'}.`);
if (CHECK && changed) process.exit(1);
