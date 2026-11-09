/**
 * COOKIE-BANNER.JS — Fundação Fênix 193
 * Mostra o banner de consentimento (LGPD) assim que a página termina de ser lida,
 * SEM esperar o Firebase carregar. Antes, o banner só aparecia depois dos módulos do
 * Firebase (vários arquivos grandes), o que no celular levava segundos e atrasava o LCP.
 *
 * Este script só cuida do banner e da escolha do usuário. A coleta de métricas
 * (Firebase Analytics) continua no script.js, que reage ao evento "ff193:cookie-consent".
 *
 *   Aceitar → grava 'accepted' no localStorage e dispara o evento (detail: 'accepted')
 *   Recusar → não grava nada (o banner reaparece na próxima visita) e dispara 'declined'
 */
(function () {
    "use strict";

    var COOKIE_KEY = "ff193_cookie_consent";
    var banner = document.getElementById("cookie-banner");
    var btnAccept = document.getElementById("cookie-accept");
    var btnDecline = document.getElementById("cookie-decline");
    if (!banner || !btnAccept || !btnDecline) return;

    var consent = null;
    try { consent = localStorage.getItem(COOKIE_KEY); } catch (_) { /* armazenamento bloqueado */ }

    if (consent !== "accepted") banner.removeAttribute("hidden");

    function notify(choice) {
        window.dispatchEvent(new CustomEvent("ff193:cookie-consent", { detail: choice }));
    }

    btnAccept.addEventListener("click", function () {
        try { localStorage.setItem(COOKIE_KEY, "accepted"); } catch (_) { }
        banner.setAttribute("hidden", "");
        notify("accepted");
    });

    btnDecline.addEventListener("click", function () {
        // NÃO persiste nada: o banner reaparece a cada visita
        try { localStorage.removeItem(COOKIE_KEY); } catch (_) { }
        banner.setAttribute("hidden", "");
        notify("declined");
    });
})();
