/* ==========================================================================
   Widget "Segurança & Defesa Civil"
   Busca os feeds RSS públicos do CBMSE e da Defesa Civil de Sergipe
   e exibe as últimas notícias dentro do <aside class="cbmse-feed">,
   alternando a fonte por abas.

   Robustez: serviços gratuitos de conversão RSS→JSON / proxy CORS
   (rss2json, allorigins, codetabs) não têm SLA e podem ficar
   indisponíveis ou com cota estourada sem aviso. Por isso o widget
   tenta vários provedores em sequência e, se todos falharem, exibe
   a última versão que carregou com sucesso (guardada no navegador).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const listEl = document.getElementById('cbmse-feed-list');
    const iconEl = document.getElementById('cbmse-feed-icon-img');
    const footerLinkEl = document.getElementById('cbmse-feed-footer-link');
    const tabButtons = document.querySelectorAll('.cbmse-feed-tab');
    if (!listEl || !tabButtons.length) return;

    const MAX_ITEMS = 3;
    const CACHE_PREFIX = 'cbmse-feed-cache-';

    const SOURCES = {
        cbmse: {
            label: 'CBMSE',
            siteUrl: 'https://cbm.se.gov.br/',
            rssUrl: 'https://cbm.se.gov.br/feed/',
            logo: 'assets/img/cbmse.webp',
        },
        defesacivil: {
            label: 'Defesa Civil',
            siteUrl: 'https://defesacivil.se.gov.br/',
            rssUrl: 'https://defesacivil.se.gov.br/feed/',
            logo: 'assets/img/dcse.webp',
        },
    };

    // Provedores tentados em ordem até um responder com sucesso.
    // Os dois primeiros devolvem o XML "cru" do feed (parseado abaixo);
    // o rss2json já devolve JSON pronto.
    const PROVIDERS = [
        {
            type: 'xml',
            buildUrl: (rssUrl) => `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`,
        },
        {
            type: 'xml',
            buildUrl: (rssUrl) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rssUrl)}`,
        },
        {
            type: 'json',
            buildUrl: (rssUrl) => `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`,
        },
    ];

    const memoryCache = {}; // evita refazer requisições ao trocar de aba na mesma visita

    function parseRssXml(xmlText) {
        const xml = new DOMParser().parseFromString(xmlText, 'text/xml');
        if (xml.querySelector('parsererror')) return [];

        return Array.from(xml.querySelectorAll('item')).map((item) => ({
            title: item.querySelector('title')?.textContent?.trim() || '',
            link: item.querySelector('link')?.textContent?.trim() || '',
            pubDate: item.querySelector('pubDate')?.textContent?.trim() || '',
        }));
    }

    async function fetchFromProvider(provider, rssUrl) {
        const response = await fetch(provider.buildUrl(rssUrl));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        if (provider.type === 'json') {
            const data = await response.json();
            if (data.status !== 'ok' || !Array.isArray(data.items)) throw new Error('Resposta inválida');
            return data.items;
        }

        const text = await response.text();
        const items = parseRssXml(text);
        if (!items.length) throw new Error('Feed vazio ou inválido');
        return items;
    }

    async function fetchFeed(rssUrl) {
        let lastError;
        for (const provider of PROVIDERS) {
            try {
                return await fetchFromProvider(provider, rssUrl);
            } catch (err) {
                lastError = err;
            }
        }
        throw lastError || new Error('Nenhum provedor disponível');
    }

    function readCache(sourceKey) {
        try {
            const raw = localStorage.getItem(CACHE_PREFIX + sourceKey);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function writeCache(sourceKey, items) {
        try {
            localStorage.setItem(CACHE_PREFIX + sourceKey, JSON.stringify({ items, savedAt: Date.now() }));
        } catch {
            /* localStorage indisponível (modo privado etc.) — segue sem cache */
        }
    }

    function renderSkeleton() {
        listEl.innerHTML = `
            <div class="cbmse-feed-skeleton"></div>
            <div class="cbmse-feed-skeleton"></div>
            <div class="cbmse-feed-skeleton"></div>
        `;
    }

    function renderItems(items, { stale = false, savedAt = null } = {}) {
        if (!items.length) {
            listEl.innerHTML = '<p class="cbmse-feed-empty">Nenhuma notícia encontrada no momento.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();

        items.slice(0, MAX_ITEMS).forEach((item) => {
            const pubDate = new Date(item.pubDate);
            const formattedDate = Number.isNaN(pubDate.getTime())
                ? ''
                : pubDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

            const link = document.createElement('a');
            link.href = item.link;
            link.target = '_blank';
            link.rel = 'noopener';
            link.className = 'cbmse-feed-item';
            link.innerHTML = `
                <span class="cbmse-feed-item-title">${item.title}</span>
                ${formattedDate ? `<span class="cbmse-feed-item-date"><i class="fas fa-calendar" aria-hidden="true"></i> ${formattedDate}</span>` : ''}
            `;
            fragment.appendChild(link);
        });

        listEl.innerHTML = '';
        listEl.appendChild(fragment);

        if (stale && savedAt) {
            const savedDate = new Date(savedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const notice = document.createElement('p');
            notice.className = 'cbmse-feed-empty';
            notice.style.marginTop = '10px';
            notice.textContent = `Exibindo última versão salva (${savedDate}) — não foi possível atualizar agora.`;
            listEl.appendChild(notice);
        }
    }

    function renderError() {
        listEl.innerHTML = '<p class="cbmse-feed-empty">Não foi possível carregar as notícias no momento.</p>';
    }

    function updateHeaderAndFooter(sourceKey) {
        const source = SOURCES[sourceKey];
        if (iconEl) {
            iconEl.src = source.logo;
            iconEl.alt = source.label;
        }
        if (footerLinkEl) {
            footerLinkEl.href = source.siteUrl;
            footerLinkEl.innerHTML = `Ver no site ${sourceKey === 'cbmse' ? 'do CBMSE' : 'da Defesa Civil'} <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>`;
        }
    }

    async function loadSource(sourceKey) {
        const source = SOURCES[sourceKey];
        updateHeaderAndFooter(sourceKey);

        if (memoryCache[sourceKey]) {
            renderItems(memoryCache[sourceKey]);
            return;
        }

        renderSkeleton();

        try {
            const items = await fetchFeed(source.rssUrl);
            memoryCache[sourceKey] = items;
            writeCache(sourceKey, items);
            renderItems(items);
        } catch {
            const cached = readCache(sourceKey);
            if (cached?.items?.length) {
                renderItems(cached.items, { stale: true, savedAt: cached.savedAt });
            } else {
                renderError();
            }
        }
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