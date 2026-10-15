/**
 * ============================================================
 *  FUNDAÇÃO FÊNIX 193 — app.js
 *  Vanilla JS · Firebase Firestore v9 (compat CDN)
 * ============================================================
 */

// ── Imports Firebase ─────────────────────────────────────────
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    doc,
    query,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import {
    getAnalytics,
    setAnalyticsCollectionEnabled
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";

// ── Configuração Firebase ─────────────────────────────────────
// Substitua pelos dados reais do seu projeto Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDJXiMyq4ncZb4neX5Rur71-l6adRZ7v3M",
    authDomain: "fundacaofenix193.firebaseapp.com",
    projectId: "fundacaofenix193",
    storageBucket: "fundacaofenix193.firebasestorage.app",
    messagingSenderId: "263835472373",
    appId: "1:263835472373:web:492921e00e51a1e74750bc",
    measurementId: "G-RLZ4YRBC6K"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

/* ── Consentimento de Cookies (LGPD) ─────────────────────────
   O Firebase Analytics SÓ é inicializado se o usuário aceitar.
   Caso recuse, nenhum dado analítico é coletado.
   ──────────────────────────────────────────────────────────── */
const COOKIE_KEY = 'ff193_cookie_consent';

function initAnalytics() {
    try {
        const analyticsInstance = getAnalytics(firebaseApp);
        setAnalyticsCollectionEnabled(analyticsInstance, true);
    } catch (e) {
        console.warn('[FF193] Analytics não pôde ser iniciado:', e.message);
    }
}

function disableAnalytics() {
    try {
        // Garante coleta desativada caso já exista instância
        const analyticsInstance = getAnalytics(firebaseApp);
        setAnalyticsCollectionEnabled(analyticsInstance, false);
    } catch (_) { /* instância não existe, seguro ignorar */ }
}

(function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    const btnAccept = document.getElementById('cookie-accept');
    const btnDecline = document.getElementById('cookie-decline');
    if (!banner || !btnAccept || !btnDecline) return;

    const consent = localStorage.getItem(COOKIE_KEY);

    if (consent === 'accepted') {
        // Usuário já aceitou anteriormente → ativa analytics e oculta banner
        initAnalytics();
        return;
    }

    // Sem consentimento ou recusado anteriormente: exibe banner e bloqueia analytics
    disableAnalytics();
    banner.removeAttribute('hidden');

    btnAccept.addEventListener('click', () => {
        localStorage.setItem(COOKIE_KEY, 'accepted');
        banner.setAttribute('hidden', '');
        initAnalytics();
    });

    btnDecline.addEventListener('click', () => {
        // NÃO persiste nada no localStorage → banner reaparece a cada visita
        // Remove chave se existia de sessão anterior
        localStorage.removeItem(COOKIE_KEY);
        banner.setAttribute('hidden', '');
        disableAnalytics();
        // Informa no console para fins de auditoria
        console.info('[FF193] Usuário recusou cookies — coleta de dados desativada.');
    });
})();

/* =============================================================
   1. MENU MOBILE
   ============================================================= */
// ── Menu hamburger ──────────────────────────────────────
const btnMobile = document.getElementById('btn-mobile');
const menu = document.getElementById('menu');

btnMobile.addEventListener('click', () => {
    const open = menu.classList.toggle('active');
    btnMobile.classList.toggle('open', open);
    btnMobile.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
});

// ── Fecha o menu mobile ao navegar por um link (exceto os que abrem submenu) ──
document.querySelectorAll('#menu a:not(.dropdown-trigger)').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth > 768) return; // no desktop o menu nem usa .active
        menu.classList.remove('active');
        btnMobile.classList.remove('open');
        btnMobile.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
    });
});

// ── Dropdowns (mobile: toggle via clique no trigger) ────
document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        if (window.innerWidth > 768) return; // desktop usa hover puro via CSS
        e.preventDefault();
        const li = trigger.closest('.has-dropdown');
        const isOpen = li.classList.contains('open');

        // Fecha todos antes de abrir o clicado
        document.querySelectorAll('.has-dropdown.open').forEach(el => {
            if (el !== li) {
                el.classList.remove('open');
                el.querySelector('.dropdown-trigger').setAttribute('aria-expanded', 'false');
            }
        });

        li.classList.toggle('open', !isOpen);
        trigger.setAttribute('aria-expanded', String(!isOpen));
    });
});

// Fecha dropdown ao clicar fora (desktop)
document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-dropdown')) {
        document.querySelectorAll('.has-dropdown.open').forEach(el => {
            el.classList.remove('open');
            el.querySelector('.dropdown-trigger').setAttribute('aria-expanded', 'false');
        });
    }
});

// Fecha dropdown (e o menu mobile em tela cheia) ao pressionar Esc
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.has-dropdown.open').forEach(el => {
            el.classList.remove('open');
        });
        if (menu.classList.contains('active')) {
            menu.classList.remove('active');
            btnMobile.classList.remove('open');
            btnMobile.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
        }
    }
});

/* =============================================================
   2. HEADER FIXO — muda aparência ao rolar
   ============================================================= */
(function initStickyHeader() {
    const header = document.getElementById('main-header');
    if (!header) return;

    const onScroll = () => {
        header.style.boxShadow = window.scrollY > 40
            ? '0 4px 24px rgba(0,0,0,.4)'
            : '0 2px 16px rgba(0,0,0,.3)';
    };

    window.addEventListener('scroll', onScroll, { passive: true });
})();

/* =============================================================
   3. SCROLL REVEAL (Intersection Observer)
   ============================================================= */
(function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    revealEls.forEach(el => observer.observe(el));
})();

/* =============================================================
   4. CONTADORES ANIMADOS (Números que Impactam)
   ============================================================= */
(function initCounters() {
    const statsSection = document.querySelector('.stats-container');
    if (!statsSection) return;

    // Ordem usada se o item não tiver o atributo data-stat
    const STAT_KEYS = ['pessoasBeneficiadas', 'projetosRealizados', 'bombeirosApoiados', 'acoesEducativas'];
    const items = Array.from(document.querySelectorAll('.stat-item'));
    const statKey = (item, i) => item.dataset.stat || STAT_KEYS[i];

    // Valores editados no AkanniHUB (aba Números): coleção "site_stats", documento "impacto".
    // Se o documento não existir ou a leitura falhar, usa o data-target do HTML (se for > 0)
    // ou mostra "—" — nunca um "0+" enganoso.
    const statsReady = (async () => {
        try {
            const snap = await getDoc(doc(db, 'site_stats', 'impacto'));
            if (!snap.exists()) return;
            const data = snap.data();
            items.forEach((item, i) => {
                const value = Number(data[statKey(item, i)]);
                if (Number.isFinite(value) && value >= 0) {
                    item.setAttribute('data-target', String(Math.floor(value)));
                    item.dataset.loaded = '1';
                }
            });
        } catch (e) {
            console.error('[Fênix 193] Erro ao carregar números de impacto:', e);
        }
    })();

    let started = false;

    const animateCounter = (el, target, duration = 1800) => {
        const start = performance.now();
        const easeOut = t => 1 - Math.pow(1 - t, 3);

        const step = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.floor(easeOut(progress) * target);

            el.textContent = value.toLocaleString('pt-BR') + (progress === 1 ? '+' : '');

            if (progress < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting && !started) {
            started = true;
            await statsReady;                       // garante que os números do banco já chegaram
            items.forEach((item) => {
                const target = parseInt(item.getAttribute('data-target'), 10) || 0;
                const counter = item.querySelector('.counter');
                if (!counter) return;
                if (item.dataset.loaded || target > 0) animateCounter(counter, target);
                else counter.textContent = '—';
            });
        }
    }, { threshold: 0.4 });

    observer.observe(statsSection);
})();

/* =============================================================
   6. PROJETOS EM DESTAQUE (dinâmico — coleção "projetos")
   ============================================================= */
(function initHomeProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    const toggleWrap = document.getElementById('projects-toggle-wrap');
    const btn = document.getElementById('btn-toggle-projects');
    const toggleLabel = document.getElementById('toggle-label');
    const toggleIcon = document.getElementById('toggle-icon');

    const STATUS_MAP = {
        planning: { tagClass: 'tag-planning', label: 'Em Planejamento' },
        active: { tagClass: 'tag-active', label: 'Em Andamento' },
        deactive: { tagClass: 'tag-deactive', label: 'Finalizado' },
        course: { tagClass: 'tag-course', label: 'Curso' },
    };
    const FEATURED_COUNT = 3;

    function escHtml(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function buildProjectCard(p, isFeatured) {
        const s = STATUS_MAP[p.status] || STATUS_MAP.planning;
        const card = document.createElement('div');
        card.className = isFeatured ? 'project-card featured' : 'project-card extra hidden';
        card.innerHTML = `
            <div class="project-img-area">
                <i class="${escHtml(p.icone || 'fas fa-clipboard-list')}"></i>
            </div>
            <div class="project-body">
                <span class="tag ${s.tagClass}">${s.label}</span>
                <h4>${escHtml(p.titulo)}</h4>
                <p>${escHtml(p.descricao)}</p>
                <a href="pages/projetos.html" class="project-link">Saiba mais <i class="fas fa-arrow-right"></i></a>
            </div>`;
        return card;
    }

    function bindToggle() {
        const extraCards = document.querySelectorAll('.project-card.extra');
        if (!btn || !extraCards.length) {
            if (toggleWrap) toggleWrap.style.display = 'none';
            return;
        }
        if (toggleWrap) toggleWrap.style.display = '';

        let expanded = false;
        btn.addEventListener('click', () => {
            expanded = !expanded;
            btn.setAttribute('aria-expanded', String(expanded));

            extraCards.forEach((card, i) => {
                if (expanded) {
                    setTimeout(() => {
                        card.classList.remove('hidden');
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        requestAnimationFrame(() => {
                            card.style.transition = 'opacity .4s ease, transform .4s ease';
                            card.style.opacity = '1';
                            card.style.transform = 'none';
                        });
                    }, i * 80);
                } else {
                    card.classList.add('hidden');
                }
            });

            toggleLabel.textContent = expanded ? 'Mostrar menos projetos' : 'Ver todos os projetos';
            toggleIcon.className = expanded ? 'fas fa-minus-circle' : 'fas fa-plus-circle';
        });
    }

    async function fetchHomeProjects() {
        try {
            const q = query(collection(db, 'projetos'), orderBy('createdAt', 'desc'), limit(9));
            const snap = await getDocs(q);

            grid.innerHTML = '';

            if (snap.empty) {
                grid.innerHTML = `
                    <div style="grid-column:1/-1;text-align:center;padding:40px 24px;color:var(--text-muted);">
                        <i class="fas fa-clipboard-list" style="font-size:2rem;opacity:.2;display:block;margin-bottom:12px;"></i>
                        <p>Nenhum projeto publicado ainda.</p>
                    </div>`;
                if (toggleWrap) toggleWrap.style.display = 'none';
                return;
            }

            snap.docs.forEach((d, i) => grid.appendChild(buildProjectCard(d.data(), i < FEATURED_COUNT)));
            bindToggle();

        } catch (e) {
            console.error('[Fênix 193] Erro ao carregar projetos home:', e);
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">
                <p>Não foi possível carregar os projetos.</p></div>`;
            if (toggleWrap) toggleWrap.style.display = 'none';
        }
    }

    fetchHomeProjects();
})();

/* =============================================================
   7. NOTÍCIAS
   ============================================================= */
(function initHomeNews() {
    const grid = document.getElementById('home-news-grid');
    if (!grid) return;

    function fmtDate(ts) {
        if (!ts) return '';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function escHtml(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    async function fetchHomeNews() {
        try {
            const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(2));
            const snap = await getDocs(q);

            grid.innerHTML = '';

            if (snap.empty) {
                grid.innerHTML = `
                    <div style="grid-column:1/-1;text-align:center;padding:48px 24px;color:var(--text-muted);">
                        <i class="fas fa-newspaper" style="font-size:2rem;opacity:.2;display:block;margin-bottom:12px;"></i>
                        <p>Nenhuma notícia publicada ainda. Fique atento!</p>
                    </div>`;
                return;
            }

            snap.forEach(d => {
                const n = d.data();
                const card = document.createElement('a');
                card.className = 'news-home-card';
                card.href = `pages/noticia.html?id=${d.id}`;
                card.setAttribute('aria-label', `Ler notícia: ${escHtml(n.titulo)}`);
                card.innerHTML = `
                    <div style="overflow:hidden;">
                        ${n.imagemUrl
                        ? `<img class="news-home-img" src="${escHtml(n.imagemUrl)}" alt="${escHtml(n.titulo)}" loading="lazy">`
                        : `<div class="news-home-img-placeholder"><i class="fas fa-fire-flame-curved"></i></div>`}
                    </div>
                    <div class="news-home-body">
                        <div class="news-home-meta">
                            <span><i class="fas fa-calendar-days"></i> ${fmtDate(n.createdAt)}</span>
                            <span><i class="fas fa-user"></i> ${escHtml(n.autor)}</span>
                        </div>
                        <h3 class="news-home-title">${escHtml(n.titulo)}</h3>
                        <p class="news-home-excerpt">${escHtml(n.corpo)}</p>
                        <span class="news-home-link">Ler mais <i class="fas fa-arrow-right"></i></span>
                    </div>`;
                grid.appendChild(card);
            });

        } catch (e) {
            console.error('[Fênix 193] Erro ao carregar notícias home:', e);
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">
                <p>Não foi possível carregar as notícias.</p></div>`;
        }
    }

    fetchHomeNews();
})();

/* =============================================================
   7.5 APOIADORES & DOADORES (dinâmico — coleção "apoiadores")
       Instituidores permanecem fixos no HTML (não vêm do Firestore).
   ============================================================= */
(function initHomeApoiadores() {
    const track = document.getElementById('track-apoiadores');
    if (!track) return;

    const wrap = track.closest('.apoiadores-track-wrap');
    const MINIMUM_FOR_ANIMATION = 5;

    function escHtml(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function escAttr(s) {
        return escHtml(s).replace(/"/g, '&quot;');
    }

    async function fetchHomeApoiadores() {
        try {
            const q = query(collection(db, 'apoiadores'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);

            if (snap.empty) {
                track.innerHTML = `<p style="padding:12px 20px;color:var(--text-muted);">Em breve, novos apoiadores.</p>`;
                return;
            }

            track.innerHTML = snap.docs.map(d => {
                const a = d.data();
                const tag = a.link ? 'a' : 'div';
                const attrs = a.link ? `href="${escAttr(a.link)}" target="_blank" rel="noopener noreferrer"` : '';
                return `
                    <${tag} ${attrs}>
                        <div class="apoiador-card">
                            <div class="apoiador-img-wrap">
                                <img src="${escAttr(a.foto)}" alt="${escAttr(a.nome)}" width="60" height="60" loading="lazy">
                            </div>
                            <span class="apoiador-name">${escHtml(a.nome)}</span>
                        </div>
                    </${tag}>`;
            }).join('');

            // Classifica animação/estático agora que o conteúdo real está no DOM
            const cards = track.querySelectorAll('.apoiador-card');
            if (cards.length >= MINIMUM_FOR_ANIMATION) {
                track.classList.add('apoiadores-track--animated');
            } else if (wrap) {
                wrap.classList.add('apoiadores-track-wrap--static');
            }

        } catch (e) {
            console.error('[Fênix 193] Erro ao carregar apoiadores home:', e);
            track.innerHTML = `<p style="padding:12px 20px;color:var(--text-muted);">Não foi possível carregar os apoiadores.</p>`;
        }
    }

    fetchHomeApoiadores();
})();

/* =============================================================
   10. ANO DINÂMICO NO RODAPÉ
   ============================================================= */
(function setFooterYear() {
    const el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
})();

/* =============================================================
   11. SMOOTH SCROLL — LINKS ÂNCORA DO HERO
   ============================================================= */
(function initSmoothAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
})();

/* =============================================================
   12. HERO NEWS FEED — 5 mini-cards no hero-grid
   ============================================================= */
(function initHeroNewsFeed() {
    const container = document.getElementById('hero-news-feed-items');
    if (!container) return;

    function esc(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function fmtShort(ts) {
        if (!ts) return '';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
    }

    async function fetchHeroNews() {
        try {
            const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(3));
            const snap = await getDocs(q);
            container.innerHTML = '';

            if (snap.empty) {
                container.innerHTML = '<p style="font-size:.82rem;color:rgba(255,255,255,.45);padding:6px 0;">Nenhuma notícia publicada ainda.</p>';
                return;
            }

            snap.forEach(d => {
                const n = d.data();
                const card = document.createElement('a');
                card.className = 'hero-news-mini-card';
                card.href = `pages/noticia.html?id=${d.id}`;
                card.setAttribute('aria-label', `Ler: ${esc(n.titulo)}`);
                const thumb = n.imagemUrl
                    ? `<img class="hero-news-mini-thumb" src="${esc(n.imagemUrl)}" alt="" loading="lazy">`
                    : `<div class="hero-news-mini-placeholder" aria-hidden="true"><i class="fas fa-fire-flame-curved"></i></div>`;
                card.innerHTML = `
                    ${thumb}
                    <span class="hero-news-mini-title">${esc(n.titulo)}</span>
                    <span class="hero-news-mini-date">${fmtShort(n.createdAt)}</span>`;
                container.appendChild(card);
            });
        } catch (e) {
            console.warn('[FF193] Hero news feed:', e.message);
            container.innerHTML = '';
        }
    }

    fetchHeroNews();
})();

console.log('%c🔥 Fundação Fênix 193 — Sistema iniciado', 'color:#FF6F00;font-weight:bold;font-size:13px');