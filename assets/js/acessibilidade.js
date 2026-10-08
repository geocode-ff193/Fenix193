/**
 * ACESSIBILIDADE.JS — Fundação Fênix 193
 * Painel de Ferramentas de Acessibilidade
 *
 * Recursos:
 *  - Aumentar / Diminuir texto (escala no <html>, com limite por tela)
 *  - Escala de cinza
 *  - Alto contraste (cicla: desligado → escuro → amarelo/preto → desligado)
 *  - Controle negativo (inverte as cores)
 *  - Fundo claro
 *  - Links sublinhados
 *  - Fonte legível (Atkinson Hyperlegible, carregada sob demanda)
 *  - Redefinir tudo
 *  - Todas as preferências são salvas no LocalStorage e reaplicadas
 *    em todas as páginas do site.
 *
 * Regra: Alto contraste, Controle negativo e Fundo claro são mutuamente
 * exclusivos (ligar um desliga os outros). Os demais combinam livremente.
 *
 * Como usar: incluir <script defer src="acessibilidade.js"></script>
 * em todas as páginas do site, junto com acessibilidade.css.
 * O componente injeta seu próprio HTML — não é necessário copiar markup.
 * Requer Font Awesome (já carregado em todas as páginas) para os ícones.
 */

(function () {
  "use strict";

  // -------------------------------------------------
  // Configuração
  // -------------------------------------------------
  const STORAGE_KEY = "ff193_a11y_prefs"; // mesma chave da versão anterior (migração automática)
  const FONT_MIN = 0.8;
  const FONT_STEP = 0.1;
  const READABLE_FONT_URL =
    "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap";

  const DEFAULT_PREFS = {
    fontScale: 1,
    grayscale: false,
    contrast: "off", // "off" | "escuro" | "amarelo"
    negative: false,
    light: false,
    underline: false,
    readable: false,
  };

  const CONTRAST_STEPS = ["off", "escuro", "amarelo"];
  const CONTRAST_LABELS = { off: "Desligado", escuro: "Escuro", amarelo: "Amarelo/preto" };

  // Opções liga/desliga exibidas na grade do painel (ordem = ordem na tela)
  const OPTIONS = [
    { id: "grayscale", label: "Escala de cinza", icon: "fa-droplet-slash" },
    { id: "contrast", label: "Alto contraste", icon: "fa-circle-half-stroke" },
    { id: "negative", label: "Controle negativo", icon: "fa-moon" },
    { id: "light", label: "Fundo claro", icon: "fa-sun" },
    { id: "underline", label: "Links sublinhados", icon: "fa-underline" },
    { id: "readable", label: "Fonte legível", icon: "fa-font" },
  ];

  // -------------------------------------------------
  // Limite máximo de escala de fonte por largura de tela.
  // Evita que o texto ampliado quebre o layout em telas menores —
  // os mesmos breakpoints já usados no CSS do site (1024/768/480px).
  // Recalculado a cada redimensionamento/rotação de tela.
  // -------------------------------------------------
  function getMaxScale() {
    const w = window.innerWidth;
    if (w <= 480) return 1.3;
    if (w <= 768) return 1.4;
    if (w <= 1024) return 1.5;
    return 1.6;
  }

  // -------------------------------------------------
  // Estado / Persistência (LocalStorage)
  // -------------------------------------------------
  function loadPrefs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_PREFS };
      const p = JSON.parse(raw);

      const loaded = {
        fontScale: typeof p.fontScale === "number" ? p.fontScale : 1,
        grayscale: p.grayscale === true,
        // Migração: a versão anterior guardava o tema em "theme"
        contrast: CONTRAST_STEPS.includes(p.contrast)
          ? p.contrast
          : CONTRAST_STEPS.includes(p.theme)
            ? p.theme
            : "off",
        negative: p.negative === true,
        light: p.light === true,
        underline: p.underline === true,
        readable: p.readable === true,
      };
      return enforceExclusive(loaded);
    } catch (e) {
      return { ...DEFAULT_PREFS };
    }
  }

  function savePrefs() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      /* localStorage indisponível (modo privado, etc.) — falha silenciosa */
    }
  }

  // Garante que só um entre contraste / negativo / fundo claro esteja ativo
  function enforceExclusive(p) {
    if (p.contrast !== "off") {
      p.negative = false;
      p.light = false;
    } else if (p.negative) {
      p.light = false;
    }
    return p;
  }

  let prefs = loadPrefs();

  // -------------------------------------------------
  // Aplicação visual das preferências
  // -------------------------------------------------
  function setAttr(el, name, on) {
    if (on) el.setAttribute(name, "");
    else el.removeAttribute(name);
  }

  let appliedTheme = null; // tema cuja paleta já foi calculada
  let readableFontRequested = false;
  function loadReadableFont() {
    if (readableFontRequested) return;
    readableFontRequested = true;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = READABLE_FONT_URL;
    document.head.appendChild(link);
  }

  function applyVisualPrefs() {
    const root = document.documentElement;
    setAttr(root, "data-a11y-gray", prefs.grayscale);
    setAttr(root, "data-a11y-negative", prefs.negative);
    setAttr(root, "data-a11y-underline", prefs.underline);
    setAttr(root, "data-a11y-readable", prefs.readable);

    // Alto contraste (escuro/amarelo) e Fundo claro usam o mesmo atributo de paleta
    const theme = currentTheme();
    if (theme) root.setAttribute("data-a11y-theme", theme);
    else root.removeAttribute("data-a11y-theme");
    if (theme !== appliedTheme) {
      appliedTheme = theme;
      refreshPalette();
    }

    if (prefs.readable) loadReadableFont();
    updateControlsState();
  }

  function applyFontScale(scale, opts) {
    opts = opts || {};
    scale = Math.min(getMaxScale(), Math.max(FONT_MIN, scale));
    prefs.fontScale = Math.round(scale * 100) / 100;
    // Ajusta o font-size do <html> (não do <body>): como todo o site usa
    // rem, isso escala tipografia, espaçamentos e componentes em 100% das
    // páginas — desktop e mobile — sem precisar tocar em cada elemento.
    document.documentElement.style.fontSize = prefs.fontScale * 100 + "%";
    savePrefs();
    updateControlsState();
    if (!opts.silent) {
      announce(`Tamanho da fonte ajustado para ${Math.round(prefs.fontScale * 100)}%`);
    }
  }

  // Reclampa a escala salva sempre que a tela mudar de tamanho (ex.: girar
  // o celular, ou redimensionar a janela), garantindo que o texto ampliado
  // nunca ultrapasse o que aquele tamanho de tela comporta sem quebrar.
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const max = getMaxScale();
      if (prefs.fontScale > max) {
        applyFontScale(max, { silent: true });
      }
    }, 200);
  });

  // Alterna uma opção do painel, respeitando as exclusões mútuas
  function toggleOption(id) {
    let message = "";
    const option = OPTIONS.find((o) => o.id === id);

    if (id === "contrast") {
      const next = CONTRAST_STEPS[(CONTRAST_STEPS.indexOf(prefs.contrast) + 1) % CONTRAST_STEPS.length];
      prefs.contrast = next;
      if (next !== "off") {
        prefs.negative = false;
        prefs.light = false;
      }
      message = `Alto contraste: ${CONTRAST_LABELS[next]}`;
    } else {
      prefs[id] = !prefs[id];
      if (prefs[id] && id === "negative") {
        prefs.contrast = "off";
        prefs.light = false;
      }
      if (prefs[id] && id === "light") {
        prefs.contrast = "off";
        prefs.negative = false;
      }
      message = `${option.label} ${prefs[id] ? "ativado" : "desativado"}`;
    }

    savePrefs();
    applyVisualPrefs();
    announce(message);
  }

  function resetPrefs() {
    prefs = { ...DEFAULT_PREFS };
    document.documentElement.style.fontSize = "100%";
    savePrefs();
    applyVisualPrefs();
    announce("Preferências de acessibilidade restauradas ao padrão.");
  }

  // -------------------------------------------------
  // PALETA INTELIGENTE (Alto contraste e Fundo claro)
  //
  // Em vez de pintar TODOS os elementos com a mesma cor (o que deixava o
  // site uma tela chapada, sem hero, sem botões coloridos e sem separação
  // entre cartões), olhamos a cor de fundo ORIGINAL de cada elemento:
  //
  //   imagem ou degradê ............ "keep"    → preservado (hero, números, fotos)
  //   cor viva da marca (vermelho…)  "keep"    → preservado (botões, selos)
  //   fundo claro / cinza neutro ... "recolor" → vira fundo da paleta
  //        (pequeno e branco = "card", com contorno; o resto = "page")
  //   fundo escuro neutro .......... "recolor" → vira "surface" (menu, rodapé)
  //   sem fundo (transparente) ..... herda o contexto do elemento pai
  //
  // Só elementos "recolor" recebem texto/borda da paleta (data-a11y-ctx);
  // o CSS faz o resto a partir dos atributos data-a11y-ctx / data-a11y-bg.
  // Conteúdo inserido depois (ex.: notícias vindas do Firebase) é
  // classificado por um MutationObserver.
  // -------------------------------------------------
  const PALETTE_IGNORE = ".a11y-panel, .a11y-toggle-btn, .a11y-overlay, .skip-link";
  const PALETTE_SKIP_TAGS = new Set([
    "SCRIPT", "STYLE", "LINK", "META", "NOSCRIPT", "TEMPLATE", "IMG", "VIDEO",
    "CANVAS", "IFRAME", "PICTURE", "SOURCE", "BR", "HR", "OPTION",
  ]);
  const SVG_NS = "http://www.w3.org/2000/svg";

  function parseColor(str) {
    const m = /rgba?\(([^)]+)\)/.exec(str || "");
    if (!m) return null;
    const parts = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
    if (parts.length < 3 || parts.slice(0, 3).some(Number.isNaN)) return null;
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  }

  function luminance(c) {
    const lin = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  }

  // Saturação HSL (0 = cinza, 1 = cor pura)
  function saturation(c) {
    const r = c.r / 255, g = c.g / 255, b = c.b / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return 0;
    return (max - min) / (1 - Math.abs(2 * l - 1));
  }

  function currentTheme() {
    return prefs.contrast !== "off" ? prefs.contrast : prefs.light ? "claro" : null;
  }

  // Lê estilos de `root` e de todos os descendentes (só leitura — sem escrever no DOM)
  function analyzeTree(root) {
    const results = [];
    const ctxMap = new Map();
    const vw = window.innerWidth;

    function parentCtx(el) {
      const p = el.parentElement;
      if (!p || p === document.documentElement) return "recolor";
      if (ctxMap.has(p)) return ctxMap.get(p);
      return p.hasAttribute("data-a11y-ctx") ? "recolor" : "keep";
    }

    function process(el) {
      let ctx = parentCtx(el);
      let bg = null;

      if (el === document.body) {
        ctx = "recolor"; // o fundo do <body> é definido direto pelo CSS
      } else {
        const cs = getComputedStyle(el);
        const c = parseColor(cs.backgroundColor);
        if (cs.backgroundImage && cs.backgroundImage !== "none") {
          ctx = "keep";
        } else if (c && c.a >= 0.5) {
          const L = luminance(c);
          const S = saturation(c);
          if (S > 0.35 && L > 0.04 && L < 0.8) {
            ctx = "keep"; // cor viva da marca
          } else {
            ctx = "recolor";
            if (L >= 0.5) {
              const w = el.getBoundingClientRect().width;
              bg = L >= 0.97 && w > 0 && w < vw * 0.9 ? "card" : "page";
            } else {
              bg = "surface";
            }
          }
        }
      }
      ctxMap.set(el, ctx);
      results.push({ el, ctx, bg });
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
      acceptNode(n) {
        if (n !== root) {
          if (n.matches && n.matches(PALETTE_IGNORE)) return NodeFilter.FILTER_REJECT;
          if (PALETTE_SKIP_TAGS.has(n.tagName)) return NodeFilter.FILTER_REJECT;
          // Filhos internos de <svg> (path, g…) não precisam de classificação
          if (n.namespaceURI === SVG_NS && n.tagName.toLowerCase() !== "svg") return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    if (root.matches && root.matches(PALETTE_IGNORE)) return results;
    let node = walker.currentNode; // = root
    while (node) {
      if (node.nodeType === 1 && !PALETTE_SKIP_TAGS.has(node.tagName)) process(node);
      node = walker.nextNode();
    }
    return results;
  }

  // Escreve os atributos (fase separada da leitura, para evitar recálculo de layout em loop)
  function applyAnalysis(results) {
    results.forEach(({ el, ctx, bg }) => {
      if (ctx === "recolor") el.setAttribute("data-a11y-ctx", "recolor");
      else el.removeAttribute("data-a11y-ctx");
      if (bg) el.setAttribute("data-a11y-bg", bg);
      else el.removeAttribute("data-a11y-bg");
    });
  }

  function clearPalette() {
    document.querySelectorAll("[data-a11y-ctx], [data-a11y-bg]").forEach((el) => {
      el.removeAttribute("data-a11y-ctx");
      el.removeAttribute("data-a11y-bg");
    });
  }

  // Observa conteúdo inserido depois da carga (ex.: cards vindos do Firebase)
  let paletteObserver = null;
  let pendingNodes = [];
  let flushTimer;

  function startPaletteObserver() {
    if (paletteObserver || !document.body) return;
    paletteObserver = new MutationObserver((mutations) => {
      mutations.forEach((m) =>
        m.addedNodes.forEach((n) => {
          if (n.nodeType === 1 && !(n.closest && n.closest(PALETTE_IGNORE))) pendingNodes.push(n);
        })
      );
      if (!pendingNodes.length) return;
      clearTimeout(flushTimer);
      flushTimer = window.setTimeout(() => {
        const nodes = pendingNodes;
        pendingNodes = [];
        nodes.forEach((n) => {
          if (document.body.contains(n)) applyAnalysis(analyzeTree(n));
        });
      }, 120);
    });
    paletteObserver.observe(document.body, { childList: true, subtree: true });
  }

  function stopPaletteObserver() {
    if (paletteObserver) paletteObserver.disconnect();
    paletteObserver = null;
    pendingNodes = [];
  }

  // Recalcula a paleta do zero (ao trocar de tema ou quando os CSS terminam de carregar)
  function refreshPalette() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", refreshPalette, { once: true });
      return;
    }
    clearPalette();
    if (!currentTheme()) {
      stopPaletteObserver();
      return;
    }
    applyAnalysis(analyzeTree(document.body));
    startPaletteObserver();
  }

  // -------------------------------------------------
  // Região viva para anúncios a leitores de tela
  // -------------------------------------------------
  let liveRegion;
  function announce(message) {
    if (!liveRegion) return;
    liveRegion.textContent = "";
    // pequeno delay garante que leitores de tela percebam a mudança de texto
    window.setTimeout(() => {
      liveRegion.textContent = message;
    }, 50);
  }

  // -------------------------------------------------
  // Construção do painel (HTML injetado via JS)
  // -------------------------------------------------
  function buildPanel() {
    const overlay = document.createElement("div");
    overlay.className = "a11y-overlay";
    overlay.setAttribute("data-open", "false");

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "a11y-toggle-btn";
    toggleBtn.setAttribute("aria-label", "Abrir painel de acessibilidade");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("aria-controls", "a11y-panel");
    toggleBtn.innerHTML = '<i class="fas fa-universal-access" aria-hidden="true"></i>';

    const panel = document.createElement("aside");
    panel.id = "a11y-panel";
    panel.className = "a11y-panel";
    panel.setAttribute("data-open", "false");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Painel de ferramentas de acessibilidade");
    panel.setAttribute("aria-modal", "false");

    panel.innerHTML = `
      <button type="button" class="a11y-close" aria-label="Fechar painel de acessibilidade">
        <i class="fas fa-xmark" aria-hidden="true"></i>
      </button>
      <h2 id="a11y-panel-title">Acessibilidade</h2>

      <section class="a11y-group" aria-label="Tamanho do texto">
        <div class="a11y-group-label">
          <span>Tamanho do texto</span>
          <span class="a11y-font-readout" data-role="font-readout" aria-hidden="true">100%</span>
        </div>
        <div class="a11y-btn-row" role="group" aria-label="Tamanho da fonte">
          <button type="button" class="a11y-btn" data-action="font-decrease" aria-label="Diminuir texto" title="Diminuir texto">A−</button>
          <button type="button" class="a11y-btn" data-action="font-reset" aria-label="Tamanho de texto padrão" title="Texto padrão">A</button>
          <button type="button" class="a11y-btn" data-action="font-increase" aria-label="Aumentar texto" title="Aumentar texto">A+</button>
        </div>
      </section>

      <section class="a11y-group" aria-label="Exibição">
        <div class="a11y-option-grid" id="a11y-option-grid"></div>
      </section>

      <section class="a11y-group">
        <button type="button" class="a11y-reset-link" data-action="reset-all">
          <i class="fas fa-rotate-left" aria-hidden="true"></i> Redefinir
        </button>
      </section>
    `;

    // Botões de opção gerados a partir de OPTIONS
    const grid = panel.querySelector("#a11y-option-grid");
    OPTIONS.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "a11y-option";
      btn.dataset.option = opt.id;
      btn.setAttribute("aria-pressed", "false");
      btn.innerHTML =
        `<i class="fas ${opt.icon}" aria-hidden="true"></i>` +
        `<span>${opt.label}</span>` +
        (opt.id === "contrast" ? '<span class="a11y-option-state" data-role="contrast-state"></span>' : "");
      grid.appendChild(btn);
    });

    // Região viva de anúncios (visualmente oculta, lida por leitores de tela)
    liveRegion = document.createElement("div");
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("role", "status");
    liveRegion.className = "sr-only";
    liveRegion.style.cssText =
      "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;";

    document.body.prepend(overlay);
    document.body.prepend(panel);
    document.body.prepend(toggleBtn);
    document.body.appendChild(liveRegion);

    // Skip link (eMAG / WCAG 2.4.1)
    if (!document.querySelector(".skip-link")) {
      const skip = document.createElement("a");
      skip.href = "#main-content";
      skip.className = "skip-link";
      skip.textContent = "Pular para o conteúdo principal";
      document.body.prepend(skip);
    }

    return { overlay, toggleBtn, panel };
  }

  // Sincroniza botões/rótulos do painel com o estado atual (prefs)
  function updateControlsState() {
    const readout = document.querySelector('[data-role="font-readout"]');
    if (readout) readout.textContent = Math.round(prefs.fontScale * 100) + "%";

    document.querySelectorAll(".a11y-option").forEach((btn) => {
      const id = btn.dataset.option;
      const opt = OPTIONS.find((o) => o.id === id);
      const on = id === "contrast" ? prefs.contrast !== "off" : prefs[id] === true;
      btn.setAttribute("aria-pressed", String(on));

      if (id === "contrast") {
        const state = CONTRAST_LABELS[prefs.contrast];
        const stateEl = btn.querySelector('[data-role="contrast-state"]');
        if (stateEl) stateEl.textContent = state;
        btn.setAttribute("aria-label", `${opt.label}: ${state}. Clique para alternar.`);
      }
    });
  }

  // -------------------------------------------------
  // Abrir / Fechar painel (com foco gerenciado — WCAG 2.4.3)
  // -------------------------------------------------
  function initPanelBehavior({ overlay, toggleBtn, panel }) {
    let lastFocused = null;

    function openPanel() {
      lastFocused = document.activeElement;
      panel.setAttribute("data-open", "true");
      overlay.setAttribute("data-open", "true");
      toggleBtn.setAttribute("aria-expanded", "true");
      panel.querySelector(".a11y-close").focus();
      document.addEventListener("keydown", onKeydown);
    }

    function closePanel() {
      panel.setAttribute("data-open", "false");
      overlay.setAttribute("data-open", "false");
      toggleBtn.setAttribute("aria-expanded", "false");
      document.removeEventListener("keydown", onKeydown);
      if (lastFocused) lastFocused.focus();
      else toggleBtn.focus();
    }

    // Fecha com Esc; mantém foco preso ao painel com Tab (focus trap simples)
    function onKeydown(e) {
      if (e.key === "Escape") {
        closePanel();
        return;
      }
      if (e.key === "Tab") {
        const list = Array.from(
          panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        );
        if (!list.length) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    toggleBtn.addEventListener("click", openPanel);
    overlay.addEventListener("click", closePanel);
    panel.querySelector(".a11y-close").addEventListener("click", closePanel);

    // Ações do painel (delegação de evento)
    panel.addEventListener("click", (e) => {
      const optionBtn = e.target.closest("[data-option]");
      if (optionBtn) {
        toggleOption(optionBtn.dataset.option);
        return;
      }
      const action = e.target.closest("[data-action]")?.dataset.action;
      if (!action) return;
      if (action === "font-increase") applyFontScale(prefs.fontScale + FONT_STEP);
      if (action === "font-decrease") applyFontScale(prefs.fontScale - FONT_STEP);
      if (action === "font-reset") applyFontScale(1);
      if (action === "reset-all") resetPrefs();
    });
  }

  // -------------------------------------------------
  // Inicialização
  // -------------------------------------------------
  // Aplica as preferências salvas o mais cedo possível (antes mesmo de o
  // painel existir) para reduzir o "flash" do tema padrão ao trocar de página.
  applyVisualPrefs();
  document.documentElement.style.fontSize =
    Math.min(getMaxScale(), Math.max(FONT_MIN, prefs.fontScale)) * 100 + "%";

  function init() {
    const refs = buildPanel();
    initPanelBehavior(refs);

    // Sincroniza o painel recém-criado com as preferências salvas, sem
    // disparar anúncios de voz na carga da página (já reclampada ao limite
    // seguro da tela atual, via applyFontScale)
    applyFontScale(prefs.fontScale, { silent: true });
    applyVisualPrefs();

    // style.css e outros CSS carregam de forma assíncrona (media="print" → "all"):
    // ao terminar, recalcula a paleta com as cores finais de cada elemento.
    const onFullLoad = () => window.setTimeout(() => currentTheme() && refreshPalette(), 150);
    if (document.readyState === "complete") onFullLoad();
    else window.addEventListener("load", onFullLoad, { once: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();