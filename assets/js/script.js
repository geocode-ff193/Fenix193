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
    addDoc,
    query,
    orderBy,
    limit,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import {
    getAnalytics
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
const analytics = getAnalytics(firebaseApp);

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

// Fecha dropdown ao pressionar Esc
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.has-dropdown.open').forEach(el => {
            el.classList.remove('open');
        });
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

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !started) {
            started = true;
            document.querySelectorAll('.stat-item').forEach((item) => {
                const target = parseInt(item.getAttribute('data-target'), 10) || 0;
                const counter = item.querySelector('.counter');
                if (counter) animateCounter(counter, target);
            });
        }
    }, { threshold: 0.4 });

    observer.observe(statsSection);
})();

/* =============================================================
   6. TOGGLE — VER MAIS PROJETOS
   ============================================================= */
(function initProjectsToggle() {
    const btn = document.getElementById('btn-toggle-projects');
    const extraCards = document.querySelectorAll('.project-card.extra');
    const toggleLabel = document.getElementById('toggle-label');
    const toggleIcon = document.getElementById('toggle-icon');

    if (!btn || !extraCards.length) return;

    let expanded = false;

    btn.addEventListener('click', () => {
        expanded = !expanded;
        btn.setAttribute('aria-expanded', String(expanded));

        extraCards.forEach((card, i) => {
            if (expanded) {
                setTimeout(() => {
                    card.classList.remove('hidden');
                    // Força reflow para animação
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
        return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    async function fetchHomeNews() {
        try {
            const q    = query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(2));
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
                card.href      = `news.html?noticia=${d.id}`;
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
   8. FORMULÁRIO DE CONTATO
   ============================================================= */
(function initContactForm() {
    const form   = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    if (!form || !status) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = form.querySelector('.btn-submit');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando…';

        const telefoneEl = form.querySelector('#telefone');

        const payload = {
            nome:     form.nome.value.trim(),
            email:    form.email.value.trim(),
            assunto:  form.assunto?.value  || '',
            mensagem: form.mensagem.value.trim(),
            ...(telefoneEl && { telefone: telefoneEl.value.trim() }),
            read:     false,           // flag para admin saber se já leu
            createdAt: serverTimestamp()
        };

        // Basic validation
        if (!payload.mensagem) {
            status.textContent = '⚠ Preencha todos os campos obrigatórios.';
            status.className = 'form-status error';
            status.hidden = false;
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensagem';
            return;
        }

        try {
            await addDoc(collection(db, 'contacts'), payload);

            status.textContent = '✔ Mensagem enviada com sucesso! Em breve entraremos em contato.';
            status.className = 'form-status success';
            status.hidden = false;
            form.reset();

        } catch (err) {
            console.error('[Fênix 193] Erro ao enviar contato:', err);
            status.textContent = '✖ Falha ao enviar. Por favor, tente novamente.';
            status.className = 'form-status error';
            status.hidden = false;

        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensagem';
            setTimeout(() => { status.hidden = true; }, 6000);
        }
    });
})();

/* =============================================================
   9. BOTÃO "VOLTAR AO TOPO"
   ============================================================= */
(function initBackToTop() {
    const btn = document.getElementById('btn-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 380);
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
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

console.log('%c🔥 Fundação Fênix 193 — Sistema iniciado', 'color:#FF6F00;font-weight:bold;font-size:13px');