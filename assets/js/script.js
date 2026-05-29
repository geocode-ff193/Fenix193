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
                card.href = `news.html?noticia=${d.id}`;
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
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    if (!form || !status) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = form.querySelector('.btn-submit');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando…';

        const telefoneEl = form.querySelector('#telefone');

        const payload = {
            nome: form.nome.value.trim(),
            email: form.email.value.trim(),
            assunto: form.assunto?.value || '',
            mensagem: form.mensagem.value.trim(),
            ...(telefoneEl && { telefone: telefoneEl.value.trim() }),
            read: false,           // flag para admin saber se já leu
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
   9. CHATBOT FLUTUANTE — LuminIA · Guia de Ajuda Fundação Fênix 193
   ============================================================= */

class Chatbot {
    constructor() {
        this.toggle = document.getElementById('chatbotToggle');
        this.box = document.getElementById('chatbotBox');
        this.close = document.getElementById('chatbotClose');
        this.body = document.getElementById('chatbotBody');
        this.options = document.getElementById('chatbotOptions');
        this.badge = document.querySelector('.chatbot-badge');

        // Detecta se estamos numa subpágina (pages/) para ajustar o caminho do avatar
        this.avatarPath = window.location.pathname.includes('/pages/')
            ? '../assets/img/luminia.png'
            : 'assets/img/luminia.png';

        if (!this.toggle || !this.box || !this.close || !this.body || !this.options) {
            console.error('[LuminIA] Elementos do chatbot não encontrados.');
            return;
        }

        this.init();
    }

    // ── Caminho relativo para links internos ──────────────────
    _href(path) {
        const isSubpage = window.location.pathname.includes('/pages/');
        return isSubpage ? `../${path}` : path;
    }

    // ── Inicialização ─────────────────────────────────────────
    init() {
        this.toggle.addEventListener('click', () => this.toggleChat());
        this.close.addEventListener('click', () => this.closeChat());
        this.showInitialOptions();
    }

    toggleChat() {
        const isActive = this.box.classList.toggle('active');
        this.toggle.classList.toggle('active');
        if (isActive) {
            if (this.badge) this.badge.style.display = 'none';
            setTimeout(() => this.scrollToBottom(), 300);
        }
    }

    closeChat() {
        this.box.classList.remove('active');
        this.toggle.classList.remove('active');
    }

    scrollToBottom() {
        this.body.scrollTop = this.body.scrollHeight;
    }

    // ── Adiciona mensagem (bot ou usuário) ────────────────────
    addMessage(text, isUser = false, delay = 0) {
        setTimeout(() => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chatbot-message ${isUser ? 'user-message' : 'bot-message'}`;

            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.innerHTML = isUser
                ? '<i class="fas fa-user"></i>'
                : `<img src="${this.avatarPath}" alt="LuminIA">`;

            const content = document.createElement('div');
            content.className = 'message-content';

            if (Array.isArray(text)) {
                text.forEach(paragraph => {
                    const p = document.createElement('p');
                    p.innerHTML = paragraph;
                    content.appendChild(p);
                });
            } else {
                const p = document.createElement('p');
                p.innerHTML = text;
                content.appendChild(p);
            }

            messageDiv.appendChild(avatar);
            messageDiv.appendChild(content);
            this.body.appendChild(messageDiv);
            this.scrollToBottom();
        }, delay);
    }

    // ── Adiciona mensagem com link clicável ───────────────────
    addLinkMessage(label, icon, href, external = false) {
        const div = document.createElement('div');
        div.className = 'chatbot-message bot-message';
        div.innerHTML = `
<div class="message-avatar"><img src="${this.avatarPath}" alt="LuminIA"></div>
<div class="message-content">
    <p><a href="${href}" ${external ? 'target="_blank" rel="noopener"' : ''} class="chatbot-link">
        <i class="${icon}"></i> ${label}
    </a></p>
</div>`;
        this.body.appendChild(div);
        this.scrollToBottom();
    }

    // ── Indicador de digitação ────────────────────────────────
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot-message typing-message';
        typingDiv.innerHTML = `
<div class="message-avatar"><img src="${this.avatarPath}" alt="LuminIA"></div>
<div class="message-content">
    <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
    </div>
</div>`;
        this.body.appendChild(typingDiv);
        this.scrollToBottom();
        return typingDiv;
    }

    removeTypingIndicator(indicator) {
        if (indicator && indicator.parentNode) indicator.parentNode.removeChild(indicator);
    }

    clearOptions() { this.options.innerHTML = ''; }

    // ── Exibe botões de opção ─────────────────────────────────
    showOptions(optionsArray) {
        this.clearOptions();
        optionsArray.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<i class="${option.icon}"></i> ${option.text}`;
            btn.onclick = typeof option.action === 'function'
                ? option.action
                : () => this.handleOption(option);
            this.options.appendChild(btn);
        });
    }

    // ── Processa clique numa opção ────────────────────────────
    handleOption(option) {
        this.addMessage(option.text, true);
        this.clearOptions();
        const typing = this.showTypingIndicator();
        setTimeout(() => {
            this.removeTypingIndicator(typing);
            this.processAction(option.action);
        }, 900 + Math.random() * 400);
    }

    // ── Roteador de ações ─────────────────────────────────────
    processAction(action) {
        const map = {
            // Categorias principais
            'sobre': () => this.handleSobre(),
            'atuacao': () => this.handleAtuacao(),
            'como_ajudar': () => this.handleComoAjudar(),
            'transparencia': () => this.handleTransparencia(),
            'contato': () => this.handleContato(),
            'navegacao': () => this.handleNavegacao(),
            // Subcategorias — Sobre
            'quem_somos': () => this.handleQuemSomos(),
            'historia': () => this.handleHistoria(),
            'missao': () => this.handleMissao(),
            'equipe': () => this.handleEquipe(),
            // Subcategorias — Atuação
            'projetos': () => this.handleProjetos(),
            'capacitacao': () => this.handleCapacitacao(),
            'eventos': () => this.handleEventos(),
            'parcerias': () => this.handleParcerias(),
            // Subcategorias — Como ajudar
            'doacao': () => this.handleDoacao(),
            'voluntariado': () => this.handleVoluntariado(),
            'parceria_empresa': () => this.handleParceriaEmpresa(),
            // Subcategorias — Contato
            'contato_whatsapp': () => this.handleContatoWhatsApp(),
            'contato_form': () => this.handleContatoForm(),
            'contato_redes': () => this.handleContatoRedes(),
            // Navegação
            'nav_paginas': () => this.handleNavPaginas(),
            'nav_busca': () => this.handleNavBusca(),
            'nav_noticias': () => this.handleNavNoticias(),
            // Utilitários
            'back': () => this.backToMenu(),
        };
        (map[action] || (() => this.backToMenu()))();
    }

    // ══════════════════════════════════════════════════════════
    //  MENU INICIAL
    // ══════════════════════════════════════════════════════════
    showInitialOptions() {
        this.showOptions([
            { text: 'O que é a Fundação Fênix 193?', icon: 'fas fa-landmark', action: 'sobre' },
            { text: 'Projetos e atuação', icon: 'fas fa-clipboard-list', action: 'atuacao' },
            { text: 'Como posso colaborar?', icon: 'fas fa-hand-holding-heart', action: 'como_ajudar' },
            { text: 'Transparência e documentos', icon: 'fas fa-file-shield', action: 'transparencia' },
            { text: 'Falar com a Fundação', icon: 'fas fa-comments', action: 'contato' },
            { text: 'Navegar no site', icon: 'fas fa-map', action: 'navegacao' },
        ]);
    }

    // ══════════════════════════════════════════════════════════
    //  SOBRE A FUNDAÇÃO
    // ══════════════════════════════════════════════════════════
    handleSobre() {
        this.addMessage([
            '<strong>Sobre a Fundação Fênix 193 🔥</strong>',
            'Somos uma organização sem fins lucrativos que apoia o <strong>Corpo de Bombeiros Militar de Sergipe (CBMSE)</strong> e as ações de <strong>Proteção e Defesa Civil</strong>.',
            'Nosso trabalho fortalece a segurança da sociedade sergipana, valorizando quem arrisca a vida para salvar vidas.',
            'Sobre qual aspecto você quer saber mais?'
        ]);
        setTimeout(() => {
            this.showOptions([
                { text: 'Quem somos', icon: 'fas fa-users', action: 'quem_somos' },
                { text: 'Nossa história', icon: 'fas fa-book-open', action: 'historia' },
                { text: 'Missão e valores', icon: 'fas fa-bullseye', action: 'missao' },
                { text: 'Nossa equipe', icon: 'fas fa-id-badge', action: 'equipe' },
                { text: 'Voltar ao menu', icon: 'fas fa-arrow-left', action: 'back' },
            ]);
        }, 1000);
    }

    handleQuemSomos() {
        this.addMessage([
            '<strong>Quem Somos 🏛️</strong>',
            'A Fundação Fênix 193 é uma entidade privada sem fins lucrativos, com sede em Aracaju/SE, criada para fortalecer as atividades do CBMSE e da Defesa Civil.',
            'Atuamos captando recursos, promovendo capacitações, realizando eventos e firmando parcerias estratégicas em prol da segurança pública sergipana.',
        ]);
        setTimeout(() => this.addLinkMessage('Ver seção Quem Somos', 'fas fa-arrow-right', this._href('index.html#quem-somos')), 500);
        setTimeout(() => this.showBackToMenuOptions(), 1500);
    }

    handleHistoria() {
        this.addMessage([
            '<strong>Nossa História 📖</strong>',
            'A Fundação Fênix 193 nasceu da necessidade de criar um elo sólido entre a sociedade civil e o Corpo de Bombeiros Militar de Sergipe.',
            'Ao longo dos anos, construímos uma trajetória de compromisso com a segurança, a solidariedade e o desenvolvimento institucional.',
        ]);
        setTimeout(() => this.addLinkMessage('Ler nossa história completa', 'fas fa-book-open', this._href('pages/nossa-historia.html')), 500);
        setTimeout(() => this.showBackToMenuOptions(), 1500);
    }

    handleMissao() {
        this.addMessage([
            '<strong>Missão, Visão e Valores 🎯</strong>',
            '<strong>Missão:</strong> Apoiar o CBMSE e a Defesa Civil, fortalecendo a proteção da sociedade sergipana.',
            '<strong>Visão:</strong> Ser referência no apoio às instituições de segurança pública em Sergipe.',
            '<strong>Valores:</strong> Transparência, Solidariedade, Comprometimento, Inovação e Respeito à vida.',
        ]);
        setTimeout(() => this.addLinkMessage('Ver missão e valores completos', 'fas fa-bullseye', this._href('pages/missao-valores.html')), 500);
        setTimeout(() => this.showBackToMenuOptions(), 1500);
    }

    handleEquipe() {
        this.addMessage([
            '<strong>Nossa Equipe 👥</strong>',
            'A Fundação é gerida por um time dedicado de diretores, colaboradores e voluntários comprometidos com a missão institucional.',
            'Conheça os membros que fazem a Fênix 193 acontecer:',
        ]);
        setTimeout(() => this.addLinkMessage('Conhecer a equipe', 'fas fa-users', this._href('pages/equipe.html')), 500);
        setTimeout(() => this.showBackToMenuOptions(), 1500);
    }

    // ══════════════════════════════════════════════════════════
    //  ATUAÇÃO
    // ══════════════════════════════════════════════════════════
    handleAtuacao() {
        this.addMessage([
            '<strong>Projetos e Atuação 🚒</strong>',
            'A Fundação Fênix 193 desenvolve diversas frentes de atuação para fortalecer o CBMSE e a Defesa Civil.',
            'O que você quer explorar?'
        ]);
        setTimeout(() => {
            this.showOptions([
                { text: 'Projetos em andamento', icon: 'fas fa-clipboard-list', action: 'projetos' },
                { text: 'Capacitação e treinamentos', icon: 'fas fa-graduation-cap', action: 'capacitacao' },
                { text: 'Eventos', icon: 'fas fa-calendar-days', action: 'eventos' },
                { text: 'Parcerias', icon: 'fas fa-handshake', action: 'parcerias' },
                { text: 'Voltar ao menu', icon: 'fas fa-arrow-left', action: 'back' },
            ]);
        }, 900);
    }

    handleProjetos() {
        this.addMessage([
            '<strong>Projetos 📋</strong>',
            'A Fundação desenvolve projetos voltados ao aparelhamento do CBMSE, à prevenção de acidentes e à promoção da cultura de segurança em Sergipe.',
            'Cada projeto é pensado para gerar impacto real na proteção da população sergipana.',
        ]);
        setTimeout(() => this.addLinkMessage('Ver todos os projetos', 'fas fa-clipboard-list', this._href('pages/projetos.html')), 500);
        setTimeout(() => this.showBackToMenuOptions(), 1500);
    }

    handleCapacitacao() {
        this.addMessage([
            '<strong>Capacitação e Treinamentos 🎓</strong>',
            'Promovemos cursos, oficinas e treinamentos voltados tanto para bombeiros militares quanto para a população civil.',
            'As ações de capacitação incluem primeiros socorros, combate a incêndio, salvamento e proteção em situações de risco.',
        ]);
        setTimeout(() => this.addLinkMessage('Ver programas de capacitação', 'fas fa-graduation-cap', this._href('pages/capacitacao.html')), 500);
        setTimeout(() => this.showBackToMenuOptions(), 1500);
    }

    handleEventos() {
        this.addMessage([
            '<strong>Eventos 📅</strong>',
            'A Fundação Fênix 193 organiza e apoia eventos de sensibilização, arrecadação e integração com a sociedade sergipana.',
            'Fique por dentro dos próximos eventos e participe!',
        ]);
        setTimeout(() => this.addLinkMessage('Ver agenda de eventos', 'fas fa-calendar-days', this._href('pages/eventos.html')), 500);
        setTimeout(() => this.showBackToMenuOptions(), 1500);
    }

    handleParcerias() {
        this.addMessage([
            '<strong>Parcerias Institucionais 🤝</strong>',
            'Contamos com parceiros estratégicos — empresas, entidades e órgãos públicos — que acreditam na missão da Fundação.',
            'Juntos, ampliamos nosso impacto e alcançamos mais pessoas em Sergipe.',
        ]);
        setTimeout(() => this.addLinkMessage('Conhecer nossos parceiros', 'fas fa-handshake', this._href('pages/parcerias.html')), 500);
        setTimeout(() => this.showBackToMenuOptions(), 1500);
    }

    // ══════════════════════════════════════════════════════════
    //  COMO AJUDAR
    // ══════════════════════════════════════════════════════════
    handleComoAjudar() {
        this.addMessage([
            '<strong>Como Colaborar com a Fundação 💛</strong>',
            'Existem diversas formas de apoiar a missão da Fênix 193 e contribuir com a segurança de Sergipe.',
            'Como você gostaria de ajudar?'
        ]);
        setTimeout(() => {
            this.showOptions([
                { text: 'Fazer uma doação', icon: 'fas fa-donate', action: 'doacao' },
                { text: 'Ser voluntário(a)', icon: 'fas fa-hands-helping', action: 'voluntariado' },
                { text: 'Parceria empresarial', icon: 'fas fa-building', action: 'parceria_empresa' },
                { text: 'Voltar ao menu', icon: 'fas fa-arrow-left', action: 'back' },
            ]);
        }, 900);
    }

    handleDoacao() {
        this.addMessage([
            '<strong>Faça uma Doação ❤️‍🔥</strong>',
            'Sua doação financia projetos, equipamentos e ações que protegem vidas em Sergipe.',
            'Todo valor é bem-vindo e aplicado diretamente nas atividades da Fundação, com total transparência.',
            'Para realizar sua doação, entre em contato conosco pelo WhatsApp ou pelo formulário de contato.',
        ]);
        setTimeout(() => {
            this.showOptions([
                { text: 'Contato por WhatsApp', icon: 'fab fa-whatsapp', action: 'contato_whatsapp' },
                { text: 'Formulário de contato', icon: 'fas fa-envelope', action: 'contato_form' },
                { text: 'Voltar ao menu', icon: 'fas fa-arrow-left', action: 'back' },
            ]);
        }, 1000);
    }

    handleVoluntariado() {
        this.addMessage([
            '<strong>Seja Voluntário(a) 🙌</strong>',
            'Voluntários são fundamentais para ampliar o impacto da Fundação Fênix 193.',
            'Você pode colaborar em eventos, ações comunitárias, comunicação, captação de recursos e muito mais.',
            'Para se inscrever como voluntário(a), fale conosco!',
        ]);
        setTimeout(() => {
            this.showOptions([
                { text: 'Contato por WhatsApp', icon: 'fab fa-whatsapp', action: 'contato_whatsapp' },
                { text: 'Formulário de contato', icon: 'fas fa-envelope', action: 'contato_form' },
                { text: 'Voltar ao menu', icon: 'fas fa-arrow-left', action: 'back' },
            ]);
        }, 1000);
    }

    handleParceriaEmpresa() {
        this.addMessage([
            '<strong>Parceria Empresarial 🏢</strong>',
            'Empresas que apoiam a Fundação Fênix 193 ganham visibilidade, reforçam seu ESG e contribuem diretamente com a segurança pública de Sergipe.',
            'Oferecemos diferentes modalidades de parceria adaptadas ao perfil e porte de cada empresa.',
            'Quer saber mais? Entre em contato com nossa equipe!',
        ]);
        setTimeout(() => {
            this.showOptions([
                { text: 'Contato por WhatsApp', icon: 'fab fa-whatsapp', action: 'contato_whatsapp' },
                { text: 'Formulário de contato', icon: 'fas fa-envelope', action: 'contato_form' },
                { text: 'Ver parcerias atuais', icon: 'fas fa-handshake', action: 'parcerias' },
                { text: 'Voltar ao menu', icon: 'fas fa-arrow-left', action: 'back' },
            ]);
        }, 1000);
    }

    // ══════════════════════════════════════════════════════════
    //  TRANSPARÊNCIA
    // ══════════════════════════════════════════════════════════
    handleTransparencia() {
        this.addMessage([
            '<strong>Transparência e Prestação de Contas 📂</strong>',
            'A Fundação Fênix 193 é comprometida com a total transparência na gestão dos recursos públicos e privados.',
            'Você pode acessar relatórios, demonstrativos financeiros, atas e documentos institucionais na nossa página de Transparência.',
        ]);
        setTimeout(() => this.addLinkMessage('Acessar página de Transparência', 'fas fa-file-shield', this._href('pages/transparencia.html')), 500);
        setTimeout(() => {
            this.addMessage('Não encontrou o documento que precisa? Fale diretamente conosco.');
            this.showOptions([
                { text: 'Falar pelo WhatsApp', icon: 'fab fa-whatsapp', action: 'contato_whatsapp' },
                { text: 'Formulário de contato', icon: 'fas fa-envelope', action: 'contato_form' },
                { text: 'Voltar ao menu', icon: 'fas fa-arrow-left', action: 'back' },
            ]);
        }, 1500);
    }

    // ══════════════════════════════════════════════════════════
    //  CONTATO
    // ══════════════════════════════════════════════════════════
    handleContato() {
        this.addMessage([
            '<strong>Fale com a Fundação Fênix 193 📬</strong>',
            'Escolha a forma que preferir para entrar em contato com nossa equipe:',
        ]);
        setTimeout(() => {
            this.showOptions([
                { text: 'WhatsApp', icon: 'fab fa-whatsapp', action: 'contato_whatsapp' },
                { text: 'Formulário de contato', icon: 'fas fa-envelope', action: 'contato_form' },
                { text: 'Redes sociais', icon: 'fas fa-share-nodes', action: 'contato_redes' },
                { text: 'Voltar ao menu', icon: 'fas fa-arrow-left', action: 'back' },
            ]);
        }, 800);
    }

    handleContatoWhatsApp() {
        this.addMessage('Ótimo! Vou abrir o WhatsApp da Fundação para você. 📲');
        setTimeout(() => {
            this.addLinkMessage('Abrir WhatsApp da Fundação', 'fab fa-whatsapp', 'https://wa.me/5579998556740', true);
        }, 400);
        setTimeout(() => {
            this.addMessage('Nosso time responde em horário comercial. 🕘');
            this.showBackToMenuOptions();
        }, 1200);
    }

    handleContatoForm() {
        this.addMessage('Você pode enviar uma mensagem diretamente pelo formulário na seção de Contato da página inicial.');
        setTimeout(() => this.addLinkMessage('Ir para o Formulário de Contato', 'fas fa-paper-plane', this._href('index.html#contato')), 400);
        setTimeout(() => this.showBackToMenuOptions(), 1200);
    }

    handleContatoRedes() {
        this.addMessage([
            '<strong>Redes Sociais 📣</strong>',
            'Siga a Fundação Fênix 193 nas redes sociais e fique por dentro de tudo que acontece:',
        ]);
        setTimeout(() => {
            this.addLinkMessage('Instagram', 'fab fa-instagram', 'https://instagram.com/fundacaofenix193', true);
        }, 400);
        setTimeout(() => {
            this.addLinkMessage('Facebook', 'fab fa-facebook', 'https://facebook.com/fundacaofenix193', true);
        }, 700);
        setTimeout(() => this.showBackToMenuOptions(), 1400);
    }

    // ══════════════════════════════════════════════════════════
    //  NAVEGAÇÃO NO SITE
    // ══════════════════════════════════════════════════════════
    handleNavegacao() {
        this.addMessage([
            '<strong>Navegar no site 🗺️</strong>',
            'Posso te levar rapidinho a qualquer seção. O que você quer acessar?'
        ]);
        setTimeout(() => {
            this.showOptions([
                { text: 'Páginas do site', icon: 'fas fa-sitemap', action: 'nav_paginas' },
                { text: 'Usar a busca', icon: 'fas fa-magnifying-glass', action: 'nav_busca' },
                { text: 'Últimas notícias', icon: 'fas fa-newspaper', action: 'nav_noticias' },
                { text: 'Voltar ao menu', icon: 'fas fa-arrow-left', action: 'back' },
            ]);
        }, 800);
    }

    handleNavPaginas() {
        this.addMessage('Aqui estão as principais páginas do site:');
        const pages = [
            { label: 'Início', icon: 'fas fa-house', path: 'index.html' },
            { label: 'Nossa História', icon: 'fas fa-book-open', path: 'pages/nossa-historia.html' },
            { label: 'Missão e Valores', icon: 'fas fa-bullseye', path: 'pages/missao-valores.html' },
            { label: 'Equipe', icon: 'fas fa-users', path: 'pages/equipe.html' },
            { label: 'Projetos', icon: 'fas fa-clipboard-list', path: 'pages/projetos.html' },
            { label: 'Capacitação', icon: 'fas fa-graduation-cap', path: 'pages/capacitacao.html' },
            { label: 'Eventos', icon: 'fas fa-calendar-days', path: 'pages/eventos.html' },
            { label: 'Parcerias', icon: 'fas fa-handshake', path: 'pages/parcerias.html' },
            { label: 'Transparência', icon: 'fas fa-file-shield', path: 'pages/transparencia.html' },
            { label: 'Notícias', icon: 'fas fa-newspaper', path: 'pages/noticias.html' },
        ];
        pages.forEach((p, i) => {
            setTimeout(() => this.addLinkMessage(p.label, p.icon, this._href(p.path)), 300 + i * 120);
        });
        setTimeout(() => this.showBackToMenuOptions(), 300 + pages.length * 120 + 400);
    }

    handleNavBusca() {
        this.addMessage([
            '<strong>Barra de Busca 🔍</strong>',
            'No topo da página inicial há uma barra de busca onde você pode pesquisar por notícias, projetos e documentos.',
            'Basta digitar o que procura e os resultados aparecerão automaticamente!',
        ]);
        setTimeout(() => this.addLinkMessage('Ir para a busca na página inicial', 'fas fa-magnifying-glass', this._href('index.html')), 500);
        setTimeout(() => this.showBackToMenuOptions(), 1200);
    }

    handleNavNoticias() {
        this.addMessage([
            '<strong>Notícias 📰</strong>',
            'Acompanhe as últimas novidades, conquistas e ações da Fundação Fênix 193 em nossa página de notícias.',
        ]);
        setTimeout(() => this.addLinkMessage('Ver todas as notícias', 'fas fa-newspaper', this._href('pages/noticias.html')), 400);
        setTimeout(() => this.showBackToMenuOptions(), 1200);
    }

    // ══════════════════════════════════════════════════════════
    //  UTILITÁRIOS
    // ══════════════════════════════════════════════════════════
    backToMenu() {
        this.addMessage('Voltando ao menu principal... 🏠');
        setTimeout(() => {
            this.addMessage('Como posso ajudar você? 😊');
            this.showInitialOptions();
        }, 700);
    }

    showBackToMenuOptions() {
        this.showOptions([
            { text: 'Outra dúvida', icon: 'fas fa-comments', action: 'back' },
            {
                text: 'Encerrar',
                icon: 'fas fa-check-circle',
                action: () => {
                    this.addMessage('Encerrar conversa', true);
                    this.clearOptions();
                    const typing = this.showTypingIndicator();
                    setTimeout(() => {
                        this.removeTypingIndicator(typing);
                        this.addMessage(['Fico feliz em ter ajudado! 🔥', 'Qualquer dúvida, é só abrir o chat novamente. Até mais! 👋']);
                        setTimeout(() => this.closeChat(), 2500);
                    }, 1000);
                }
            }
        ]);
    }
}

// ===== INICIALIZAR CHATBOT =====
document.addEventListener('DOMContentLoaded', () => {
    new Chatbot();
    console.log('🤖 LuminIA — Guia de Ajuda da Fundação Fênix 193 inicializada!');
});

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
                card.href = `pages/noticias.html?noticia=${d.id}`;
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