/* ==========================================================================
   Widget "Segurança & Defesa Civil"
   Busca os feeds RSS públicos do CBMSE e da Defesa Civil de Sergipe
   (via rss2json) e exibe as últimas notícias dentro do
   <aside class="cbmse-feed">, alternando a fonte por abas.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const listEl = document.getElementById('cbmse-feed-list');
    const iconEl = document.querySelector('#cbmse-feed-icon i');
    const footerLinkEl = document.getElementById('cbmse-feed-footer-link');
    const tabButtons = document.querySelectorAll('.cbmse-feed-tab');
    if (!listEl || !tabButtons.length) return;

    const MAX_ITEMS = 3;

    const SOURCES = {
        cbmse: {
            label: 'CBMSE',
            siteUrl: 'https://cbm.se.gov.br/',
            rssUrl: 'https://cbm.se.gov.br/feed/',
            icon: 'fa-fire-flame-curved',
        },
        defesacivil: {
            label: 'Defesa Civil',
            siteUrl: 'https://defesacivil.se.gov.br/',
            rssUrl: 'https://defesacivil.se.gov.br/feed/',
            icon: 'fa-house-chimney-crack',
        },
    };

    // cache dos itens já buscados, para não refazer a requisição ao trocar de aba
    const cache = {};

    function renderSkeleton() {
        listEl.innerHTML = `
            <div class="cbmse-feed-skeleton"></div>
            <div class="cbmse-feed-skeleton"></div>
            <div class="cbmse-feed-skeleton"></div>
        `;
    }

    function renderItems(items) {
        if (!items.length) {
            listEl.innerHTML = '<p class="cbmse-feed-empty">Nenhuma notícia encontrada no momento.</p>';
            return;
        }

        listEl.innerHTML = '';
        items.slice(0, MAX_ITEMS).forEach((item) => {
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
    }

    function renderError() {
        listEl.innerHTML =
            '<p class="cbmse-feed-empty">Não foi possível carregar as notícias no momento.</p>';
    }

    function updateHeaderAndFooter(sourceKey) {
        const source = SOURCES[sourceKey];
        if (iconEl) {
            iconEl.className = `fas ${source.icon}`;
        }
        if (footerLinkEl) {
            footerLinkEl.href = source.siteUrl;
            footerLinkEl.innerHTML = `Ver no site ${sourceKey === 'cbmse' ? 'do CBMSE' : 'da Defesa Civil'} <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>`;
        }
    }

    function loadSource(sourceKey) {
        const source = SOURCES[sourceKey];
        updateHeaderAndFooter(sourceKey);

        if (cache[sourceKey]) {
            renderItems(cache[sourceKey]);
            return;
        }

        renderSkeleton();

        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.rssUrl)}`;

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                if (data.status !== 'ok' || !data.items) {
                    throw new Error(`Feed de ${source.label} indisponível.`);
                }
                cache[sourceKey] = data.items;
                renderItems(data.items);
            })
            .catch(() => {
                renderError();
            });
    }

    tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) return;

            tabButtons.forEach((b) => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            loadSource(btn.dataset.source);
        });
    });

    // carrega a aba inicial (CBMSE)
    loadSource('cbmse');
});