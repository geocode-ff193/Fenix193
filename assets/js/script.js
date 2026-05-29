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
   9. CHATBOT FLUTUANTE
   ============================================================= */

class Chatbot {
    constructor() {
        this.toggle = document.getElementById('chatbotToggle');
        this.box = document.getElementById('chatbotBox');
        this.close = document.getElementById('chatbotClose');
        this.body = document.getElementById('chatbotBody');
        this.options = document.getElementById('chatbotOptions');
        this.badge = document.querySelector('.chatbot-badge');

        if (!this.toggle || !this.box || !this.close || !this.body || !this.options) {
            console.error('Elementos do chatbot não encontrados');
            return;
        }

        this.conversationState = 'initial';
        this.init();
    }

    init() {
        this.toggle.addEventListener('click', () => this.toggleChat());
        this.close.addEventListener('click', () => this.closeChat());
        this.showInitialOptions();
    }

    toggleChat() {
        const isActive = this.box.classList.toggle('active');
        this.toggle.classList.toggle('active');
        if (isActive) {
            this.badge.style.display = 'none';
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

    addMessage(text, isUser = false, delay = 0) {
        setTimeout(() => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chatbot-message ${isUser ? 'user-message' : 'bot-message'}`;

            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.innerHTML = isUser
                ? '<i class="fas fa-user"></i>'
                : '<img src="../assets/img/luminia.png" alt="Bot">';

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

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot-message typing-message';
        typingDiv.innerHTML = `
<div class="message-avatar">
    <img src="../assets/img/luminia.png" alt="Bot">
</div>
<div class="message-content">
    <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
    </div>
</div>
`;
        this.body.appendChild(typingDiv);
        this.scrollToBottom();
        return typingDiv;
    }

    removeTypingIndicator(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }

    clearOptions() {
        this.options.innerHTML = '';
    }

    showOptions(optionsArray) {
        this.clearOptions();
        optionsArray.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<i class="${option.icon}"></i> ${option.text}`;

            if (typeof option.action === 'function') {
                btn.onclick = option.action;
            } else {
                btn.onclick = () => this.handleOption(option);
            }

            this.options.appendChild(btn);
        });
    }

    showInitialOptions() {
        this.showOptions([
            { text: 'Agendar uma consulta', icon: 'fas fa-ban', action: 'schedule' },
            { text: 'Tipos de terapia', icon: 'fas fa-ban', action: 'therapy' },
            { text: 'Formas de atendimento', icon: 'fas fa-ban', action: 'attendance' },
            { text: 'Entrar em contato', icon: 'fas fa-ban', action: 'contact' }
        ]);
    }

    handleOption(option) {
        this.addMessage(option.text, true);
        this.clearOptions();
        const typing = this.showTypingIndicator();
        setTimeout(() => {
            this.removeTypingIndicator(typing);
            this.processAction(option.action);
        }, 1000 + Math.random() * 500);
    }

    processAction(action) {
        switch (action) {
            case 'schedule': this.handleSchedule(); break;
            case 'therapy': this.handleTherapy(); break;
            case 'attendance': this.handleAttendance(); break;
            case 'contact': this.handleContact(); break;
            case 'therapy_individual': this.handleTherapyType('individual'); break;
            case 'therapy_couple': this.handleTherapyType('couple'); break;
            case 'therapy_family': this.handleTherapyType('family'); break;
            case 'therapy_group': this.handleTherapyType('group'); break;
            case 'attendance_presential': this.handleAttendanceType('presential'); break;
            case 'attendance_online': this.handleAttendanceType('online'); break;
            case 'back': this.backToMenu(); break;
            default: this.showInitialOptions();
        }
    }

    handleSchedule() {
        this.addMessage(['Ótimo! 📅', 'Você pode agendar sua consulta de forma rápida através da minha agenda online.']);

        setTimeout(() => {
            const linkDiv = document.createElement('div');
            linkDiv.className = 'chatbot-message bot-message';
            linkDiv.innerHTML = `
<div class="message-avatar">
    <img src="../assets/img/luminia.png" alt="Bot">
</div>
<div class="message-content">
    <p><a href="pages/portal.html?uid=3XxQtmtjLhYEmhm70biZuZEqO0P2" target="_blank" class="chatbot-link">
            <i class="fas fa-calendar-check"></i> Acessar Agendamento
        </a></p>
</div>
`;
            this.body.appendChild(linkDiv);
            this.scrollToBottom();
        }, 500);

        setTimeout(() => {
            this.addMessage('Posso ajudar com mais alguma coisa? 😊');
            this.showBackToMenuOptions();
        }, 1000);
    }

    handleTherapy() {
        this.addMessage(['Ofereço diferentes tipos de terapia para atender suas necessidades: 🤎']);
        setTimeout(() => {
            this.showOptions([
                { text: 'Individual', icon: 'fas fa-user', action: 'therapy_individual' },
                { text: 'Casal', icon: 'fas fa-user-group', action: 'therapy_couple' },
                { text: 'Família', icon: 'fas fa-people-roof', action: 'therapy_family' },
                { text: 'Grupo', icon: 'fas fa-people-group', action: 'therapy_group' },
                { text: 'Voltar ao menu', icon: 'fas fa-arrow-left', action: 'back' }
            ]);
        }, 800);
    }

    handleContact() {
        this.addMessage(['Entre em contato pelo WhatsApp para tirar suas dúvidas ou agendar uma consulta! 📱']);
        setTimeout(() => {
            this.showOptions([
                {
                    text: 'Contato por WhatsApp',
                    icon: 'fab fa-whatsapp',
                    action: () => {
                        this.addMessage('Entrar em contato por WhatsApp', true);
                        this.clearOptions();
                        const typing = this.showTypingIndicator();
                        setTimeout(() => {
                            this.removeTypingIndicator(typing);
                            this.addMessage('Vou te redirecionar para o WhatsApp! 📱');
                            setTimeout(() => {
                                window.open('https://wa.me/5579998556740', '_blank');
                                this.addMessage('Posso ajudar com mais alguma coisa? 😊');
                                this.showBackToMenuOptions();
                            }, 800);
                        }, 1000);
                    }
                },
                { text: 'Voltar ao menu', icon: 'fas fa-arrow-left', action: 'back' }
            ]);
        }, 800);
    }

    handleTherapyType(type) {
        const therapyInfo = {
            individual: {
                title: 'Terapia Individual', description: 'Sessões individuais focadas em questões pessoais, emocionais e comportamentais em ambiente seguro e confidencial.'
            },
            couple: { title: 'Terapia de Casal', description: 'Melhora a comunicação e resolve conflitos para fortalecer o relacionamento.' },
            family: { title: 'Terapia de Família', description: 'Envolve membros da família para melhorar dinâmica familiar e fortalecer relacionamentos.' },
            group: { title: 'Terapia em Grupo', description: 'Pequenos grupos com objetivos em comum se reúnem para suporte mútuo e crescimento coletivo.' }
        };

        const info = therapyInfo[type];
        this.addMessage([`<strong>${info.title}</strong> ✨`, info.description, 'Gostaria de agendar uma consulta?']);

        setTimeout(() => {
            this.showOptions([
                { text: 'Sim, quero agendar', icon: 'fas fa-calendar-check', action: 'schedule' },
                { text: 'Ver outras opções', icon: 'fas fa-list', action: 'therapy' },
                { text: 'Voltar ao menu', icon: 'fas fa-arrow-left', action: 'back' }
            ]);
        }, 1000);
    }

    handleAttendance() {
        this.addMessage(['Ofereço duas formas de atendimento: 🏥']);
        setTimeout(() => {
            this.showOptions([
                { text: 'Presencial', icon: 'fas fa-home', action: 'attendance_presential' },
                { text: 'Online', icon: 'fas fa-laptop-house', action: 'attendance_online' },
                { text: 'Voltar ao menu', icon: 'fas fa-arrow-left', action: 'back' }
            ]);
        }, 800);
    }

    handleAttendanceType(type) {
        if (type === 'presential') {
            this.addMessage([
                '<strong>Atendimento Presencial</strong> 🏢',
                'Sessões realizadas em consultório físico, em espaço acolhedor e privativo.',
                '<strong>Endereço:</strong><br>Av. Ministro Geraldo Barreto Sobral, 2131<br>Centro Médico Jardins, Sala 1212<br>Jardins — Aracaju / SE'
            ]);
            setTimeout(() => {
                const linkDiv = document.createElement('div');
                linkDiv.className = 'chatbot-message bot-message';
                linkDiv.innerHTML = `
<div class="message-avatar"><img src="../assets/img/luminia.png" alt="Bot"></div>
<div class="message-content">
    <p><a href="https://maps.app.goo.gl/384cj33NEXNZiuTV8" target="_blank" class="chatbot-link">
            <i class="fas fa-map-marker-alt"></i> Ver no Mapa
        </a></p>
</div>
`;
                this.body.appendChild(linkDiv);
                this.scrollToBottom();
            }, 500);
        } else {
            this.addMessage([
                '<strong>Atendimento Online</strong> 💻',
                'Sessões por videochamada com comodidade e flexibilidade.',
                'Plataformas: WhatsApp, Google Meet ou Jitsi — com total privacidade.'
            ]);
        }

        setTimeout(() => {
            this.addMessage('Gostaria de agendar uma consulta? 📅');
            this.showOptions([
                { text: 'Sim, quero agendar', icon: 'fas fa-calendar-check', action: 'schedule' },
                { text: 'Voltar ao menu', icon: 'fas fa-arrow-left', action: 'back' }
            ]);
        }, 1500);
    }

    backToMenu() {
        this.addMessage('Voltando ao menu principal... 🏠');
        setTimeout(() => {
            this.addMessage('Como posso ajudar você? 😊');
            this.showInitialOptions();
        }, 800);
    }

    showBackToMenuOptions() {
        this.showOptions([
            { text: 'Fazer outra pergunta', icon: 'fas fa-comments', action: 'back' },
            {
                text: 'Finalizar conversa',
                icon: 'fas fa-check-circle',
                action: () => {
                    this.addMessage('Finalizar conversa', true);
                    this.clearOptions();
                    const typing = this.showTypingIndicator();
                    setTimeout(() => {
                        this.removeTypingIndicator(typing);
                        this.addMessage(['Foi um prazer conversar com você! 🤎', 'Até breve! 👋']);
                        setTimeout(() => this.closeChat(), 2000);
                    }, 1000);
                }
            }
        ]);
    }
}

// ===== INICIALIZAR CHATBOT =====
document.addEventListener('DOMContentLoaded', () => {
    new Chatbot();
    console.log('🤖 FrançIA inicializada com sucesso!');
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