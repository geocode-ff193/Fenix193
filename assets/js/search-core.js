/**
 * ============================================================
 *  FF193 — Núcleo de busca (compartilhado)
 *  Usado pelo dropdown do hero (search.js) e pela página de
 *  resultados (pesquisa.html → pesquisa.js).
 *
 *  Fontes pesquisadas:
 *   1. Índice curado de páginas e âncoras (STATIC_INDEX)
 *   2. Texto real das páginas do site, lido sob demanda e guardado
 *      na sessão (loadPageIndex) — assim a busca enxerga o conteúdo
 *      que existir hoje no HTML, sem precisar manter lista à mão
 *   3. Firestore: notícias, documentos, projetos, capacitação,
 *      eventos, linha do tempo e apoiadores (loadCache)
 *
 *  Todas as comparações ignoram maiúsculas e acentos.
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
    limit,
    where
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
export const STATIC_INDEX = [
    {
        title: 'Galeria de Fotos',
        sub: 'Álbuns de eventos e ações',
        category: 'Atuação',
        icon: 'fa-images',
        link: 'pages/galeria.html',
        keywords: 'galeria fotos fotografias imagens albuns album registros eventos acoes momentos',
    },
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
        title: 'Fale Conosco',
        sub: 'Formulário, município e endereço',
        category: 'Contato',
        icon: 'fa-envelope',
        link: 'pages/fale-conosco.html',
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

/* ── Categorias exibidas nos filtros da página de resultados ─ */
export const CATEGORY_META = {
    'Página': { label: 'Páginas', slug: 'pagina' },
    'Atuação': { label: 'Atuação', slug: 'atuacao' },
    'Notícia': { label: 'Notícias', slug: 'noticia' },
    'Documento': { label: 'Documentos', slug: 'documento' },
    'Contato': { label: 'Contato', slug: 'contato' },
};

/* ── Helpers de texto ────────────────────────────────────── */
export function normalize(str) {
    return String(str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

export function escHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** "Fogo e  água!" → ['fogo', 'agua'] (termos com 2+ letras, sem repetição) */
export function tokenize(q) {
    const terms = normalize(q)
        .split(/\s+/)
        .map(t => t.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
        .filter(t => t.length >= 2);
    return [...new Set(terms)];
}

/**
 * Escapa o texto e destaca os termos com <mark>.
 * Os intervalos são calculados no texto normalizado e aplicados ao texto
 * original, escapando cada trecho separadamente (assim "&", "<" etc. não
 * desalinham o destaque).
 */
export function highlightHtml(text, terms) {
    const raw = String(text || '');
    if (!raw || !terms || !terms.length) return escHtml(raw);
    const norm = normalize(raw);
    if (norm.length !== raw.length) return escHtml(raw);   // não alinha: sem destaque

    const ranges = [];
    terms.forEach(t => {
        let i = 0;
        while ((i = norm.indexOf(t, i)) !== -1) { ranges.push([i, i + t.length]); i += t.length; }
    });
    if (!ranges.length) return escHtml(raw);

    ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
    const merged = [];
    ranges.forEach(r => {
        const last = merged[merged.length - 1];
        if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
        else merged.push([r[0], r[1]]);
    });

    let out = '', pos = 0;
    merged.forEach(([s, e]) => {
        out += escHtml(raw.slice(pos, s));
        out += `<mark class="search-highlight">${escHtml(raw.slice(s, e))}</mark>`;
        pos = e;
    });
    return out + escHtml(raw.slice(pos));
}

/** Trecho do texto em torno da primeira ocorrência de um termo */
export function makeSnippet(body, terms, max = 170) {
    const raw = String(body || '').replace(/\s+/g, ' ').trim();
    if (!raw) return '';
    const norm = normalize(raw);
    let first = -1;
    if (norm.length === raw.length) {
        terms.forEach(t => {
            const i = norm.indexOf(t);
            if (i !== -1 && (first === -1 || i < first)) first = i;
        });
    }
    let start = first === -1 ? 0 : Math.max(0, first - 60);
    if (start > 0) {                                   // começa no início de uma palavra
        const sp = raw.indexOf(' ', start);
        if (sp !== -1 && sp - start < 20) start = sp + 1;
    }
    let piece = raw.slice(start, start + max);
    if (start + max < raw.length) piece = piece.replace(/\s+\S*$/, '') + '…';
    if (start > 0) piece = '…' + piece;
    return piece;
}

export function getCatIcon(cat) {
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

/* ═══════════════════════════════════════════════════════════
   FONTE 3 · FIRESTORE (cache em memória, carregado uma vez)
   ═══════════════════════════════════════════════════════════ */
export const cache = {
    news: null, docs: null, projetos: null, capacitacao: null,
    eventos: null, timeline: null, apoiadores: null, galeria: null,
    ready: false, failed: false
};

const toDate = ts => (ts && typeof ts.toDate === 'function') ? ts.toDate() : null;

let cachePromise = null;
export function loadCache() {
    if (!cachePromise) cachePromise = doLoadCache();
    return cachePromise;
}

async function doLoadCache() {
    try {
        const [newsSnap, docsSnap, projetosSnap, capacitacaoSnap, eventosSnap, timelineSnap, apoiadoresSnap, galeriaSnap] = await Promise.all([
            getDocs(query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(30))),
            getDocs(query(collection(db, 'transparency_docs'), orderBy('createdAt', 'desc'))),
            getDocs(query(collection(db, 'projetos'), orderBy('createdAt', 'desc'))),
            getDocs(query(collection(db, 'capacitacao'), orderBy('createdAt', 'desc'))),
            getDocs(query(collection(db, 'eventos'), orderBy('createdAt', 'desc'))),
            getDocs(query(collection(db, 'timeline'), orderBy('ano', 'asc'))),
            getDocs(query(collection(db, 'apoiadores'), orderBy('createdAt', 'desc'))),
            getDocs(query(collection(db, 'galeria'), where('publicado', '==', true))),
        ]);

        // "keywords" (texto normalizado) alimenta o dropdown do hero;
        // "body" (texto original) alimenta o ranking e os trechos da página de resultados.
        cache.news = newsSnap.docs.map(d => {
            const data = d.data();
            const date = toDate(data.createdAt);
            return {
                id: d.id,
                title: data.titulo || '',
                sub: data.autor ? `Por ${data.autor}` : '',
                category: 'Notícia',
                icon: 'fa-newspaper',
                link: `pages/noticia.html?id=${d.id}`,
                body: data.corpo || '',
                date, timestamp: date ? date.getTime() : 0,
                keywords: normalize(`${data.titulo} ${data.autor} ${data.corpo || ''}`)
            };
        });

        cache.docs = docsSnap.docs.map(d => {
            const data = d.data();
            const date = toDate(data.createdAt);
            return {
                id: d.id,
                title: data.nome || '',
                sub: data.categoria || '',
                category: 'Documento',
                icon: getCatIcon(data.categoria),
                link: data.link || 'pages/transparencia.html',
                external: !!data.link,
                body: data.categoria || '',
                date, timestamp: date ? date.getTime() : 0,
                keywords: normalize(`${data.nome} ${data.categoria}`)
            };
        });

        cache.projetos = projetosSnap.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                title: data.titulo || '',
                sub: data.area || 'Projeto',
                category: 'Atuação',
                icon: 'fa-clipboard-list',
                link: 'pages/projetos.html',
                body: [data.area, data.publico, data.objetivo, data.descricao].filter(Boolean).join('. '),
                keywords: normalize(`${data.titulo} ${data.area} ${data.publico} ${data.objetivo} ${data.descricao} ${data.tags || ''}`)
            };
        });

        cache.capacitacao = capacitacaoSnap.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                title: data.titulo || '',
                sub: data.nivel ? `Curso · ${data.nivel}` : 'Curso',
                category: 'Atuação',
                icon: 'fa-graduation-cap',
                link: 'pages/capacitacao.html',
                body: [data.descricao, (data.modulos || []).join(', ')].filter(Boolean).join('. '),
                keywords: normalize(`${data.titulo} ${data.descricao} ${data.nivel} ${(data.modulos || []).join(' ')} ${(data.tags || []).join(' ')}`)
            };
        });

        cache.eventos = eventosSnap.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                title: data.titulo || '',
                sub: data.local || 'Evento',
                category: 'Atuação',
                icon: 'fa-calendar-days',
                link: 'pages/eventos.html',
                body: [data.local, data.descricao].filter(Boolean).join('. '),
                keywords: normalize(`${data.titulo} ${data.local} ${data.descricao}`)
            };
        });

        cache.timeline = timelineSnap.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                title: `${data.ano} — ${data.titulo}`,
                sub: data.tag || 'Nossa História',
                category: 'Atuação',
                icon: 'fa-timeline',
                link: 'pages/nossa-historia.html',
                body: data.descricao || '',
                keywords: normalize(`${data.ano} ${data.tag} ${data.titulo} ${data.descricao}`)
            };
        });

        cache.apoiadores = apoiadoresSnap.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                title: data.nome || '',
                sub: 'Apoiador & Parceiro',
                category: 'Atuação',
                icon: 'fa-handshake',
                link: 'pages/parcerias.html',
                body: '',
                keywords: normalize(`${data.nome}`)
            };
        });

        cache.galeria = galeriaSnap.docs.map(d => {
            const data = d.data();
            const [y, m, dia] = String(data.dataEvento || '').split('-').map(Number);
            const date = y && m && dia ? new Date(y, m - 1, dia) : null;
            const total = (data.fotos || []).length;
            return {
                id: d.id,
                title: data.titulo || '',
                sub: [date ? date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '', data.local, `${total} foto${total === 1 ? '' : 's'}`].filter(Boolean).join(' · '),
                category: 'Atuação',
                icon: 'fa-images',
                link: `pages/galeria.html?album=${d.id}`,
                body: [data.local, data.descricao].filter(Boolean).join('. '),
                date, timestamp: date ? date.getTime() : 0,
                keywords: normalize(`${data.titulo} ${data.local} ${data.descricao} galeria fotos`)
            };
        });
    } catch (e) {
        console.warn('[FF193 Search] Falha ao carregar o Firestore:', e.message);
        cache.news = []; cache.docs = []; cache.projetos = []; cache.capacitacao = [];
        cache.eventos = []; cache.timeline = []; cache.apoiadores = []; cache.galeria = [];
        cache.failed = true;
    } finally {
        cache.ready = true;
    }
    return cache;
}

/* ═══════════════════════════════════════════════════════════
   FONTE 2 · TEXTO DAS PÁGINAS DO SITE
   Lê o <main> de cada página, quebra em seções por título
   (h1–h3) e guarda o texto de cada seção. O link leva à âncora
   da seção quando ela existir. Cache na sessão (30 min).
   ═══════════════════════════════════════════════════════════ */
const PAGE_SOURCES = [
    { path: 'index.html', name: 'Página inicial', category: 'Página', icon: 'fa-house' },
    { path: 'pages/nossa-historia.html', name: 'Nossa História', category: 'Página', icon: 'fa-book-open' },
    { path: 'pages/missao-valores.html', name: 'Missão e Valores', category: 'Página', icon: 'fa-bullseye' },
    { path: 'pages/equipe.html', name: 'Equipe', category: 'Página', icon: 'fa-users' },
    { path: 'pages/transparencia.html', name: 'Transparência', category: 'Documento', icon: 'fa-folder-open' },
    { path: 'pages/projetos.html', name: 'Projetos', category: 'Atuação', icon: 'fa-clipboard-list' },
    { path: 'pages/capacitacao.html', name: 'Capacitação', category: 'Atuação', icon: 'fa-graduation-cap' },
    { path: 'pages/eventos.html', name: 'Eventos', category: 'Atuação', icon: 'fa-calendar-days' },
    { path: 'pages/parcerias.html', name: 'Parcerias', category: 'Atuação', icon: 'fa-handshake' },
    { path: 'pages/noticias.html', name: 'Notícias', category: 'Página', icon: 'fa-newspaper' },
    { path: 'pages/fale-conosco.html', name: 'Fale Conosco', category: 'Contato', icon: 'fa-envelope' },
];
const PAGE_INDEX_KEY = 'ff193_page_index_v1';
const PAGE_INDEX_TTL = 30 * 60 * 1000;
const BLOCK_SELECTOR = 'h1,h2,h3,h4,p,li,td,th,blockquote,figcaption,dt,dd';

export const pageIndex = { items: [], failedPages: 0, ready: false };

function anchorFor(el, main) {
    for (let n = el; n && n !== main; n = n.parentElement) if (n.id) return n.id;
    const section = el.closest('section');
    const prev = section && section.previousElementSibling;
    if (prev && prev.id && !prev.textContent.trim()) return prev.id;   // padrão <p id="x"></p> antes da <section>
    return '';
}

function extractSections(html, source) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const main = doc.querySelector('main');
    if (!main) return [];
    main.querySelectorAll('script,style,noscript,svg,iframe,form,select,option,textarea,[hidden],[aria-hidden="true"]')
        .forEach(n => n.remove());

    // blocos de texto "folha" (descarta o que contém outros blocos, p. ex. <li><p>…</p></li>)
    const blocks = Array.from(main.querySelectorAll(BLOCK_SELECTOR))
        .filter(el => !el.querySelector(BLOCK_SELECTOR));

    const sections = [];
    let current = null;
    blocks.forEach(el => {
        const text = el.textContent.replace(/\s+/g, ' ').trim();
        if (!text) return;
        if (/^H[1-3]$/.test(el.tagName)) {
            current = { title: text, anchor: anchorFor(el, main), parts: [] };
            sections.push(current);
        } else {
            if (!current) { current = { title: source.name, anchor: '', parts: [] }; sections.push(current); }
            current.parts.push(text);
        }
    });

    return sections
        .map(s => ({
            title: s.title,
            sub: source.name,
            category: source.category,
            icon: source.icon,
            link: source.path + (s.anchor ? '#' + s.anchor : ''),
            body: s.parts.join(' ').slice(0, 1500),
            page: source.path
        }))
        .filter(s => s.title || s.body);
}

async function fetchWithTimeout(url, ms = 8000) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try {
        const res = await fetch(url, { signal: ctrl.signal, credentials: 'same-origin' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return await res.text();
    } finally {
        clearTimeout(timer);
    }
}

let pagePromise = null;
export function loadPageIndex() {
    if (!pagePromise) pagePromise = doLoadPageIndex();
    return pagePromise;
}

async function doLoadPageIndex() {
    try {
        const saved = JSON.parse(sessionStorage.getItem(PAGE_INDEX_KEY) || 'null');
        if (saved && Date.now() - saved.t < PAGE_INDEX_TTL && Array.isArray(saved.items)) {
            pageIndex.items = saved.items;
            pageIndex.ready = true;
            return pageIndex;
        }
    } catch { /* sessionStorage indisponível ou corrompido: refaz a leitura */ }

    const results = await Promise.allSettled(PAGE_SOURCES.map(async src => {
        const html = await fetchWithTimeout(new URL(src.path, document.baseURI).href);
        return extractSections(html, src);
    }));

    const items = [];
    results.forEach(r => {
        if (r.status === 'fulfilled') items.push(...r.value);
        else pageIndex.failedPages++;
    });
    pageIndex.items = items;
    pageIndex.ready = true;

    // só guarda se tudo deu certo (evita "congelar" um índice incompleto)
    if (pageIndex.failedPages === 0) {
        try { sessionStorage.setItem(PAGE_INDEX_KEY, JSON.stringify({ t: Date.now(), items })); } catch { /* ignora */ }
    }
    return pageIndex;
}

/* ═══════════════════════════════════════════════════════════
   BUSCA + RELEVÂNCIA
   - Todos os termos precisam aparecer (E), em qualquer ordem.
   - Título pesa mais que palavras-chave, que pesam mais que o texto.
   - Frase exata e itens recentes ganham um bônus.
   ═══════════════════════════════════════════════════════════ */
function rankItems(items, terms) {
    const phrase = terms.join(' ');
    const scored = [];

    items.forEach(it => {
        const t = it._t ??= normalize(it.title);
        const k = it._k ??= normalize(it.kw || '');
        const b = it._b ??= normalize(it.body || '');
        let score = 0;
        for (const term of terms) {
            const inT = t.includes(term), inK = k.includes(term), inB = b.includes(term);
            if (!inT && !inK && !inB) return;                       // falta um termo → descarta
            if (inT) { score += 8; score += t.startsWith(term) ? 4 : (t.includes(' ' + term) ? 2 : 0); }
            if (inK) score += 3;
            if (inB) {
                score += 1;
                let c = 0, i = -1;
                while (c < 5 && (i = b.indexOf(term, i + 1)) !== -1) c++;
                score += c * 0.3;                                    // repetição, com teto
            }
        }
        if (terms.length > 1) score += t.includes(phrase) ? 10 : (b.includes(phrase) ? 3 : 0);
        if (it.curated) score += 2;
        scored.push({ it, score });
    });

    scored.sort((a, b) => b.score - a.score || (b.it.timestamp || 0) - (a.it.timestamp || 0));
    return scored.map(s => ({ ...s.it, score: s.score }));
}

/** Pesquisa em todas as fontes. Retorna { terms, results, counts, notices } */
export async function searchAll(q) {
    const terms = tokenize(q);
    if (!terms.length) return { terms, results: [], counts: {}, notices: [] };

    const [dyn, pages] = await Promise.all([loadCache(), loadPageIndex()]);

    // Itens curados (páginas/âncoras): título + palavras-chave
    const curated = STATIC_INDEX.map(s => ({
        title: s.title, sub: s.sub, category: s.category, icon: s.icon,
        link: s.link, kw: s.keywords, body: s.sub, curated: true
    }));
    const curatedKeys = new Set(curated.map(c => normalize(c.title) + '|' + c.link.split('#')[0]));

    // Seções lidas das páginas (evita repetir o que o índice curado já mostra)
    const crawled = pages.items.filter(s => !curatedKeys.has(normalize(s.title) + '|' + s.page));

    const dynamic = [
        ...dyn.news, ...dyn.docs, ...dyn.projetos, ...dyn.capacitacao,
        ...dyn.eventos, ...dyn.timeline, ...dyn.apoiadores, ...dyn.galeria
    ];

    const results = rankItems([...curated, ...crawled, ...dynamic], terms);

    const counts = { todos: results.length };
    results.forEach(r => { counts[r.category] = (counts[r.category] || 0) + 1; });

    const notices = [];
    if (dyn.failed) notices.push('Não foi possível consultar notícias, documentos e projetos agora. Exibindo apenas o conteúdo das páginas.');
    if (pages.failedPages > 0) notices.push('Algumas páginas do site não puderam ser lidas; os resultados podem estar incompletos.');

    return { terms, results, counts, notices };
}