/**
 * ============================================================
 *  FF193 — Galeria de fotos (pages/galeria.html)
 *
 *  Duas telas na MESMA página (navegação sem recarregar, com History API):
 *    galeria.html                 → lista de álbuns (filtro por ano: ?ano=2026)
 *    galeria.html?album=ID        → fotos do álbum
 *    galeria.html?album=ID#foto=3 → abre direto a 3ª foto ampliada
 *
 *  Dados: coleção "galeria" do Firestore (só álbuns publicado == true).
 *  Imagens: Cloudinary, montadas a partir do public_id com f_auto,q_auto
 *  (WebP/AVIF automático, tamanho sob medida para cada uso).
 *
 *  Visualizador ampliado acessível: role="dialog" + aria-modal, foco preso,
 *  página de fundo "inert", Esc fecha, ← → Home End navegam, foco volta à
 *  miniatura ao fechar, o botão Voltar do navegador fecha a foto, anúncio
 *  "Foto 3 de 24" para leitores de tela e arrastar o dedo no celular.
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
    getDoc,
    doc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDJXiMyq4ncZb4neX5Rur71-l6adRZ7v3M",
    authDomain: "fundacaofenix193.firebaseapp.com",
    projectId: "fundacaofenix193",
    storageBucket: "fundacaofenix193.firebasestorage.app",
    messagingSenderId: "263835472373",
    appId: "1:263835472373:web:492921e00e51a1e74750bc"
};

const CLOUD = 'darq3foje';
const PHOTOS_PER_PAGE = 48;
const SWIPE_MIN_PX = 50;

/* ── Utilidades ──────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const cld = (publicId, transform) =>
    `https://res.cloudinary.com/${CLOUD}/image/upload/${transform}/${String(publicId).split('/').map(encodeURIComponent).join('/')}`;

// Poucos tamanhos de propósito: cada variante nova conta como uma transformação no plano do Cloudinary
const T = {
    cardCover: 'c_fill,g_auto,w_640,h_480,f_auto,q_auto',
    cardCover2x: 'c_fill,g_auto,w_1100,h_825,f_auto,q_auto',
    thumb: 'c_fill,g_auto,w_420,h_315,f_auto,q_auto',
    thumb2x: 'c_fill,g_auto,w_840,h_630,f_auto,q_auto',
    big: 'c_limit,w_1200,h_1200,f_auto,q_auto',
    big2x: 'c_limit,w_2000,h_2000,f_auto,q_auto',
    download: 'fl_attachment/c_limit,w_2400,h_2400,q_auto'
};

function formatDate(iso) {
    const [y, m, d] = String(iso || '').split('-').map(Number);
    if (!y || !m || !d) return '';
    return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

const countLabel = n => `${n} foto${n === 1 ? '' : 's'}`;
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Dados ───────────────────────────────────────────────── */
const db = getFirestore(getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG));
const cache = { albums: null };

async function loadAlbums() {
    if (cache.albums) return cache.albums;
    // where(publicado == true) é EXIGIDO pelas regras do Firestore para leitura pública
    const snap = await getDocs(query(collection(db, 'galeria'), where('publicado', '==', true)));
    cache.albums = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => String(b.dataEvento).localeCompare(String(a.dataEvento)));
    return cache.albums;
}

async function loadAlbum(id) {
    const cached = cache.albums && cache.albums.find(a => a.id === id);
    if (cached) return cached;
    try {
        const snap = await getDoc(doc(db, 'galeria', id));
        if (!snap.exists() || snap.data().publicado !== true) return null;
        return { id, ...snap.data() };
    } catch (err) {
        if (err && err.code === 'permission-denied') return null;   // rascunho / não publicado
        throw err;
    }
}

/* ── Estado e elementos ──────────────────────────────────── */
const els = {
    content: $('gal-content'),
    h1: $('gal-h1'),
    sub: $('gal-hero-sub'),
    crumb: $('gal-breadcrumb')
};
const state = { album: null, photos: [], shown: PHOTOS_PER_PAGE };
const BASE_TITLE = 'Galeria · Fundação Fênix 193';

function readUrl() {
    const p = new URLSearchParams(location.search);
    const m = /^#foto=(\d+)$/.exec(location.hash);
    return { album: p.get('album') || '', year: p.get('ano') || 'todos', foto: m ? Number(m[1]) : 0 };
}

function setHero({ title, sub, crumbs }) {
    els.h1.textContent = title;
    els.sub.textContent = sub;
    els.crumb.innerHTML = crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        const node = last || !c.href ? `<span>${esc(c.label)}</span>` : `<a href="${esc(c.href)}"${c.nav ? ' data-nav' : ''}>${esc(c.label)}</a>`;
        return (i ? '<i class="fas fa-chevron-right" aria-hidden="true"></i>' : '') + node;
    }).join('');
}

const listUrl = (year) => location.pathname + (year && year !== 'todos' ? `?ano=${encodeURIComponent(year)}` : '');

/* ── Estados da tela ─────────────────────────────────────── */
function showSkeleton(kind) {
    const n = kind === 'album' ? 8 : 6;
    els.content.innerHTML = `<div class="${kind === 'album' ? 'gal-grid' : 'gal-albums'}" aria-hidden="true">${Array.from({ length: n }, () => '<div class="gal-skeleton"></div>').join('')}</div>`;
    els.content.setAttribute('aria-busy', 'true');
}

function showState({ icon, title, text, retry, back }) {
    els.content.setAttribute('aria-busy', 'false');
    els.content.innerHTML = `
        <div class="gal-state" role="status">
            <i class="fas ${icon}" aria-hidden="true"></i>
            <h2>${esc(title)}</h2>
            <p>${esc(text)}</p>
            ${retry ? '<button type="button" class="btn-outline gal-retry">Tentar de novo</button>' : ''}
            ${back ? `<a class="btn-outline" href="${esc(listUrl())}" data-nav>Ver todos os álbuns</a>` : ''}
        </div>`;
}

/* ── Tela 1 · lista de álbuns ────────────────────────────── */
async function showList(year) {
    setHero({
        title: 'Galeria',
        sub: 'Momentos de ações, eventos e projetos da Fundação Fênix 193.',
        crumbs: [{ label: 'Início', href: '../index.html' }, { label: 'Galeria' }]
    });
    document.title = BASE_TITLE;
    showSkeleton('list');

    let albums;
    try {
        albums = await loadAlbums();
    } catch (err) {
        console.error('[FF193 Galeria] Erro ao carregar os álbuns:', err);
        showState({ icon: 'fa-triangle-exclamation', title: 'Não foi possível carregar a galeria', text: 'Verifique sua conexão e tente novamente.', retry: true });
        return;
    }
    if (!albums.length) {
        showState({ icon: 'fa-images', title: 'Em breve, novas fotos', text: 'Ainda não há álbuns publicados. Volte em breve para acompanhar os registros das nossas ações.' });
        return;
    }

    const years = [...new Set(albums.map(a => String(a.dataEvento).slice(0, 4)))].sort().reverse();
    if (year !== 'todos' && !years.includes(year)) year = 'todos';
    const visible = year === 'todos' ? albums : albums.filter(a => String(a.dataEvento).startsWith(year));

    const chips = years.length > 1 ? `
        <div class="gal-chips" role="group" aria-label="Filtrar álbuns por ano">
            ${['todos', ...years].map(y => `<button type="button" class="gal-chip" data-year="${y}" aria-pressed="${y === year}">${y === 'todos' ? 'Todos' : y}</button>`).join('')}
        </div>` : '<span></span>';

    els.content.setAttribute('aria-busy', 'false');
    els.content.innerHTML = `
        <div class="gal-toolbar">${chips}<p class="gal-count" role="status">${visible.length} ${visible.length === 1 ? 'álbum' : 'álbuns'}</p></div>
        <ul class="gal-albums">${visible.map(a => {
        const total = (a.fotos || []).length;
        const meta = [formatDate(a.dataEvento), a.local].filter(Boolean).join(' · ');
        const cover = a.capa || (a.fotos && a.fotos[0] && a.fotos[0].id);
        return `
            <li><a class="gal-card" href="?album=${encodeURIComponent(a.id)}" data-nav>
                <span class="gal-card-media">
                    ${cover ? `<img src="${esc(cld(cover, T.cardCover))}" srcset="${esc(cld(cover, T.cardCover))} 640w, ${esc(cld(cover, T.cardCover2x))} 1100w"
                        sizes="(max-width: 700px) 92vw, 320px" alt="" loading="lazy" decoding="async" width="640" height="480">` : ''}
                    <span class="gal-card-count"><i class="fas fa-images" aria-hidden="true"></i> ${total}</span>
                </span>
                <span class="gal-card-body">
                    <span class="gal-card-title">${esc(a.titulo)}</span>
                    <span class="gal-card-meta">${esc(meta)} · ${countLabel(total)}</span>
                </span>
            </a></li>`;
    }).join('')}</ul>`;
}

/* ── Tela 2 · álbum ──────────────────────────────────────── */
async function showAlbum(id, fotoFromUrl) {
    showSkeleton('album');
    setHero({ title: 'Galeria', sub: 'Carregando álbum…', crumbs: [{ label: 'Início', href: '../index.html' }, { label: 'Galeria', href: listUrl(), nav: true }] });

    let album;
    try {
        album = await loadAlbum(id);
    } catch (err) {
        console.error('[FF193 Galeria] Erro ao carregar o álbum:', err);
        showState({ icon: 'fa-triangle-exclamation', title: 'Não foi possível carregar o álbum', text: 'Verifique sua conexão e tente novamente.', retry: true, back: true });
        return;
    }
    if (!album) {
        setHero({ title: 'Álbum não encontrado', sub: 'O álbum pode ter sido removido ou ainda não foi publicado.', crumbs: [{ label: 'Início', href: '../index.html' }, { label: 'Galeria', href: listUrl(), nav: true }, { label: 'Não encontrado' }] });
        document.title = 'Álbum não encontrado · ' + BASE_TITLE;
        showState({ icon: 'fa-face-frown', title: 'Álbum não encontrado', text: 'Confira o endereço ou volte para a lista de álbuns.', back: true });
        return;
    }

    state.album = album;
    state.photos = (album.fotos || []).filter(f => f && f.id);
    state.shown = Math.max(PHOTOS_PER_PAGE, Math.ceil(fotoFromUrl / PHOTOS_PER_PAGE) * PHOTOS_PER_PAGE);

    const meta = [formatDate(album.dataEvento), album.local, countLabel(state.photos.length)].filter(Boolean).join(' · ');
    setHero({
        title: album.titulo,
        sub: meta,
        crumbs: [{ label: 'Início', href: '../index.html' }, { label: 'Galeria', href: listUrl(), nav: true }, { label: album.titulo }]
    });
    document.title = `${album.titulo} · ${BASE_TITLE}`;
    renderAlbumBody();
}

function photoAlt(i) {
    const f = state.photos[i];
    return (f.alt && f.alt.trim()) || `${state.album.titulo} — foto ${i + 1}`;
}

function renderAlbumBody() {
    const { album, photos, shown } = state;
    els.content.setAttribute('aria-busy', 'false');
    if (!photos.length) {
        els.content.innerHTML = `<a class="gal-back" href="${esc(listUrl())}" data-nav><i class="fas fa-arrow-left" aria-hidden="true"></i> Todos os álbuns</a>`
            + '<div class="gal-state" role="status"><i class="fas fa-images" aria-hidden="true"></i><h2>Este álbum ainda não tem fotos</h2></div>';
        return;
    }
    const restantes = Math.max(0, photos.length - shown);
    els.content.innerHTML = `
        <a class="gal-back" href="${esc(listUrl())}" data-nav><i class="fas fa-arrow-left" aria-hidden="true"></i> Todos os álbuns</a>
        ${album.descricao ? `<p class="gal-album-desc">${esc(album.descricao)}</p>` : ''}
        <ul class="gal-grid">${photos.slice(0, shown).map((f, i) => `
            <li><button type="button" class="gal-thumb" data-i="${i}" aria-label="Ampliar foto ${i + 1} de ${photos.length}">
                <img src="${esc(cld(f.id, T.thumb))}" srcset="${esc(cld(f.id, T.thumb))} 420w, ${esc(cld(f.id, T.thumb2x))} 840w"
                    sizes="(max-width: 700px) 46vw, 240px" alt="${esc(photoAlt(i))}" loading="lazy" decoding="async" width="420" height="315">
            </button></li>`).join('')}</ul>
        <div class="gal-more-wrap">
            <button type="button" class="btn-outline gal-more" ${restantes ? '' : 'hidden'}>Mostrar mais fotos (${restantes})</button>
        </div>`;
}

/* ══════════════════════════════════════════════════════════
   VISUALIZADOR AMPLIADO (LIGHTBOX)
   ══════════════════════════════════════════════════════════ */
const lb = {
    root: $('gal-lightbox'),
    img: $('gal-lb-img'),
    caption: $('gal-lb-caption'),
    count: $('gal-lb-count'),
    download: $('gal-lb-download'),
    error: $('gal-lb-error'),
    index: 0,
    isOpen: false,
    trigger: null,
    pushed: false,
    inerted: []
};

const lbSrc = i => cld(state.photos[i].id, T.big);

function lbShow(i) {
    const n = state.photos.length;
    lb.index = (i + n) % n;
    const f = state.photos[lb.index];
    const alt = photoAlt(lb.index);

    lb.root.classList.add('is-loading');
    lb.img.classList.add('is-loading');
    lb.error.hidden = true;
    lb.img.alt = alt;
    lb.img.srcset = `${cld(f.id, T.big)} 1200w, ${cld(f.id, T.big2x)} 2000w`;
    lb.img.sizes = '100vw';
    lb.img.src = lbSrc(lb.index);
    if (f.w && f.h) { lb.img.width = f.w; lb.img.height = f.h; }
    lb.caption.textContent = (f.alt && f.alt.trim()) || '';
    lb.count.textContent = `Foto ${lb.index + 1} de ${n}`;          // região viva: lida pelo leitor de tela
    lb.download.href = cld(f.id, T.download);

    // pré-carrega as vizinhas para a troca parecer instantânea
    [lb.index - 1, lb.index + 1].forEach(j => { if (n > 1) new Image().src = lbSrc((j + n) % n); });
}

lb.img.addEventListener('load', () => { lb.root.classList.remove('is-loading'); lb.img.classList.remove('is-loading'); });
lb.img.addEventListener('error', () => { lb.root.classList.remove('is-loading'); lb.img.classList.remove('is-loading'); lb.error.hidden = false; });

function lbSetInert(on) {
    if (on) {
        lb.inerted = Array.from(document.body.children).filter(el => el !== lb.root && !el.matches('script, link, style, noscript') && !el.inert);
        lb.inerted.forEach(el => { el.inert = true; });
    } else {
        lb.inerted.forEach(el => { el.inert = false; });
        lb.inerted = [];
    }
}

function lbOpen(i, trigger, { fromUrl = false } = {}) {
    if (!state.photos.length) return;
    lb.trigger = trigger || null;
    lb.isOpen = true;
    lb.pushed = !fromUrl;                       // true: criamos uma entrada no histórico (o Voltar a desfaz)
    lb.root.hidden = false;
    lbSetInert(true);
    document.documentElement.classList.add('gal-lb-open');
    lbShow(i);
    $('gal-lb-close').focus();                  // foco imediato dentro do diálogo
    document.addEventListener('keydown', onLbKey);
    requestAnimationFrame(() => lb.root.classList.add('is-open'));
    const url = `${location.pathname}${location.search}#foto=${lb.index + 1}`;
    if (!fromUrl) history.pushState({ lb: true }, '', url);       // o botão Voltar do navegador fecha a foto
    else history.replaceState({ lb: true }, '', url);
}

function lbHide() {
    if (!lb.isOpen) return;
    lb.isOpen = false;
    lb.pushed = false;
    document.removeEventListener('keydown', onLbKey);
    lb.root.classList.remove('is-open', 'is-loading');
    document.documentElement.classList.remove('gal-lb-open');
    lbSetInert(false);
    setTimeout(() => { if (!lb.isOpen) lb.root.hidden = true; }, reduceMotion() ? 0 : 220);
    if (lb.trigger && document.contains(lb.trigger)) lb.trigger.focus();     // devolve o foco à miniatura
    lb.trigger = null;
}

function lbClose() {
    if (!lb.isOpen) return;
    if (lb.pushed) {
        history.back();                         // o popstate faz o fechamento
    } else {                                    // aberto por link direto: não há "página anterior" para voltar
        lbHide();
        history.replaceState(null, '', location.pathname + location.search);
    }
}

function lbJump(i) {
    lbShow(i);
    history.replaceState({ lb: true }, '', `${location.pathname}${location.search}#foto=${lb.index + 1}`);
}

function lbStep(delta) {
    lbShow(lb.index + delta);
    history.replaceState({ lb: true }, '', `${location.pathname}${location.search}#foto=${lb.index + 1}`);
}

$('gal-lb-close').addEventListener('click', lbClose);
$('gal-lb-prev').addEventListener('click', () => lbStep(-1));
$('gal-lb-next').addEventListener('click', () => lbStep(1));
lb.root.addEventListener('click', e => { if (e.target === lb.root || e.target.classList.contains('gal-lb-figure')) lbClose(); });

function onLbKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); lbClose(); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); lbStep(-1); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); lbStep(1); return; }
    if (e.key === 'Home') { e.preventDefault(); lbJump(0); return; }
    if (e.key === 'End') { e.preventDefault(); lbJump(state.photos.length - 1); return; }
    if (e.key === 'Tab') {                                       // foco preso no visualizador
        const focaveis = Array.from(lb.root.querySelectorAll('button, a[href]')).filter(el => !el.hidden && el.offsetParent !== null);
        if (!focaveis.length) return;
        const first = focaveis[0], last = focaveis[focaveis.length - 1];
        if (!lb.root.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
}

// Arrastar o dedo: troca de foto
{
    let x0 = 0, y0 = 0, tracking = false;
    lb.root.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; tracking = true; x0 = e.clientX; y0 = e.clientY; });
    lb.root.addEventListener('pointerup', e => {
        if (!tracking) return;
        tracking = false;
        const dx = e.clientX - x0, dy = e.clientY - y0;
        if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 1.5) lbStep(dx < 0 ? 1 : -1);
    });
    lb.root.addEventListener('pointercancel', () => { tracking = false; });
}

/* ══════════════════════════════════════════════════════════
   ROTAS E EVENTOS
   ══════════════════════════════════════════════════════════ */
let firstRender = true;

async function route() {
    const { album, year, foto } = readUrl();
    const wasLb = lb.isOpen;
    if (wasLb) { lb.trigger = null; lbHide(); }

    // Só refaz a tela se mudou de álbum/lista (abrir/fechar foto não recarrega nada)
    const sameAlbum = album && state.album && state.album.id === album && els.content.querySelector('.gal-grid');
    if (!sameAlbum) {
        if (album) await showAlbum(album, foto);
        else { state.album = null; await showList(year); }
        if (!firstRender) {
            els.h1.setAttribute('tabindex', '-1');
            els.h1.focus({ preventScroll: true });
            els.content.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
        }
    }
    firstRender = false;

    if (album && state.album && foto >= 1 && foto <= state.photos.length) {
        if (foto > state.shown) { state.shown = Math.ceil(foto / PHOTOS_PER_PAGE) * PHOTOS_PER_PAGE; renderAlbumBody(); }
        lbOpen(foto - 1, els.content.querySelector(`.gal-thumb[data-i="${foto - 1}"]`), { fromUrl: true });
    }
}

function go(url) {
    history.pushState(null, '', url);
    route();
}

els.content.addEventListener('click', e => {
    const nav = e.target.closest('a[data-nav]');
    if (nav && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) { e.preventDefault(); go(nav.getAttribute('href')); return; }

    const chip = e.target.closest('.gal-chip');
    if (chip) {
        const y = chip.dataset.year;
        history.replaceState(null, '', listUrl(y));
        showList(y);
        return;
    }

    const thumb = e.target.closest('.gal-thumb');
    if (thumb) { lbOpen(Number(thumb.dataset.i), thumb); return; }

    if (e.target.closest('.gal-more')) {
        const antes = els.content.querySelectorAll('.gal-thumb').length;
        state.shown += PHOTOS_PER_PAGE;
        renderAlbumBody();
        els.content.querySelectorAll('.gal-thumb')[antes]?.focus();        // foco na 1ª foto nova (teclado)
        return;
    }

    if (e.target.closest('.gal-retry')) route();
});

els.crumb.addEventListener('click', e => {
    const nav = e.target.closest('a[data-nav]');
    if (nav && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) { e.preventDefault(); go(nav.getAttribute('href')); }
});

window.addEventListener('popstate', () => {
    const { foto } = readUrl();
    // Voltar com a foto aberta (e sem #foto na URL): só fecha o visualizador
    if (lb.isOpen && !foto) { lbHide(); return; }
    route();
});

route();