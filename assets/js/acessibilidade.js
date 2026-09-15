/**
 * ACESSIBILIDADE.JS — Fundação Fênix 193
 * Painel de Ferramentas de Acessibilidade
 * - Controle de tamanho de fonte (rem, com persistência)
 * - Alternador de contraste (Padrão / Escuro / Amarelo-Preto)
 * - Navegação 100% funcional via teclado
 *
 * Como usar: incluir <script src="acessibilidade.js" defer></script>
 * em todas as páginas do site, junto com acessibilidade.css.
 * O componente injeta seu próprio HTML — não é necessário copiar markup manualmente.
 */

(function () {
  "use strict";

  // -------------------------------------------------
  // Configuração
  // -------------------------------------------------
  const STORAGE_KEY = "ff193_a11y_prefs";
  const FONT_MIN = 0.8;
  const FONT_MAX = 1.6;
  const FONT_STEP = 0.1;

  const THEMES = [
    { id: "padrao", label: "Contraste Padrão", swatchClass: "padrao" },
    { id: "escuro", label: "Alto Contraste Escuro", swatchClass: "escuro" },
    { id: "amarelo", label: "Alto Contraste Amarelo/Preto", swatchClass: "amarelo" },
  ];

  // -------------------------------------------------
  // Estado / Persistência
  // -------------------------------------------------
  function loadPrefs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { fontScale: 1, theme: "padrao" };
      const parsed = JSON.parse(raw);
      return {
        fontScale: typeof parsed.fontScale === "number" ? parsed.fontScale : 1,
        theme: THEMES.some((t) => t.id === parsed.theme) ? parsed.theme : "padrao",
      };
    } catch (e) {
      return { fontScale: 1, theme: "padrao" };
    }
  }

  function savePrefs(prefs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      /* localStorage indisponível (modo privado, etc.) — falha silenciosa */
    }
  }

  let prefs = loadPrefs();

  // -------------------------------------------------
  // Aplicação visual das preferências
  // -------------------------------------------------
  function applyFontScale(scale) {
    scale = Math.min(FONT_MAX, Math.max(FONT_MIN, scale));
    prefs.fontScale = scale;
    document.documentElement.style.setProperty("--font-scale", scale);
    savePrefs(prefs);
    announce(`Tamanho da fonte ajustado para ${Math.round(scale * 100)}%`);
  }

  function applyTheme(themeId) {
    prefs.theme = themeId;
    if (themeId === "padrao") {
      document.documentElement.removeAttribute("data-a11y-theme");
    } else {
      document.documentElement.setAttribute("data-a11y-theme", themeId);
    }
    savePrefs(prefs);
    updateThemeButtonsState();
    const theme = THEMES.find((t) => t.id === themeId);
    announce(`Tema alterado para ${theme.label}`);
  }

  function resetPrefs() {
    applyFontScale(1);
    applyTheme("padrao");
    announce("Preferências de acessibilidade restauradas ao padrão.");
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
    toggleBtn.innerHTML = '<span aria-hidden="true">♿</span>';

    const panel = document.createElement("aside");
    panel.id = "a11y-panel";
    panel.className = "a11y-panel";
    panel.setAttribute("data-open", "false");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Painel de ferramentas de acessibilidade");
    panel.setAttribute("aria-modal", "false");

    panel.innerHTML = `
      <button type="button" class="a11y-close" aria-label="Fechar painel de acessibilidade">
        <span aria-hidden="true">✕</span>
      </button>
      <h2 id="a11y-panel-title">Acessibilidade</h2>

      <section class="a11y-group" aria-labelledby="a11y-font-label">
        <h3 id="a11y-font-label">Tamanho da fonte</h3>
        <div class="a11y-btn-row" role="group" aria-label="Controle de tamanho de fonte">
          <button type="button" class="a11y-btn" data-action="font-decrease" aria-label="Diminuir tamanho da fonte">A-</button>
          <button type="button" class="a11y-btn" data-action="font-reset" aria-label="Restaurar tamanho de fonte padrão">A</button>
          <button type="button" class="a11y-btn" data-action="font-increase" aria-label="Aumentar tamanho da fonte">A+</button>
        </div>
      </section>

      <section class="a11y-group" aria-labelledby="a11y-contrast-label">
        <h3 id="a11y-contrast-label">Contraste</h3>
        <div role="group" aria-label="Alternador de temas de contraste" id="a11y-theme-group"></div>
      </section>

      <section class="a11y-group">
        <button type="button" class="a11y-btn" style="width:100%" data-action="reset-all">
          Restaurar tudo ao padrão
        </button>
      </section>

      <p style="font-size:0.75rem; opacity:0.75; margin-top:1rem;">
        Suas preferências ficam salvas neste navegador e são aplicadas automaticamente
        na próxima visita.
      </p>
    `;

    // Botões de tema (gerados dinamicamente a partir de THEMES)
    const themeGroup = panel.querySelector("#a11y-theme-group");
    THEMES.forEach((theme) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "a11y-theme-btn";
      btn.dataset.theme = theme.id;
      btn.setAttribute("aria-pressed", "false");
      btn.innerHTML = `<span class="a11y-swatch ${theme.swatchClass}" aria-hidden="true"></span> ${theme.label}`;
      btn.addEventListener("click", () => applyTheme(theme.id));
      themeGroup.appendChild(btn);
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

  function updateThemeButtonsState() {
    document.querySelectorAll(".a11y-theme-btn").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.theme === prefs.theme));
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
        const focusables = panel.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const list = Array.from(focusables);
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

    // Ações dos botões de fonte / reset (delegação de evento)
    panel.addEventListener("click", (e) => {
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
  function init() {
    const refs = buildPanel();
    initPanelBehavior(refs);

    // Aplica preferências salvas sem disparar anúncios de voz na carga da página
    document.documentElement.style.setProperty("--font-scale", prefs.fontScale);
    if (prefs.theme !== "padrao") {
      document.documentElement.setAttribute("data-a11y-theme", prefs.theme);
    }
    updateThemeButtonsState();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
