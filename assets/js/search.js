/**
 * ============================================================
 *  FF193 — Hero Search (dropdown de sugestões da página inicial)
 *  Módulo ES · usa o núcleo compartilhado search-core.js
 *
 *  - Sugestões rápidas enquanto a pessoa digita (índice curado +
 *    Firestore).
 *  - Enter (sem item selecionado) ou "Ver todos os resultados"
 *    levam para pesquisa.html?q=…, a página de resultados com a
 *    busca completa (inclui o texto das páginas do site).
 * ============================================================
 */

import {
    STATIC_INDEX,
    cache,
    loadCache,
    normalize,
    escHtml,
    highlightHtml
} from './search-core.js';

const RESULTS_PAGE = 'pesquisa.html';

function goToResults(q) {
    window.location.href = `${RESULTS_PAGE}?q=${encodeURIComponent(q)}`;
}

/* ── Lógica de busca ─────────────────────────────────────── */
function search(q) {
    const norm = normalize(q);
    if (norm.length < 2) return null;

    const staticResults = STATIC_INDEX
        .filter(item =>
            normalize(item.title).includes(norm) ||
            normalize(item.keywords).includes(norm)
        )
        .slice(0, 5);

    const newsResults = (cache.news || [])
        .filter(item => item.keywords.includes(norm))
        .slice(0, 4);

    const docsResults = (cache.docs || [])
        .filter(item => item.keywords.includes(norm))
        .slice(0, 4);

    const projetosResults = (cache.projetos || [])
        .filter(item => item.keywords.includes(norm))
        .slice(0, 3);

    const capacitacaoResults = (cache.capacitacao || [])
        .filter(item => item.keywords.includes(norm))
        .slice(0, 3);

    const eventosResults = (cache.eventos || [])
        .filter(item => item.keywords.includes(norm))
        .slice(0, 3);

    const timelineResults = (cache.timeline || [])
        .filter(item => item.keywords.includes(norm))
        .slice(0, 3);

    const apoiadoresResults = (cache.apoiadores || [])
        .filter(item => item.keywords.includes(norm))
        .slice(0, 3);

    return {
        staticResults, newsResults, docsResults,
        projetosResults, capacitacaoResults, eventosResults, timelineResults, apoiadoresResults
    };
}

/* ── Renderização do dropdown ────────────────────────────── */
const BADGE_CLASS = {
    'Página': 'badge-pagina',
    'Atuação': 'badge-atuacao',
    'Notícia': 'badge-noticia',
    'Documento': 'badge-documento',
    'Contato': 'badge-contato',
};
const ICON_CLASS = {
    'Página': 'icon-pagina',
    'Atuação': 'icon-atuacao',
    'Notícia': 'icon-noticia',
    'Documento': 'icon-documento',
    'Contato': 'icon-contato',
};

function buildItem(item, q) {
    const a = document.createElement('a');
    a.className = 'search-result-item';
    a.href = item.link || '#';
    a.setAttribute('role', 'option');
    if (item.external) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }

    a.innerHTML = `
        <div class="search-result-icon ${ICON_CLASS[item.category] || 'icon-pagina'}">
            <i class="fas ${escHtml(item.icon || 'fa-file')}" aria-hidden="true"></i>
        </div>
        <div class="search-result-text">
            <div class="search-result-title">${highlightHtml(item.title, [normalize(q)])}</div>
            ${item.sub
            ? `<div class="search-result-sub">${escHtml(item.sub)}</div>`
            : ''}
        </div>
        <span class="search-badge ${BADGE_CLASS[item.category] || 'badge-pagina'}"
              aria-label="Categoria: ${escHtml(item.category)}">${escHtml(item.category)}</span>`;
    return a;
}

function buildGroup(label) {
    const div = document.createElement('div');
    div.className = 'search-group-label';
    div.setAttribute('role', 'group');
    div.setAttribute('aria-label', label);
    div.textContent = label;
    return div;
}

/* Link para a página de resultados (busca completa) */
function buildSeeAll(q) {
    const a = document.createElement('a');
    a.className = 'search-result-item search-see-all';
    a.href = `${RESULTS_PAGE}?q=${encodeURIComponent(q)}`;
    a.setAttribute('role', 'option');
    a.innerHTML = `
        <div class="search-result-icon icon-pagina">
            <i class="fas fa-magnifying-glass" aria-hidden="true"></i>
        </div>
        <div class="search-result-text">
            <div class="search-result-title">Ver todos os resultados para &ldquo;${escHtml(q)}&rdquo;</div>
            <div class="search-result-sub">Pesquisa completa em todo o site</div>
        </div>
        <i class="fas fa-arrow-right" aria-hidden="true"></i>`;
    return a;
}

function renderResults(dropdown, results, q) {
    dropdown.innerHTML = '';

    if (!results) { closeDropdown(dropdown); return; }

    const {
        staticResults, newsResults, docsResults,
        projetosResults, capacitacaoResults, eventosResults, timelineResults, apoiadoresResults
    } = results;

    /* Separar por categoria */
    const staticPages = staticResults.filter(r => r.category !== 'Contato' && r.category !== 'Documento');
    const docs = staticResults.filter(r => r.category === 'Documento');
    const contacts = staticResults.filter(r => r.category === 'Contato');
    const allDocs = [...docs, ...docsResults];

    /* Conteúdo dinâmico de Atuação (Projetos, Capacitação, Eventos, Linha do Tempo, Apoiadores) */
    const atuacaoDynamic = [
        ...projetosResults, ...capacitacaoResults, ...eventosResults, ...timelineResults, ...apoiadoresResults
    ].slice(0, 6);
    const pages = [...staticPages, ...atuacaoDynamic];

    const total = staticResults.length + newsResults.length + docsResults.length
        + projetosResults.length + capacitacaoResults.length + eventosResults.length
        + timelineResults.length + apoiadoresResults.length;

    if (total === 0) {
        dropdown.innerHTML = `
            <div class="search-empty" role="status">
                <i class="fas fa-search" aria-hidden="true"></i>
                <p>Nenhum resultado para <strong>"${escHtml(q)}"</strong></p>
                <span>Tente outras palavras-chave ou busque no site inteiro</span>
            </div>`;
        dropdown.appendChild(buildSeeAll(q));
        return;
    }

    /* Grupos de resultados */
    if (pages.length) {
        dropdown.appendChild(buildGroup('Páginas & Atuação'));
        pages.forEach(item => dropdown.appendChild(buildItem(item, q)));
    }
    if (newsResults.length) {
        dropdown.appendChild(buildGroup('Notícias'));
        newsResults.forEach(item => dropdown.appendChild(buildItem(item, q)));
    }
    if (allDocs.length) {
        dropdown.appendChild(buildGroup('Documentos'));
        allDocs.forEach(item => dropdown.appendChild(buildItem(item, q)));
    }
    if (contacts.length) {
        dropdown.appendChild(buildGroup('Contato'));
        contacts.forEach(item => dropdown.appendChild(buildItem(item, q)));
    }

    dropdown.appendChild(buildSeeAll(q));
}

/* ── Abrir / fechar dropdown ─────────────────────────────── */
function openDropdown(dropdown, input) {
    dropdown.hidden = false;
    dropdown.removeAttribute('aria-hidden');
    input.setAttribute('aria-expanded', 'true');
}

function closeDropdown(dropdown, input) {
    if (dropdown) { dropdown.hidden = true; dropdown.setAttribute('aria-hidden', 'true'); }
    if (input) input.setAttribute('aria-expanded', 'false');
}

/* ── Inicialização ───────────────────────────────────────── */
function initHeroSearch() {
    const wrap = document.getElementById('hero-search');
    if (!wrap) return;

    const input = document.getElementById('hero-search-input');
    const dropdown = document.getElementById('search-dropdown');
    const clearBtn = document.getElementById('hero-search-clear');

    if (!input || !dropdown || !clearBtn) return;

    let debounceTimer = null;
    let highlightIdx = -1;

    /* Pré-carrega cache Firebase em background, sem bloquear UI */
    loadCache();

    /* ── Evento de digitação ──────────────────────────────── */
    input.addEventListener('input', () => {
        const q = input.value.trim();
        clearBtn.hidden = q.length === 0;
        clearTimeout(debounceTimer);

        if (q.length < 2) { closeDropdown(dropdown, input); return; }

        debounceTimer = setTimeout(() => {
            const results = search(q);
            renderResults(dropdown, results, q);
            if (results) openDropdown(dropdown, input);
            highlightIdx = -1;
        }, 300);
    });

    /* ── Botão limpar ─────────────────────────────────────── */
    clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.hidden = true;
        closeDropdown(dropdown, input);
        input.focus();
    });

    /* ── Navegação por teclado ────────────────────────────── */
    input.addEventListener('keydown', (e) => {
        const items = [...dropdown.querySelectorAll('.search-result-item')];

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                highlightIdx = Math.min(highlightIdx + 1, items.length - 1);
                applyHighlight(items);
                break;
            case 'ArrowUp':
                e.preventDefault();
                highlightIdx = Math.max(highlightIdx - 1, -1);
                applyHighlight(items);
                if (highlightIdx === -1) input.focus();
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightIdx >= 0 && items[highlightIdx]) {
                    items[highlightIdx].click();
                } else if (input.value.trim().length >= 2) {
                    goToResults(input.value.trim());
                }
                break;
            case 'Escape':
                closeDropdown(dropdown, input);
                input.blur();
                break;
        }
    });

    /* ── Fechar ao clicar fora ────────────────────────────── */
    document.addEventListener('click', (e) => {
        if (!wrap.contains(e.target)) closeDropdown(dropdown, input);
    });

    /* ── Re-abre ao focar com texto já digitado ───────────── */
    input.addEventListener('focus', () => {
        const q = input.value.trim();
        if (q.length >= 2 && dropdown.hidden) {
            const results = search(q);
            renderResults(dropdown, results, q);
            if (results) openDropdown(dropdown, input);
        }
    });

    function applyHighlight(items) {
        items.forEach((el, i) => {
            const on = i === highlightIdx;
            el.classList.toggle('highlighted', on);
            if (on) el.scrollIntoView({ block: 'nearest' });
        });
    }
}

/* Inicializa assim que o módulo é avaliado (DOM já pronto em módulos ES) */
initHeroSearch();

console.log('%c🔥 Fundação Fênix 193 — Pesquisa iniciada', 'color:#FF6F00;font-weight:bold;font-size:13px');