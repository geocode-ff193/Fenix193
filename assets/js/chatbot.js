/* =============================================================
   CHATBOT FLUTUANTE — LuminIA · Guia de Ajuda Fundação Fênix 193
   ============================================================= */

class Chatbot {
    constructor() {
        this.toggle = document.getElementById('chatbotToggle');
        this.box = document.getElementById('chatbotBox');
        this.close = document.getElementById('chatbotClose');
        this.body = document.getElementById('chatbotBody');
        this.options = document.getElementById('chatbotOptions');
        this.badge = document.querySelector('.chatbot-badge');
        this.teaser = document.getElementById('chatbotTeaser');
        this.teaserDismiss = document.getElementById('chatbotTeaserDismiss');

        // Detecta se estamos numa subpágina (pages/) para ajustar o caminho do avatar
        this.avatarPath = window.location.pathname.includes('/pages/')
            ? '../assets/img/luminia.webp'
            : 'assets/img/luminia.webp';

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
        this.initTeaser();
    }

    toggleChat() {
        const isActive = this.box.classList.toggle('active');
        this.toggle.classList.toggle('active');
        this.hideTeaser();
        if (isActive) {
            if (this.badge) this.badge.style.display = 'none';
            setTimeout(() => this.scrollToBottom(), 300);
        }
    }

    closeChat() {
        this.box.classList.remove('active');
        this.toggle.classList.remove('active');
    }

    // ── Balão de convite proativo ──────────────────────────────
    // Aparece uma vez por sessão, alguns segundos depois de a pessoa
    // chegar ao site, convidando-a a pedir ajuda — sem abrir o chat sozinho.
    initTeaser() {
        if (!this.teaser) return;
        if (sessionStorage.getItem('luminiaTeaserShown')) return;

        const showTimer = setTimeout(() => {
            if (this.box.classList.contains('active')) return;
            this.teaser.classList.add('show');
            sessionStorage.setItem('luminiaTeaserShown', '1');
            setTimeout(() => this.hideTeaser(), 10000);
        }, 4000);

        this.teaser.addEventListener('click', () => {
            clearTimeout(showTimer);
            this.hideTeaser();
            if (!this.box.classList.contains('active')) this.toggleChat();
        });

        if (this.teaserDismiss) {
            this.teaserDismiss.addEventListener('click', (e) => {
                e.stopPropagation();
                clearTimeout(showTimer);
                this.hideTeaser();
            });
        }
    }

    hideTeaser() {
        if (this.teaser) this.teaser.classList.remove('show');
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
            btn.innerHTML = `
                <span class="option-btn-icon"><i class="${option.icon}"></i></span>
                <span class="option-btn-label">${option.text}</span>
                <i class="fas fa-chevron-right option-btn-arrow" aria-hidden="true"></i>
            `;
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
            { text: 'Sobre a Fundação', icon: 'fas fa-landmark', action: 'sobre' },
            { text: 'Projetos e atuação', icon: 'fas fa-clipboard-list', action: 'atuacao' },
            { text: 'Como colaborar', icon: 'fas fa-hand-holding-heart', action: 'como_ajudar' },
            { text: 'Transparência', icon: 'fas fa-file-shield', action: 'transparencia' },
            { text: 'Ir direto para uma página', icon: 'fas fa-compass', action: 'navegacao' },
            { text: 'Falar com a Fundação', icon: 'fas fa-comments', action: 'contato' },
        ]);
    }

    // ══════════════════════════════════════════════════════════
    //  SOBRE A FUNDAÇÃO
    // ══════════════════════════════════════════════════════════
    handleSobre() {
        this.addMessage([
            '<strong>Sobre a Fundação Fênix 193 🔥</strong>',
            'Somos uma organização sem fins lucrativos que apoia o <strong>Corpo de Bombeiros Militar de Sergipe (CBMSE)</strong> e as ações de <strong>Proteção e Defesa Civil</strong>.',
            'O que você quer saber?'
        ]);
        setTimeout(() => {
            this.showOptions([
                { text: 'Quem somos', icon: 'fas fa-users', action: 'quem_somos' },
                { text: 'Missão e valores', icon: 'fas fa-bullseye', action: 'missao' },
                { text: 'Nossa equipe', icon: 'fas fa-id-badge', action: 'equipe' },
                { text: 'Voltar', icon: 'fas fa-arrow-left', action: 'back' },
            ]);
        }, 900);
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
            'A Fênix 193 atua em projetos, capacitações, eventos e parcerias para fortalecer o CBMSE e a Defesa Civil.',
        ]);
        setTimeout(() => {
            this.showOptions([
                { text: 'Projetos', icon: 'fas fa-clipboard-list', action: 'projetos' },
                { text: 'Capacitação', icon: 'fas fa-graduation-cap', action: 'capacitacao' },
                { text: 'Eventos', icon: 'fas fa-calendar-days', action: 'eventos' },
                { text: 'Parcerias', icon: 'fas fa-handshake', action: 'parcerias' },
                { text: 'Voltar', icon: 'fas fa-arrow-left', action: 'back' },
            ]);
        }, 800);
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
            '<strong>Como Colaborar 💛</strong>',
            'Você pode apoiar a Fênix 193 de diferentes formas:',
        ]);
        setTimeout(() => {
            this.showOptions([
                { text: 'Fazer uma doação', icon: 'fas fa-donate', action: 'doacao' },
                { text: 'Voluntariado', icon: 'fas fa-hands-helping', action: 'voluntariado' },
                { text: 'Parceria empresarial', icon: 'fas fa-building', action: 'parceria_empresa' },
                { text: 'Voltar', icon: 'fas fa-arrow-left', action: 'back' },
            ]);
        }, 800);
    }

    handleDoacao() {
        this.addMessage([
            '<strong>Faça uma Doação ❤️‍🔥</strong>',
            'Sua doação financia projetos e equipamentos que protegem vidas em Sergipe, com total transparência.',
            'Entre em contato para saber como contribuir:',
        ]);
        setTimeout(() => this._contatoRapido(), 800);
    }

    handleVoluntariado() {
        this.addMessage([
            '<strong>Voluntariado 🙌</strong>',
            'Você pode colaborar em eventos, ações comunitárias, comunicação e captação de recursos.',
        ]);
        setTimeout(() => this._contatoRapido(), 800);
    }

    handleParceriaEmpresa() {
        this.addMessage([
            '<strong>Parceria Empresarial 🏢</strong>',
            'Empresas parceiras reforçam seu ESG e contribuem diretamente com a segurança pública sergipana. Fale conosco:',
        ]);
        setTimeout(() => this._contatoRapido(), 800);
    }

    // ── Atalho: opções de contato rápido ─────────────────────
    _contatoRapido() {
        this.showOptions([
            { text: 'WhatsApp', icon: 'fab fa-whatsapp', action: 'contato_whatsapp' },
            { text: 'Formulário', icon: 'fas fa-envelope', action: 'contato_form' },
            { text: 'Voltar', icon: 'fas fa-arrow-left', action: 'back' },
        ]);
    }

    // ══════════════════════════════════════════════════════════
    //  TRANSPARÊNCIA
    // ══════════════════════════════════════════════════════════
    handleTransparencia() {
        this.addMessage([
            '<strong>Transparência 📂</strong>',
            'Acesse relatórios, demonstrativos financeiros, atas e documentos institucionais:',
        ]);
        setTimeout(() => this.addLinkMessage('Página de Transparência', 'fas fa-file-shield', this._href('pages/transparencia.html')), 400);
        setTimeout(() => {
            this.addMessage('Não encontrou o documento? Fale conosco.');
            this._contatoRapido();
        }, 1200);
    }

    // ══════════════════════════════════════════════════════════
    //  CONTATO
    // ══════════════════════════════════════════════════════════
    handleContato() {
        this.addMessage('Como prefere entrar em contato? 📬');
        setTimeout(() => {
            this.showOptions([
                { text: 'WhatsApp', icon: 'fab fa-whatsapp', action: 'contato_whatsapp' },
                { text: 'Formulário', icon: 'fas fa-envelope', action: 'contato_form' },
                { text: 'Redes sociais', icon: 'fas fa-share-nodes', action: 'contato_redes' },
                { text: 'Voltar', icon: 'fas fa-arrow-left', action: 'back' },
            ]);
        }, 700);
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
        setTimeout(() => this.addLinkMessage('Ir para o Formulário de Contato', 'fas fa-paper-plane', this._href('pages/fale-conosco.html')), 400);
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
    //  NAVEGAÇÃO RÁPIDA
    // ══════════════════════════════════════════════════════════
    handleNavegacao() {
        this.addMessage([
            '<strong>Navegação Rápida 🧭</strong>',
            'Posso te levar direto para qualquer página do site. Para onde vamos?',
        ]);
        setTimeout(() => {
            this.showOptions([
                { text: 'Início', icon: 'fas fa-house', action: () => this._irPara('Início', this._href('index.html')) },
                { text: 'Quem Somos', icon: 'fas fa-landmark', action: () => this._irPara('Quem Somos', this._href('index.html#quem-somos')) },
                { text: 'Nossa História', icon: 'fas fa-book-open', action: () => this._irPara('Nossa História', this._href('pages/nossa-historia.html')) },
                { text: 'Missão e Valores', icon: 'fas fa-bullseye', action: () => this._irPara('Missão e Valores', this._href('pages/missao-valores.html')) },
                { text: 'Nossa Equipe', icon: 'fas fa-id-badge', action: () => this._irPara('Nossa Equipe', this._href('pages/equipe.html')) },
                { text: 'Projetos', icon: 'fas fa-clipboard-list', action: () => this._irPara('Projetos', this._href('pages/projetos.html')) },
                { text: 'Capacitação', icon: 'fas fa-graduation-cap', action: () => this._irPara('Capacitação', this._href('pages/capacitacao.html')) },
                { text: 'Eventos', icon: 'fas fa-calendar-days', action: () => this._irPara('Eventos', this._href('pages/eventos.html')) },
                { text: 'Parcerias', icon: 'fas fa-handshake', action: () => this._irPara('Parcerias', this._href('pages/parcerias.html')) },
                { text: 'Transparência', icon: 'fas fa-file-shield', action: () => this._irPara('Transparência', this._href('pages/transparencia.html')) },
                { text: 'Notícias', icon: 'fas fa-newspaper', action: () => this._irPara('Notícias', this._href('pages/noticias.html')) },
                { text: 'Voltar', icon: 'fas fa-arrow-left', action: 'back' },
            ]);
        }, 700);
    }

    // ── Atalho: confirma a escolha e entrega o link da página ─
    _irPara(nomePagina, href) {
        this.addMessage(nomePagina, true);
        this.clearOptions();
        const typing = this.showTypingIndicator();
        setTimeout(() => {
            this.removeTypingIndicator(typing);
            this.addMessage(`Perfeito! Te levando para <strong>${nomePagina}</strong> 🚀`);
            setTimeout(() => this.addLinkMessage(`Abrir ${nomePagina}`, 'fas fa-arrow-right', href), 400);
            setTimeout(() => this.showBackToMenuOptions(), 1200);
        }, 700);
    }

    // (Navegação por cabeçalho — as demais páginas seguem acessíveis pelo menu do site)

    // ══════════════════════════════════════════════════════════
    //  UTILITÁRIOS
    // ══════════════════════════════════════════════════════════
    backToMenu() {
        this.addMessage('Voltando ao menu... 🏠');
        setTimeout(() => this.showInitialOptions(), 600);
    }

    showBackToMenuOptions() {
        this.showOptions([
            { text: 'Outra dúvida', icon: 'fas fa-comments', action: 'back' },
            {
                text: 'Encerrar',
                icon: 'fas fa-check-circle',
                action: () => {
                    this.addMessage('Encerrar', true);
                    this.clearOptions();
                    const typing = this.showTypingIndicator();
                    setTimeout(() => {
                        this.removeTypingIndicator(typing);
                        this.addMessage('Fico feliz em ter ajudado! 🔥 Até mais! 👋');
                        setTimeout(() => this.closeChat(), 2000);
                    }, 800);
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