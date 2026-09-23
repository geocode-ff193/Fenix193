/**
 * ============================================================
 *  FF193 — Hero Search
 *  Módulo isolado · Firebase v9 CDN ESM · Vanilla JS
 *  Coleções: news, transparency_docs, projetos, capacitacao,
 *            eventos, timeline, apoiadores
 *  Conteúdo estático: páginas e âncoras do site
 * ============================================================
 */

import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

/* ── Re-usa instância já inicializada em script.js ───────── */
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDJXiMyq4ncZb4neX5Rur71-l6adRZ7v3M",
    authDomain: "fundacaofenix193.firebaseapp.com",
    projectId: "fundacaofenix193",
    storageBucket: "fundacaofenix193.firebasestorage.app",
    messagingSenderId: "263835472373",
    appId: "1:263835472373:web:492921e00e51a1e74750bc"
};

const firebaseApp = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
const db = getFirestore(firebaseApp);

/* ── Índice estático do site ─────────────────────────────── */
const STATIC_INDEX = [
    {
        title: 'Início',
        sub: 'Página principal da Fundação',
        category: 'Página',
        icon: 'fa-house',
        link: 'index.html',
        keywords: 'início home principal fundação fênix 193 bombeiros sergipe'
    },
    {
        title: 'Quem Somos',
        sub: 'Apresentação institucional',
        category: 'Página',
        icon: 'fa-landmark',
        link: 'index.html#quem-somos',
        keywords: 'quem somos organização fundação sem fins lucrativos apoio cbmse sergipe missão'
    },
    {
        title: 'Nossa História',
        sub: 'Trajetória da Fundação',
        category: 'Página',
        icon: 'fa-book-open',
        link: 'pages/nossa-historia.html',
        keywords: 'história trajetória fundação criação origem sergipe bombeiros militares linha do tempo'
    },
    {
        title: 'Missão e Valores',
        sub: 'Propósito e princípios',
        category: 'Página',
        icon: 'fa-bullseye',
        link: 'pages/missao-valores.html',
        keywords: 'missão visão valores compromisso ética integridade responsabilidade social princípios'
    },
    {
        title: 'Equipe e Conselho',
        sub: 'Membros dos conselhos',
        category: 'Página',
        icon: 'fa-users',
        link: 'pages/equipe.html',
        keywords: 'equipe conselho membros diretoria presidente curadores fiscal executivo estrutura organizacional'
    },
    {
        title: 'Transparência',
        sub: 'Portal de documentos públicos',
        category: 'Documento',
        icon: 'fa-folder-open',
        link: 'pages/transparencia.html',
        keywords: 'transparência documentos prestação contas relatórios certidões estatuto atas contratos editais portal'
    },
    {
        title: 'Projetos',
        sub: 'Iniciativas e programas',
        category: 'Atuação',
        icon: 'fa-clipboard-list',
        link: 'pages/projetos.html',
        keywords: 'projetos bombeiro mirim apoio operacional sos abelhas defesa civil primeiros socorros iniciativas programas'
    },
    {
        title: 'Capacitação',
        sub: 'Cursos e treinamentos',
        category: 'Atuação',
        icon: 'fa-graduation-cap',
        link: 'pages/capacitacao.html',
        keywords: 'capacitação cursos treinamentos primeiros socorros brigada incêndio instrutor certificação in company'
    },
    {
        title: 'Eventos',
        sub: 'Ações e atividades',
        category: 'Atuação',
        icon: 'fa-calendar-days',
        link: 'pages/eventos.html',
        keywords: 'eventos ações sociais cerimônias atividades simulado calendário programação próximos'
    },
    {
        title: 'Parcerias',
        sub: 'Empresas parceiras',
        category: 'Atuação',
        icon: 'fa-handshake',
        link: 'pages/parcerias.html',
        keywords: 'parcerias empresas parceiros patrocinadores apoio institucional voluntariado como ser parceiro'
    },
    {
        title: 'Notícias',
        sub: 'Últimas publicações',
        category: 'Página',
        icon: 'fa-newspaper',
        link: 'pages/noticias.html',
        keywords: 'notícias acontecimentos novidades últimas publicações informações blog'
    },
    {
        title: 'Como Colaborar',
        sub: 'Doações e voluntariado',
        category: 'Contato',
        icon: 'fa-hand-holding-heart',
        link: 'index.html#como-ajudar',
        keywords: 'doação voluntariado parcerias ajudar colaborar contribuir pix transferência como ajudar'
    },
    {
        title: 'Entre em Contato',
        sub: 'Formulário e endereço',
        category: 'Contato',
        icon: 'fa-envelope',
        link: 'index.html#contato',
        keywords: 'contato fale conosco endereço email telefone formulário mensagem denúncia'
    },
    {
        title: 'Prestação de Contas',
        sub: 'Documentos financeiros',
        category: 'Documento',
        icon: 'fa-file-invoice',
        link: 'pages/transparencia.html',
        keywords: 'prestação de contas finanças financeiro orçamento receita despesa balanço'
    },
    {
        title: 'Estatuto Social',
        sub: 'Documentação institucional',
        category: 'Documento',
        icon: 'fa-scroll',
        link: 'pages/transparencia.html',
        keywords: 'estatuto social regimento fundação normas regras documentos institucionais constituição'
    },
    {
        title: 'Certidões',
        sub: 'Regularidade e certificados',
        category: 'Documento',
        icon: 'fa-certificate',
        link: 'pages/transparencia.html',
        keywords: 'certidões certificados documentação regularidade fiscal negativa débitos'
    },
];

/* ── Cache dinâmico (carregado uma vez) ──────────────────── */
let newsCache = null;
let docsCache = null;
let projetosCache = null;
let capacitacaoCache = null;
let eventosCache = null;
let timelineCache = null;
let apoiadoresCache = null;
let cacheLoading = false;
let cacheReady = false;

async function loadCache() {
    if (cacheReady || cacheLoading) return;
    cacheLoading = true;
    try {
        const [newsSnap, docsSnap, projetosSnap, capacitacaoSnap, eventosSnap, timelineSnap, apoiadoresSnap] = await Promise.all([
            getDocs(query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(30))),
            getDocs(query(collection(db, 'transparency_docs'), orderBy('createdAt', 'desc'))),
            getDocs(query(collection(db, 'projetos'), orderBy('createdAt', 'desc'))),
            getDocs(query(collection(db, 'capacitacao'), orderBy('createdAt', 'desc'))),
            getDocs(query(collection(db, 'eventos'), orderBy('createdAt', 'desc'))),
            getDocs(query(collection(db, 'timeline'), orderBy('ano', 'asc'))),
            getDocs(query(collection(db, 'apoiadores'), orderBy('createdAt', 'desc'))),
        ]);

        newsCache = newsSnap.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                title: data.titulo || '',
                sub: data.autor ? `Por ${data.autor}` : '',
                category: 'Notícia',
                icon: 'fa-newspaper',
                link: `pages/noticia.html?id=${d.id}`,
                keywords: normalize(`${data.titulo} ${data.autor} ${data.corpo || ''}`)
            };
        });

        docsCache = docsSnap.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                title: data.nome || '',
                sub: data.categoria || '',
                category: 'Documento',
                icon: getCatIcon(data.categoria),
                link: data.link || 'pages/transparencia.html',
                external: true,
                keywords: normalize(`${data.nome} ${data.categoria}`)
            };
        });

        projetosCache = projetosSnap.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                title: data.titulo || '',
                sub: data.area || 'Projeto',
                category: 'Atuação',
                icon: 'fa-clipboard-list',
                link: 'pages/projetos.html',
                keywords: normalize(`${data.titulo} ${data.area} ${data.publico} ${data.objetivo} ${data.descricao} ${data.tags || ''}`)
            };
        });

        capacitacaoCache = capacitacaoSnap.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                title: data.titulo || '',
                sub: data.nivel ? `Curso · ${data.nivel}` : 'Curso',
                category: 'Atuação',
                icon: 'fa-graduation-cap',
                link: 'pages/capacitacao.html',
                keywords: normalize(`${data.titulo} ${data.descricao} ${data.nivel} ${(data.modulos || []).join(' ')} ${(data.tags || []).join(' ')}`)
            };
        });

        eventosCache = eventosSnap.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                title: data.titulo || '',
                sub: data.local || 'Evento',
                category: 'Atuação',
                icon: 'fa-calendar-days',
                link: 'pages/eventos.html',
                keywords: normalize(`${data.titulo} ${data.local} ${data.descricao}`)
            };
        });

        timelineCache = timelineSnap.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                title: `${data.ano} — ${data.titulo}`,
                sub: data.tag || 'Nossa História',
                category: 'Atuação',
                icon: 'fa-timeline',
                link: 'pages/nossa-historia.html',
                keywords: normalize(`${data.ano} ${data.tag} ${data.titulo} ${data.descricao}`)
            };
        });

        apoiadoresCache = apoiadoresSnap.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                title: data.nome || '',
                sub: 'Apoiador & Parceiro',
                category: 'Atuação',
                icon: 'fa-handshake',
                link: 'pages/parcerias.html',
                keywords: normalize(`${data.nome}`)
            };
        });

        cacheReady = true;
    } catch (e) {
        console.warn('[FF193 Search] Falha ao carregar cache:', e.message);
        newsCache = []; docsCache = []; projetosCache = []; capacitacaoCache = [];
        eventosCache = []; timelineCache = []; apoiadoresCache = [];
        cacheReady = true;
    } finally {
        cacheLoading = false;
    }
}

/* ── Helpers ─────────────────────────────────────────────── */
function getCatIcon(cat) {
    const m = {
        'Prestação de Contas': 'fa-file-invoice',
        'Relatórios Institucionais': 'fa-chart-line',
        'Estatuto Social': 'fa-scroll',
        'Certidões': 'fa-certificate',
        'Contratos': 'fa-file-contract',
        'Editais': 'fa-bullhorn',
        'Atas': 'fa-file-circle-check'
    };
    return m[cat] || 'fa-file';
}

function normalize(str) {
    return String(str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function escHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function highlight(text, query) {
    if (!query || !text) return escHtml(text);
    const safe = escHtml(text);
    const normText = normalize(text);
    const normQ = normalize(query);
    let out = '';
    let i = 0;
    while (i < safe.length) {
        const idx = normText.indexOf(normQ, i);
        if (idx === -1) { out += safe.slice(i); break; }
        out += safe.slice(i, idx)
            + `<mark class="search-highlight">${safe.slice(idx, idx + normQ.length)}</mark>`;
        i = idx + normQ.length;
    }
    return out;
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

    const newsResults = (newsCache || [])
        .filter(item => item.keywords.includes(norm))
        .slice(0, 4);

    const docsResults = (docsCache || [])
        .filter(item => item.keywords.includes(norm))
        .slice(0, 4);

    const projetosResults = (projetosCache || [])
        .filter(item => item.keywords.includes(norm))
        .slice(0, 3);

    const capacitacaoResults = (capacitacaoCache || [])
        .filter(item => item.keywords.includes(norm))
        .slice(0, 3);

    const eventosResults = (eventosCache || [])
        .filter(item => item.keywords.includes(norm))
        .slice(0, 3);

    const timelineResults = (timelineCache || [])
        .filter(item => item.keywords.includes(norm))
        .slice(0, 3);

    const apoiadoresResults = (apoiadoresCache || [])
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
            <div class="search-result-title">${highlight(item.title, q)}</div>
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
                <span>Tente outras palavras-chave</span>
            </div>`;
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
                if (highlightIdx >= 0 && items[highlightIdx]) {
                    items[highlightIdx].click();
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