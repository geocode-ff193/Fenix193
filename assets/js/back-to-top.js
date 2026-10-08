/**
 * BACK-TO-TOP.JS — Fundação Fênix 193
 * Botão flutuante "Voltar ao topo" com detecção de scroll.
 *
 * - Injeta o próprio botão (mesmo padrão do acessibilidade.js): basta
 *   incluir este script + back-to-top.css em cada página.
 * - Aparece após rolar BTT_THRESHOLD pixels; some ao voltar ao topo.
 * - Scroll suave (respeita "prefers-reduced-motion").
 * - Acessível: <button> real, aria-label, foco devolvido ao topo da página.
 * - Idempotente: se o botão já existir, não cria outro.
 *
 * Uso (logo após o script de acessibilidade, em TODAS as páginas):
 *   <script defer src="assets/js/back-to-top.js"></script>      (páginas na raiz)
 *   <script defer src="../assets/js/back-to-top.js"></script>   (páginas em /pages)
 */
(function () {
    "use strict";

    // Distância rolada (px) para o botão aparecer
    const BTT_THRESHOLD = 300;

    function init() {
        if (document.querySelector(".back-to-top")) return;

        // ------------------------------------------------
        // Criação do botão
        // ------------------------------------------------
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "back-to-top";
        btn.setAttribute("aria-label", "Voltar ao topo da página");
        btn.title = "Voltar ao topo";
        btn.innerHTML = '<i class="fas fa-chevron-up" aria-hidden="true"></i>';

        // Páginas sem chatbot (ex.: AkanniHUB): botão desce para o canto
        if (!document.querySelector(".chatbot-container")) {
            btn.classList.add("back-to-top--solo");
        }

        document.body.appendChild(btn);

        // ------------------------------------------------
        // Detecção de scroll (throttle via requestAnimationFrame)
        // ------------------------------------------------
        let ticking = false;

        function getScrollY() {
            return window.scrollY || document.documentElement.scrollTop || 0;
        }

        function update() {
            btn.classList.toggle("is-visible", getScrollY() > BTT_THRESHOLD);
            ticking = false;
        }

        function onScroll() {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
        update(); // estado correto se a página abrir já rolada (âncora / F5)

        // ------------------------------------------------
        // Clique: sobe ao topo e devolve o foco ao início da página
        // ------------------------------------------------
        btn.addEventListener("click", function () {
            const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });

            // Foco programático no <body> (usuários de teclado / leitor de tela
            // continuam a navegação a partir do topo, não do rodapé)
            document.body.setAttribute("tabindex", "-1");
            document.body.focus({ preventScroll: true });
            document.body.addEventListener(
                "blur",
                function () { document.body.removeAttribute("tabindex"); },
                { once: true }
            );
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();