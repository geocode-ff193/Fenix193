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

// ── Configuração Firebase ─────────────────────────────────────
// Substitua pelos dados reais do seu projeto Firebase
const firebaseConfig = {
    apiKey:            "SUA_API_KEY",
    authDomain:        "fundacao193.firebaseapp.com",
    projectId:         "fundacao193",
    storageBucket:     "fundacao193.appspot.com",
    messagingSenderId: "000000000000",
    appId:             "1:000000000000:web:000000000000"
};

const firebaseApp = initializeApp(firebaseConfig);
const db          = getFirestore(firebaseApp);

/* =============================================================
   1. MENU MOBILE
   ============================================================= */
(function initMobileMenu() {
    const btnMobile = document.getElementById('btn-mobile');
    const menu      = document.getElementById('menu');
    if (!btnMobile || !menu) return;

    btnMobile.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('active');
        btnMobile.classList.toggle('open', isOpen);
        btnMobile.setAttribute('aria-expanded', String(isOpen));
    });

    // Fecha ao clicar em qualquer link do menu
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('active');
            btnMobile.classList.remove('open');
            btnMobile.setAttribute('aria-expanded', 'false');
        });
    });

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !btnMobile.contains(e.target)) {
            menu.classList.remove('active');
            btnMobile.classList.remove('open');
            btnMobile.setAttribute('aria-expanded', 'false');
        }
    });
})();

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
        const start     = performance.now();
        const easeOut   = t => 1 - Math.pow(1 - t, 3);

        const step = (now) => {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const value    = Math.floor(easeOut(progress) * target);

            el.textContent = value.toLocaleString('pt-BR') + (progress === 1 ? '+' : '');

            if (progress < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !started) {
            started = true;
            document.querySelectorAll('.stat-item').forEach((item) => {
                const target  = parseInt(item.getAttribute('data-target'), 10) || 0;
                const counter = item.querySelector('.counter');
                if (counter) animateCounter(counter, target);
            });
        }
    }, { threshold: 0.4 });

    observer.observe(statsSection);
})();

/* =============================================================
   5. TOGGLE — DIRETORIA
   ============================================================= */
(function initDiretoriaToggle() {
    const btn  = document.querySelector('.toggle-diretoria-btn');
    const info = document.getElementById('diretoria-info');
    if (!btn || !info) return;

    btn.addEventListener('click', () => {
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!isExpanded));

        if (isExpanded) {
            info.hidden = true;
        } else {
            info.hidden = false;
            info.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
})();

/* =============================================================
   6. TOGGLE — VER MAIS PROJETOS
   ============================================================= */
(function initProjectsToggle() {
    const btn          = document.getElementById('btn-toggle-projects');
    const extraCards   = document.querySelectorAll('.project-card.extra');
    const toggleLabel  = document.getElementById('toggle-label');
    const toggleIcon   = document.getElementById('toggle-icon');

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
        toggleIcon.className    = expanded ? 'fas fa-minus-circle' : 'fas fa-plus-circle';
    });
})();

/* =============================================================
   7. NOTÍCIAS DO FIRESTORE
   ============================================================= */

/**
 * fetchNews()
 * Busca as 3 últimas notícias da collection "noticias" no Firestore,
 * ordenadas por data decrescente.
 *
 * Estrutura esperada do documento Firestore:
 * {
 *   titulo:  string,
 *   resumo:  string,
 *   imagem:  string (URL),
 *   data:    Timestamp,
 *   link:    string (URL externo ou página interna),
 *   fonte:   string ('cbmse' | 'defesaCivil' | 'fundacao' | etc.)
 * }
 *
 * ------------------------------------------------------------
 * FUTURA INTEGRAÇÃO AUTOMÁTICA (Feed CBMSE / Defesa Civil)
 * ------------------------------------------------------------
 * OPÇÃO A — Vercel Edge Function (sem Cloud Functions):
 *   1. Crie /api/noticias.js na Vercel
 *   2. Nessa função: fetch('https://www.cbm.se.gov.br/index.php/noticias/feed')
 *      e retorne os itens como JSON
 *   3. Aqui, substitua a query Firestore por:
 *      fetch('/api/noticias').then(r => r.json())
 *
 * OPÇÃO B — Firebase Cloud Function com Agendamento (cron):
 *   1. Crie uma função Cloud Function (functions/index.js)
 *   2. Use o scheduler do Firebase (firebase-functions/v2/scheduler)
 *   3. Acesse o RSS, faça parse com 'fast-xml-parser' (npm)
 *   4. Salve cada item em db.collection('noticias')
 *   5. O front já lê o Firestore automaticamente
 *
 * OPÇÃO C — Curadoria Manual (padrão atual):
 *   Acesse o console do Firebase → Firestore → collection "noticias"
 *   e adicione documentos manualmente com os campos acima.
 * ------------------------------------------------------------
 */
async function fetchNews() {
    const container = document.getElementById('news-container');
    if (!container) return;

    try {
        const q             = query(collection(db, 'noticias'), orderBy('data', 'desc'), limit(3));
        const snapshot      = await getDocs(q);

        container.innerHTML = '';

        if (snapshot.empty) {
            container.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text-muted)">
                    <i class="fas fa-newspaper" style="font-size:2.5rem;opacity:.3;margin-bottom:12px;display:block"></i>
                    <p>Nenhuma notícia disponível no momento.</p>
                </div>`;
            return;
        }

        snapshot.forEach((doc, index) => {
            const d       = doc.data();
            const isFirst = index === 0;
            const data    = d.data?.toDate?.() ?? new Date();
            const dataFmt = data.toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' });

            const imgHtml = d.imagem
                ? `<img src="${d.imagem}" alt="${d.titulo}" class="news-img" loading="lazy">`
                : `<div class="news-img-placeholder"><i class="fas fa-fire-flame-curved"></i></div>`;

            container.innerHTML += `
                <article class="news-card ${isFirst ? 'featured' : ''}">
                    ${imgHtml}
                    <div class="news-info">
                        <span class="news-date"><i class="fas fa-calendar-alt"></i> ${dataFmt}</span>
                        <h3>${d.titulo ?? 'Sem título'}</h3>
                        <p>${d.resumo ?? ''}</p>
                        <a href="${d.link ?? `noticia.html?id=${doc.id}`}" class="news-link">
                            Ler mais <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </article>`;
        });

    } catch (err) {
        console.error('[Fênix 193] Erro ao buscar notícias:', err);
        container.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text-muted)">
                <i class="fas fa-triangle-exclamation" style="font-size:2rem;color:#EF5350;display:block;margin-bottom:10px"></i>
                <p>Erro ao carregar notícias. Tente novamente mais tarde.</p>
            </div>`;
    }
}

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
        btn.disabled    = true;
        btn.innerHTML   = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        const payload = {
            nome:     form.nome.value.trim(),
            email:    form.email.value.trim(),
            assunto:  form.assunto.value,
            mensagem: form.mensagem.value.trim(),
            createdAt: serverTimestamp()
        };

        try {
            await addDoc(collection(db, 'contatos'), payload);

            status.textContent = '✔ Mensagem enviada com sucesso! Em breve entraremos em contato.';
            status.className   = 'form-status success';
            status.hidden      = false;
            form.reset();

        } catch (err) {
            console.error('[Fênix 193] Erro ao enviar contato:', err);
            status.textContent = '✖ Falha ao enviar a mensagem. Por favor, tente novamente.';
            status.className   = 'form-status error';
            status.hidden      = false;

        } finally {
            btn.disabled  = false;
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

/* =============================================================
   INICIALIZAÇÃO
   ============================================================= */
document.addEventListener('DOMContentLoaded', () => {
    fetchNews();
    console.log('%c🔥 Fundação Fênix 193 — Sistema iniciado', 'color:#FF6F00;font-weight:bold;font-size:13px');
});