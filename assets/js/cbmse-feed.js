/* ==========================================================================
   Widget "Direto do CBMSE"
   Busca o feed RSS público do CBMSE (via rss2json) e exibe as últimas
   notícias dentro do <aside class="cbmse-feed"> dentro da seção
   "Últimas Notícias" da página inicial.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const listEl = document.getElementById('cbmse-feed-list');
    if (!listEl) return;

    const RSS_URL = 'https://cbm.se.gov.br/feed/';
    const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;
    const MAX_ITEMS = 5;

    fetch(API_URL)
        .then((response) => response.json())
        .then((data) => {
            if (data.status !== 'ok' || !data.items || !data.items.length) {
                throw new Error('Feed do CBMSE indisponível.');
            }

            listEl.innerHTML = '';

            data.items.slice(0, MAX_ITEMS).forEach((item) => {
                const pubDate = new Date(item.pubDate);
                const formattedDate = pubDate.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                });

                const link = document.createElement('a');
                link.href = item.link;
                link.target = '_blank';
                link.rel = 'noopener';
                link.className = 'cbmse-feed-item';
                link.innerHTML = `
                    <span class="cbmse-feed-item-title">${item.title}</span>
                    <span class="cbmse-feed-item-date">
                        <i class="fas fa-calendar" aria-hidden="true"></i> ${formattedDate}
                    </span>
                `;
                listEl.appendChild(link);
            });
        })
        .catch(() => {
            listEl.innerHTML =
                '<p class="cbmse-feed-empty">Não foi possível carregar as notícias do CBMSE no momento.</p>';
        });
});