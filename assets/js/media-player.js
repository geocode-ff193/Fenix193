/**
 * MEDIA-PLAYER.JS — Fundação Fênix 193
 * Reprodutor de vídeo acessível com Audiodescrição (AD)
 *
 * Uso no HTML (ver exemplo.html):
 * <div class="media-player"
 *      data-ad-track="ad-video-institucional.json"
 *      data-video-title="Vídeo institucional Fundação Fênix 193">
 *   <video>...</video>
 * </div>
 *
 * O arquivo JSON de faixa de AD tem o formato:
 * [ { "time": 2,  "text": "Fachada da sede da Fundação Fênix 193 ao amanhecer." },
 *   { "time": 8,  "text": "Bombeiros treinando em uma simulação de resgate." } ]
 *
 * Quando a Audiodescrição está ativa:
 *  1. O texto correspondente ao tempo atual é anunciado em um container
 *     aria-live="polite" (legível por qualquer leitor de tela).
 *  2. Adicionalmente, o texto é narrado via Web Speech API (speechSynthesis),
 *     pausando o vídeo automaticamente enquanto a narração ocorre — técnica
 *     de "AD estendida", recomendada quando o tempo do vídeo é curto demais
 *     para a descrição completa.
 */

(function () {
  "use strict";

  document.querySelectorAll(".media-player[data-ad-track]").forEach(initPlayer);

  function initPlayer(container) {
    const video = container.querySelector("video, audio");
    if (!video) return;

    const title = container.dataset.videoTitle || "Vídeo";
    const adTrackUrl = container.dataset.adTrack;

    // -----------------------------------------------
    // Monta a barra de controles customizada
    // -----------------------------------------------
    video.setAttribute("aria-label", title);
    video.removeAttribute("controls"); // substitui pelos controles customizados

    const controls = document.createElement("div");
    controls.className = "media-controls";
    controls.setAttribute("role", "group");
    controls.setAttribute("aria-label", `Controles de reprodução — ${title}`);
    controls.innerHTML = `
      <button type="button" data-action="play-pause" aria-label="Reproduzir" aria-pressed="false">▶</button>

      <span class="media-time" data-role="current-time" aria-hidden="true">00:00</span>

      <input type="range" class="media-progress" min="0" max="100" value="0" step="0.1"
             aria-label="Barra de progresso do vídeo" data-role="progress">

      <span class="media-time" data-role="duration" aria-hidden="true">00:00</span>

      <button type="button" data-action="mute" aria-label="Ativar mudo" aria-pressed="false">🔊</button>
      <input type="range" class="media-volume" min="0" max="1" step="0.05" value="1"
             aria-label="Controle de volume" data-role="volume">

      <button type="button" data-action="toggle-ad" aria-label="Ativar audiodescrição" aria-pressed="false">
        AD
      </button>
    `;

    const adRegion = document.createElement("div");
    adRegion.className = "ad-live-region";
    adRegion.setAttribute("aria-live", "polite");
    adRegion.setAttribute("role", "status");
    adRegion.textContent = "Audiodescrição desativada.";

    container.appendChild(controls);
    container.appendChild(adRegion);

    // -----------------------------------------------
    // Elementos de controle
    // -----------------------------------------------
    const btnPlay = controls.querySelector('[data-action="play-pause"]');
    const btnMute = controls.querySelector('[data-action="mute"]');
    const btnAD = controls.querySelector('[data-action="toggle-ad"]');
    const progress = controls.querySelector('[data-role="progress"]');
    const volume = controls.querySelector('[data-role="volume"]');
    const currentTimeEl = controls.querySelector('[data-role="current-time"]');
    const durationEl = controls.querySelector('[data-role="duration"]');

    let adEnabled = false;
    let adCues = [];
    let firedCues = new Set();
    let speaking = false;

    // -----------------------------------------------
    // Play / Pause
    // -----------------------------------------------
    function togglePlay() {
      if (video.paused) video.play();
      else video.pause();
    }
    btnPlay.addEventListener("click", togglePlay);
    video.addEventListener("play", () => {
      btnPlay.textContent = "⏸";
      btnPlay.setAttribute("aria-label", "Pausar");
      btnPlay.setAttribute("aria-pressed", "true");
    });
    video.addEventListener("pause", () => {
      btnPlay.textContent = "▶";
      btnPlay.setAttribute("aria-label", "Reproduzir");
      btnPlay.setAttribute("aria-pressed", "false");
    });

    // -----------------------------------------------
    // Progresso / tempo
    // -----------------------------------------------
    function formatTime(seconds) {
      if (!isFinite(seconds)) return "00:00";
      const m = Math.floor(seconds / 60).toString().padStart(2, "0");
      const s = Math.floor(seconds % 60).toString().padStart(2, "0");
      return `${m}:${s}`;
    }

    video.addEventListener("loadedmetadata", () => {
      durationEl.textContent = formatTime(video.duration);
    });

    video.addEventListener("timeupdate", () => {
      if (!video.duration) return;
      progress.value = (video.currentTime / video.duration) * 100;
      currentTimeEl.textContent = formatTime(video.currentTime);
      checkAdCues();
    });

    // Barra de progresso navegável via teclado (setas nativas do <input type="range">)
    progress.addEventListener("input", () => {
      if (!video.duration) return;
      video.currentTime = (progress.value / 100) * video.duration;
    });

    // -----------------------------------------------
    // Volume / Mudo
    // -----------------------------------------------
    volume.addEventListener("input", () => {
      video.volume = Number(volume.value);
      video.muted = video.volume === 0;
    });
    btnMute.addEventListener("click", () => {
      video.muted = !video.muted;
      btnMute.textContent = video.muted ? "🔇" : "🔊";
      btnMute.setAttribute("aria-label", video.muted ? "Desativar mudo" : "Ativar mudo");
      btnMute.setAttribute("aria-pressed", String(video.muted));
    });

    // -----------------------------------------------
    // Audiodescrição — carregamento da faixa (JSON)
    // -----------------------------------------------
    function loadAdTrack() {
      if (!adTrackUrl || adCues.length) return Promise.resolve();
      return fetch(adTrackUrl)
        .then((res) => res.json())
        .then((data) => {
          adCues = Array.isArray(data) ? data : [];
        })
        .catch(() => {
          adRegion.textContent = "Não foi possível carregar a faixa de audiodescrição.";
        });
    }

    function checkAdCues() {
      if (!adEnabled || !adCues.length) return;
      const currentSecond = Math.floor(video.currentTime);
      const cue = adCues.find(
        (c) => Math.floor(c.time) === currentSecond && !firedCues.has(c.time)
      );
      if (cue) {
        firedCues.add(cue.time);
        announceDescription(cue.text);
      }
    }

    function announceDescription(text) {
      adRegion.textContent = text;

      // Narração via Web Speech API, pausando o vídeo durante a fala
      // (técnica de audiodescrição estendida)
      if ("speechSynthesis" in window) {
        const wasPlaying = !video.paused;
        if (wasPlaying) video.pause();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "pt-BR";
        speaking = true;
        utterance.onend = () => {
          speaking = false;
          if (wasPlaying) video.play();
        };
        window.speechSynthesis.cancel(); // evita fila acumulada
        window.speechSynthesis.speak(utterance);
      }
    }

    btnAD.addEventListener("click", () => {
      adEnabled = !adEnabled;
      btnAD.setAttribute("aria-pressed", String(adEnabled));
      btnAD.setAttribute(
        "aria-label",
        adEnabled ? "Desativar audiodescrição" : "Ativar audiodescrição"
      );
      btnAD.style.background = adEnabled ? "#c0392b" : "";

      if (adEnabled) {
        firedCues = new Set();
        loadAdTrack().then(() => {
          adRegion.textContent = "Audiodescrição ativada.";
        });
      } else {
        window.speechSynthesis.cancel();
        adRegion.textContent = "Audiodescrição desativada.";
      }
    });

    // -----------------------------------------------
    // Atalhos de teclado quando o player está focado
    // (Espaço = play/pause, Setas = avançar/retroceder 5s e volume)
    // -----------------------------------------------
    container.setAttribute("tabindex", "-1");
    container.addEventListener("keydown", (e) => {
      const tag = document.activeElement.tagName;
      if (tag === "INPUT") return; // não interfere nos sliders nativos

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          video.currentTime = Math.min(video.duration, video.currentTime + 5);
          break;
        case "ArrowLeft":
          video.currentTime = Math.max(0, video.currentTime - 5);
          break;
        case "ArrowUp":
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          volume.value = video.volume;
          break;
        case "ArrowDown":
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          volume.value = video.volume;
          break;
      }
    });
  }
})();
