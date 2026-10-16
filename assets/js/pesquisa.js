/**
 * ============================================================
 *  FF193 — Página de resultados (pesquisa.html)
 *  Recebe a busca por URL (?q=termo&cat=Notícia), pesquisa em todo o
 *  site (páginas, notícias, documentos, projetos, capacitação, eventos,
 *  linha do tempo e apoiadores) e mostra os resultados por relevância.
 *
 *  - Recebe a busca de qualquer barra de pesquisa do site (header,
 *    hero da home e o campo desta página).
 *  - Filtro por categoria com contagem, "mostrar mais", trechos com os
 *    termos destacados, estados de carregamento / vazio / erro parcial.
 *  - Navegação sem recarregar a página (History API): voltar/avançar
 *    do navegador refazem a busca.
 * ============================================================
 */

import {
    searchAll,
    tokenize,
    highlightHtml,
    makeSnippet,
    escHtml,
    CATEGORY_META
} from './search-core.js';

const PAGE_SIZE = 10;
const MAX_QUERY = 100;
const $ = id => document.getElementById(id);

const el = {
    form: $('sr-form'),
    input: $('sr-input'),
    summary: $('sr-summary'),
    notice: $('sr-notice'),
    filters: $('sr-filters'),
    list: $('sr-list'),
    more: $('sr-more'),
    heroSub: $('sr-hero-sub')
};

const state = { q: '', cat: 'todos', results: [], counts: {}, terms: [], shown: PAGE_SIZE, token: 0 };

/* ── URL ─────────────────────────────────────────────────── */
function readUrl() {
    const p = new URLSearchParams(location.search);
    return { q: (p.get('q') || '').trim().slice(0, MAX_QUERY), cat: p.get('cat') || 'todos' };
}

function writeUrl(push) {
    const p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.cat !== 'todos') p.set('cat', state.cat);
    const url = location.pathname + (p.toString() ? '?' + p.toString() : '');
    (push ? history.pushState : history.replaceState).call(history, null, '', url);
}

/* ── Campos de pesquisa (desta página e do header) ───────── */
function syncInputs(q) {
    el.input.value = q;
    document.querySelectorAll('form.header-search .header-search-input').forEach(i => { i.value = q; });
}

/* ── Estados da tela ─────────────────────────────────────── */
function showSkeleton() {
    el.filters.hidden = true;
    el.more.hidden = true;
    el.notice.hidden = true;
    el.list.innerHTML = Array.from({ length: 4 }, () =>
        '<li class="sr-skeleton" aria-hidden="true"><span></span><span></span><span></span></li>').join('');
    el.summary.textContent = 'Pesquisando…';
}

const SUGGESTIONS = [
    { label: 'Notícias', link: 'pages/noticias.html', icon: 'fa-newspaper' },
    { label: 'Projetos', link: 'pages/projetos.html', icon: 'fa-clipboard-list' },
    { label: 'Transparência', link: 'pages/transparencia.html', icon: 'fa-folder-open' },
    { label: 'Capacitação', link: 'pages/capacitacao.html', icon: 'fa-graduation-cap' },
    { label: 'Eventos', link: 'pages/eventos.html', icon: 'fa-calendar-days' },
    { label: 'Fale Conosco', link: 'pages/fale-conosco.html', icon: 'fa-envelope' }
];

function suggestionsHtml() {
    return `<ul class="sr-suggestions">${SUGGESTIONS.map(s =>
        `<li><a href="${s.link}"><i class="fas ${s.icon}" aria-hidden="true"></i> ${s.label}</a></li>`).join('')}</ul>`;
}

function showMessage({ icon, title, text }) {
    el.filters.hidden = true;
    el.more.hidden = true;
    el.notice.hidden = true;
    el.list.innerHTML = `
        <li class="sr-empty">
            <i class="fas ${icon}" aria-hidden="true"></i>
            <h2>${title}</h2>
            <p>${text}</p>
            ${suggestionsHtml()}
        </li>`;
}

/* ── Renderização ────────────────────────────────────────── */
function formatDate(d) {
    return d instanceof Date && !isNaN(d)
        ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '';
}

function resultHtml(r) {
    const slug = (CATEGORY_META[r.category] || CATEGORY_META['Página']).slug;
    const snippet = makeSnippet(r.body, state.terms);
    const showSnippet = snippet && snippet !== r.sub;
    const date = formatDate(r.date);
    const ext = r.external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `
        <li class="sr-item">
            <a class="sr-link" href="${escHtml(r.link || '#')}"${ext}>
                <span class="sr-icon sr-icon--${slug}"><i class="fas ${escHtml(r.icon || 'fa-file')}" aria-hidden="true"></i></span>
                <span class="sr-body">
                    <span class="sr-title">${highlightHtml(r.title, state.terms)}${r.external
            ? ' <i class="fas fa-arrow-up-right-from-square sr-ext" aria-label="abre em nova aba"></i>' : ''}</span>
                    ${showSnippet ? `<span class="sr-snippet">${highlightHtml(snippet, state.terms)}</span>` : ''}
                    <span class="sr-meta">
                        <span class="sr-badge sr-badge--${slug}">${escHtml(r.category)}</span>
                        ${r.sub ? `<span>${escHtml(r.sub)}</span>` : ''}
                        ${date ? `<span>${date}</span>` : ''}
                    </span>
                </span>
            </a>
        </li>`;
}

function render() {
    const { q, cat, results, counts } = state;
    const filtered = cat === 'todos' ? results : results.filter(r => r.category === cat);

    /* Resumo (texto digitado vai por textContent: nunca como HTML) */
    el.summary.textContent = '';
    const n = filtered.length;
    el.summary.append(`${n} resultado${n === 1 ? '' : 's'} para `);
    const strong = document.createElement('strong');
    strong.textContent = `“${q}”`;
    el.summary.append(strong);
    if (cat !== 'todos') el.summary.append(` em ${(CATEGORY_META[cat] || {}).label || cat}`);

    /* Filtros por categoria (só as que têm resultado) */
    const chips = [['todos', 'Todos', counts.todos || 0]];
    Object.keys(CATEGORY_META).forEach(c => { if (counts[c]) chips.push([c, CATEGORY_META[c].label, counts[c]]); });
    el.filters.hidden = chips.length <= 2;                 // só "Todos" + 1 categoria: filtro dispensável
    el.filters.innerHTML = chips.map(([key, label, count]) =>
        `<button type="button" class="sr-chip" data-cat="${escHtml(key)}" aria-pressed="${key === cat}">${label}
            <span class="sr-chip-count">${count}</span></button>`).join('');

    /* Lista */
    if (!n) {
        showMessage({
            icon: 'fa-magnifying-glass',
            title: 'Nenhum resultado nesta categoria',
            text: 'Escolha “Todos” ou tente outras palavras.'
        });
        el.filters.hidden = chips.length <= 2;
        return;
    }
    el.list.innerHTML = filtered.slice(0, state.shown).map(resultHtml).join('');
    el.more.hidden = filtered.length <= state.shown;
    el.more.textContent = `Mostrar mais resultados (${filtered.length - state.shown})`;
}

/* ── Execução da busca ───────────────────────────────────── */
async function run(q, { push = false } = {}) {
    state.q = q.slice(0, MAX_QUERY).trim();
    state.shown = PAGE_SIZE;
    syncInputs(state.q);
    document.title = state.q ? `Pesquisa: ${state.q} · Fundação Fênix 193` : 'Pesquisa · Fundação Fênix 193';
    writeUrl(push);

    if (!state.q) {
        el.summary.textContent = '';
        showMessage({
            icon: 'fa-magnifying-glass',
            title: 'O que você procura?',
            text: 'Digite um termo acima ou comece por uma destas seções:'
        });
        return;
    }

    state.terms = tokenize(state.q);
    if (!state.terms.length) {
        el.summary.textContent = '';
        showMessage({
            icon: 'fa-keyboard',
            title: 'Digite pelo menos 2 letras',
            text: 'Termos muito curtos não geram bons resultados.'
        });
        return;
    }

    const token = ++state.token;
    showSkeleton();
    try {
        const data = await searchAll(state.q);
        if (token !== state.token) return;                  // chegou uma busca mais nova
        state.results = data.results;
        state.counts = data.counts;

        el.notice.hidden = !data.notices.length;
        el.notice.textContent = data.notices.join(' ');

        if (!data.results.length) {
            el.summary.textContent = '';
            el.summary.append('Nenhum resultado para ');
            const s = document.createElement('strong');
            s.textContent = `“${state.q}”`;
            el.summary.append(s);
            showMessage({
                icon: 'fa-face-frown',
                title: 'Não encontramos nada por aqui',
                text: 'Confira a ortografia, use menos palavras ou procure por termos mais gerais. Você também pode explorar:'
            });
            el.notice.hidden = !data.notices.length;
            return;
        }
        render();
    } catch (err) {
        if (token !== state.token) return;
        console.error('[FF193 Pesquisa] Erro:', err);
        el.summary.textContent = '';
        showMessage({
            icon: 'fa-triangle-exclamation',
            title: 'Não foi possível pesquisar agora',
            text: 'Tente novamente em instantes.'
        });
    }
}

/* ── Eventos ─────────────────────────────────────────────── */
function submitFrom(input, e) {
    e.preventDefault();
    const q = input.value.trim();
    state.cat = 'todos';
    run(q, { push: true });
    el.summary.focus();
}

el.form.addEventListener('submit', e => submitFrom(el.input, e));
// Barras de pesquisa do header: pesquisam aqui mesmo, sem recarregar
document.querySelectorAll('form.header-search').forEach(form => {
    const input = form.querySelector('.header-search-input');
    form.addEventListener('submit', e => {
        submitFrom(input, e);
        document.getElementById('btn-mobile')?.getAttribute('aria-expanded') === 'true'
            && document.getElementById('btn-mobile').click();      // fecha o menu mobile
    });
});

el.filters.addEventListener('click', e => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    state.cat = btn.dataset.cat;
    state.shown = PAGE_SIZE;
    writeUrl(false);
    render();
});

el.more.addEventListener('click', () => {
    const before = el.list.children.length;
    state.shown += PAGE_SIZE;
    render();
    el.list.children[before]?.querySelector('a')?.focus();   // foco no 1º item novo (teclado)
});

window.addEventListener('popstate', () => {
    const { q, cat } = readUrl();
    state.cat = cat;
    run(q, { push: false });
});

/* ── Início ──────────────────────────────────────────────── */
{
    const { q, cat } = readUrl();
    state.cat = cat;
    run(q, { push: false });
}