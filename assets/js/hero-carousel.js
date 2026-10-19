/**
 * ============================================================
 *  FF193 — Hero em carrossel (index.html)
 *
 *  Slide 1 ...... apresentação (já está no HTML: imagem, logo e texto)
 *  Slides 2–4 ... as 3 notícias mais recentes do Firestore
 *
 *  - Sem notícias (ou sem Firebase) o hero fica só com o slide 1 e os
 *    controles não aparecem.
 *  - Troca automática (data-autoplay em #hero, em ms; 0 desliga) com
 *    PAUSAR/RETOMAR (WCAG 2.2.2). Pausa sozinho quando o mouse está em
 *    cima, o foco está dentro do hero, a aba fica oculta ou a pessoa
 *    prefere menos movimento.
 *  - Setas, pontos, teclado (← → Home End) e arrastar o dedo no celular.
 *  - Acessível: padrão "carousel" do ARIA (roledescription, "n de N",
 *    região viva só quando a rotação automática está parada).
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
    const bg = n.imagemUrl
        ? `<div class="hero-slide-bg"><img src="${esc(n.imagemUrl)}" alt="" decoding="async" fetchpriority="low"></div>`
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

/* ── Carrossel ───────────────────────────────────────────── */
function startCarousel() {
    const slides = Array.from(track.querySelectorAll('.hero-slide'));
    if (slides.length < 2) return;                 // um slide só: nada a controlar

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const interval = Number(root.dataset.autoplay ?? 7000);
    const autoplayEnabled = interval > 0;

    let current = Math.max(0, slides.findIndex(s => s.classList.contains('is-active')));
    let userWantsPlay = autoplayEnabled && !reduceMotion;   // escolha da pessoa (botão pausar)
    let hovering = false;
    let focusInside = false;
    let timer = null;

    /* Numeração acessível: "2 de 4" */
    slides.forEach((s, i) => s.setAttribute('aria-label', `${i + 1} de ${slides.length}`));

    /* Controles */
    const controls = document.createElement('div');
    controls.className = 'hero-controls';
    controls.innerHTML = `
        <div class="container">
            <div class="hero-controls-bar" role="group" aria-label="Controles do carrossel">
                <button type="button" class="hero-ctrl-btn" data-act="prev" aria-label="Slide anterior" aria-controls="hero-slides">
                    <i class="fas fa-chevron-left" aria-hidden="true"></i></button>
                <div class="hero-dots"></div>
                <button type="button" class="hero-ctrl-btn" data-act="next" aria-label="Próximo slide" aria-controls="hero-slides">
                    <i class="fas fa-chevron-right" aria-hidden="true"></i></button>
                ${autoplayEnabled ? `<button type="button" class="hero-ctrl-btn" data-act="toggle" aria-controls="hero-slides">
                    <i class="fas fa-pause" aria-hidden="true"></i></button>` : ''}
            </div>
        </div>`;
    root.appendChild(controls);
    root.classList.add('has-controls');

    const dotsWrap = controls.querySelector('.hero-dots');
    const toggleBtn = controls.querySelector('[data-act="toggle"]');
    slides.forEach((s, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'hero-dot';
        dot.setAttribute('aria-label', `Ir para o slide ${i + 1}: ${s.dataset.title || 'Apresentação'}`);
        dot.addEventListener('click', () => goTo(i, true));
        dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function isRunning() {
        return userWantsPlay && !hovering && !focusInside && !document.hidden;
    }

    function syncUi() {
        slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
        dots.forEach((d, i) => d.setAttribute('aria-current', String(i === current)));
        // Enquanto gira sozinho, NÃO anunciar a troca (seria ruído); parado, anuncia.
        track.setAttribute('aria-live', userWantsPlay ? 'off' : 'polite');
        if (toggleBtn) {
            toggleBtn.querySelector('i').className = userWantsPlay ? 'fas fa-pause' : 'fas fa-play';
            toggleBtn.setAttribute('aria-label', userWantsPlay ? 'Pausar troca automática' : 'Retomar troca automática');
        }
    }

    function schedule() {
        clearTimeout(timer);
        if (isRunning()) timer = setTimeout(() => goTo(current + 1, false), interval);
    }

    function goTo(index, byUser) {
        current = (index + slides.length) % slides.length;
        syncUi();
        schedule();
    }

    controls.addEventListener('click', e => {
        const act = e.target.closest('[data-act]')?.dataset.act;
        if (act === 'prev') goTo(current - 1, true);
        if (act === 'next') goTo(current + 1, true);
        if (act === 'toggle') { userWantsPlay = !userWantsPlay; syncUi(); schedule(); }
    });

    /* Pausa automática: mouse, foco e aba oculta */
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
            ArrowLeft: () => goTo(current - 1, true), ArrowRight: () => goTo(current + 1, true),
            Home: () => goTo(0, true), End: () => goTo(slides.length - 1, true)
        };
        if (map[e.key]) { e.preventDefault(); map[e.key](); }
    });

    /* Arrastar o dedo (toque/caneta): troca de slide sem atrapalhar a rolagem vertical */
    let startX = 0, startY = 0, tracking = false;
    track.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse') return;
        tracking = true; startX = e.clientX; startY = e.clientY;
    });
    track.addEventListener('pointerup', e => {
        if (!tracking) return;
        tracking = false;
        const dx = e.clientX - startX, dy = e.clientY - startY;
        if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(current + (dx < 0 ? 1 : -1), true);
    });
    track.addEventListener('pointercancel', () => { tracking = false; });

    syncUi();
    schedule();
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