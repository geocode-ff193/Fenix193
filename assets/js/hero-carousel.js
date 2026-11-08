/**
 * ============================================================
 *  FF193 — Hero em carrossel (index.html)
 *
 *  Slide 1 ...... apresentação (já está no HTML: imagem, logo e texto)
 *  Slides 2–4 ... as 3 notícias mais recentes do Firestore
 *
 *  - Sem notícias (ou sem Firebase) o hero fica só com o slide 1 e os
 *    controles não aparecem.
 *  - Troca automática (data-autoplay em #hero, em ms; 0 desliga). Ela PAUSA
 *    sozinha enquanto o mouse está sobre o hero, o foco está dentro dele, a
 *    aba fica oculta ou há toque na tela; e nem começa se a pessoa prefere
 *    menos movimento.
 *  - Guia de pontos centralizado embaixo, clicável (e acessível por teclado
 *    com ← → Home End). No celular também dá para arrastar o dedo.
 *  - Acessível: padrão "carousel" do ARIA (roledescription, "n de N",
 *    região viva só quando a troca automática está parada).
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
import { cld, cldSrcset } from './img-utils.js';

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDJXiMyq4ncZb4neX5Rur71-l6adRZ7v3M",
    authDomain: "fundacaofenix193.firebaseapp.com",
    projectId: "fundacaofenix193",
    storageBucket: "fundacaofenix193.firebasestorage.app",
    messagingSenderId: "263835472373",
    appId: "1:263835472373:web:492921e00e51a1e74750bc"
};

const NEWS_COUNT = 3;
const EXCERPT_LENGTH = 170;
const SWIPE_MIN_PX = 50;

const root = document.getElementById('hero');
const track = document.getElementById('hero-slides');

/* ── Utilidades ──────────────────────────────────────────── */
const esc = s => String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function excerpt(text) {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (clean.length <= EXCERPT_LENGTH) return clean;
    return clean.slice(0, EXCERPT_LENGTH).replace(/\s+\S*$/, '') + '…';
}

function formatDate(ts) {
    const d = ts && typeof ts.toDate === 'function' ? ts.toDate() : (ts ? new Date(ts) : null);
    return d && !isNaN(d)
        ? { label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }), iso: d.toISOString().slice(0, 10) }
        : null;
}

/* ── Slide de notícia ────────────────────────────────────── */
function buildNewsSlide(id, n) {
    const href = `pages/noticia.html?id=${encodeURIComponent(id)}`;
    const date = formatDate(n.createdAt);
    // A foto só é baixada quando o slide está perto de aparecer (ver warm/loadSlideImage):
    // no celular, 3 fotos grandes competindo com o 1º slide atrasavam o LCP.
    const srcset = cldSrcset(n.imagemUrl, [640, 1024, 1600]);
    const bg = n.imagemUrl
        ? `<div class="hero-slide-bg"><img data-src="${esc(cld(n.imagemUrl, 1024))}"${srcset ? ` data-srcset="${esc(srcset)}" sizes="100vw"` : ''} alt="" decoding="async"></div>`
        : `<div class="hero-slide-bg hero-slide-bg--placeholder" aria-hidden="true"><i class="fas fa-fire-flame-curved"></i></div>`;
    const summary = excerpt(n.corpo);

    const slide = document.createElement('article');
    slide.className = 'hero-slide hero-slide--news';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.dataset.title = n.titulo || 'Notícia';
    slide.innerHTML = `
        ${bg}
        <div class="container">
            <div class="hero-news-content">
                <p class="hero-news-kicker">
                    <span><i class="fas fa-newspaper" aria-hidden="true"></i> Últimas notícias</span>
                    ${date ? `<time datetime="${date.iso}">${esc(date.label)}</time>` : ''}
                </p>
                <h2 class="hero-news-title"><a href="${href}">${esc(n.titulo)}</a></h2>
                ${summary ? `<p class="hero-news-excerpt">${esc(summary)}</p>` : ''}
                <div class="hero-news-actions">
                    <a class="hero-btn hero-btn--primary" href="${href}">Ler notícia <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
                    <a class="hero-btn hero-btn--ghost" href="pages/noticias.html">Ver todas as notícias</a>
                </div>
            </div>
        </div>`;
    return slide;
}

/* ── Carregamento tardio das fotos dos slides ─────────────── */
function loadSlideImage(slide) {
    const img = slide && slide.querySelector('img[data-src]');
    if (!img) return;
    if (img.dataset.srcset) img.srcset = img.dataset.srcset;
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
    img.removeAttribute('data-srcset');
}

// Executa depois que a página terminou de carregar e o navegador está ocioso.
function afterLoad(fn) {
    const run = () => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 1500));
    if (document.readyState === 'complete') run();
    else window.addEventListener('load', run, { once: true });
}

/* ── Carrossel ───────────────────────────────────────────── */
function startCarousel() {
    const slides = Array.from(track.querySelectorAll('.hero-slide'));
    if (slides.length < 2) return;                 // um slide só: nada a controlar

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const interval = Number(root.dataset.autoplay ?? 7000);
    const autoplay = interval > 0 && !reduceMotion;

    let current = Math.max(0, slides.findIndex(s => s.classList.contains('is-active')));
    let hovering = false;        // mouse sobre o hero (ou toque recente)
    let focusInside = false;
    let timer = null;
    let touchTimer = null;

    /* Numeração acessível: "2 de 4" */
    slides.forEach((s, i) => s.setAttribute('aria-label', `${i + 1} de ${slides.length}`));

    /* Guia de pontos */
    const controls = document.createElement('div');
    controls.className = 'hero-controls';
    controls.innerHTML = `<div class="hero-dots" role="group" aria-label="Escolher slide"></div>`;
    root.appendChild(controls);
    root.classList.add('has-controls');

    const dotsWrap = controls.firstElementChild;
    slides.forEach((s, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'hero-dot';
        dot.setAttribute('aria-label', `Ir para o slide ${i + 1}: ${s.dataset.title || 'Apresentação'}`);
        dot.setAttribute('aria-controls', 'hero-slides');
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    const isRunning = () => autoplay && !hovering && !focusInside && !document.hidden;

    function syncUi() {
        slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
        dots.forEach((d, i) => d.setAttribute('aria-current', String(i === current)));
    }

    function schedule() {
        clearTimeout(timer);
        // Girando sozinho NÃO se anuncia a troca (seria ruído); parado, anuncia.
        track.setAttribute('aria-live', isRunning() ? 'off' : 'polite');
        if (isRunning()) timer = setTimeout(() => goTo(current + 1), interval);
    }

    function warm(i) { loadSlideImage(slides[(i + slides.length) % slides.length]); }

    function goTo(index) {
        current = (index + slides.length) % slides.length;
        warm(current);          // garante a foto do slide que vai aparecer
        warm(current + 1);      // e já adianta a do próximo
        syncUi();
        schedule();
    }

    /* Pausa automática: mouse em cima, foco dentro, aba oculta */
    root.addEventListener('mouseenter', () => { hovering = true; schedule(); });
    root.addEventListener('mouseleave', () => { hovering = false; schedule(); });
    root.addEventListener('focusin', () => { focusInside = true; schedule(); });
    root.addEventListener('focusout', e => {
        if (!root.contains(e.relatedTarget)) { focusInside = false; schedule(); }
    });
    document.addEventListener('visibilitychange', schedule);

    /* Teclado: ← → Home End quando o foco está dentro do hero */
    root.addEventListener('keydown', e => {
        if (e.target.closest('input, textarea, select')) return;
        const map = {
            ArrowLeft: () => goTo(current - 1), ArrowRight: () => goTo(current + 1),
            Home: () => goTo(0), End: () => goTo(slides.length - 1)
        };
        if (map[e.key]) { e.preventDefault(); map[e.key](); }
    });

    /* Toque/caneta: segurar a tela pausa (como o mouse em cima) e arrastar troca de slide */
    let startX = 0, startY = 0, tracking = false;
    track.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse') return;
        clearTimeout(touchTimer);
        hovering = true; schedule();
        tracking = true; startX = e.clientX; startY = e.clientY;
    });
    const releaseTouch = () => {
        clearTimeout(touchTimer);
        touchTimer = setTimeout(() => { hovering = false; schedule(); }, 6000);   // volta a girar depois de 6 s
    };
    track.addEventListener('pointerup', e => {
        if (!tracking) return;
        tracking = false;
        const dx = e.clientX - startX, dy = e.clientY - startY;
        if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(current + (dx < 0 ? 1 : -1));
        releaseTouch();
    });
    track.addEventListener('pointercancel', () => { tracking = false; releaseTouch(); });

    syncUi();
    schedule();
    afterLoad(() => warm(1));   // 2º slide: só depois que a página carregou
}

/* ── Início ──────────────────────────────────────────────── */
async function loadNews() {
    try {
        const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
        const db = getFirestore(app);
        const snap = await getDocs(query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(NEWS_COUNT)));
        snap.forEach(d => track.appendChild(buildNewsSlide(d.id, d.data())));
    } catch (e) {
        console.warn('[FF193] Hero: não foi possível carregar as notícias.', e.message);
    }
    startCarousel();
}

if (root && track) loadNews();