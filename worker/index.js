/**
 * WORKER — Fundação Fênix 193 (Cloudflare Workers)
 *
 * O site continua sendo servido como arquivos estáticos (assets). Este Worker só
 * entra em 3 rotas, definidas em "run_worker_first" no wrangler.jsonc:
 *
 *   GET /api/feed?source=cbmse|defesacivil
 *       Lê o feed RSS do CBMSE / Defesa Civil e devolve JSON, com cache.
 *       Substitui os proxies gratuitos (allorigins, codetabs, rss2json).
 *
 *   GET /pages/noticia?id=ID
 *       Entrega a página da notícia com título, descrição, canonical, Open Graph
 *       e JSON-LD (NewsArticle) já preenchidos no HTML. Assim o Google e as prévias
 *       de WhatsApp/Facebook enxergam a notícia certa, sem depender de JavaScript.
 *
 *   GET /sitemap-noticias.xml
 *       Sitemap com as notícias publicadas no Firestore.
 *
 * Qualquer erro cai de volta para o comportamento estático (nunca derruba o site).
 */

const FEEDS = {
    cbmse: 'https://cbm.se.gov.br/feed/',
    defesacivil: 'https://defesacivil.se.gov.br/feed/',
};

const FEED_UA = 'Mozilla/5.0 (compatible; FF193-Feed/1.0; +https://fenix193.org.br)';
const NEWS_ID_RE = /^[A-Za-z0-9_-]{1,100}$/;

export default {
    async fetch(request, env, ctx) {
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            return env.ASSETS.fetch(request);
        }

        const url = new URL(request.url);
        try {
            switch (url.pathname) {
                case '/api/feed':
                    return await handleFeed(url, ctx);
                case '/sitemap-noticias.xml':
                    return await handleNewsSitemap(env, ctx);
                case '/pages/noticia':
                    return await handleNoticia(request, env, url);
            }
            if (url.pathname.startsWith('/api/')) return json({ error: 'not_found' }, 404);
        } catch (err) {
            console.error('[ff193-worker]', url.pathname, err && err.message);
            if (url.pathname === '/pages/noticia') return env.ASSETS.fetch(request); // página estática
            return json({ error: 'internal_error' }, 500);
        }

        return env.ASSETS.fetch(request);
    },
};

/* ───────────────────────── utilidades ───────────────────────── */

function json(body, status = 200, extraHeaders = {}) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-Robots-Tag': 'noindex',
            ...extraHeaders,
        },
    });
}

function escXml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/* ───────────────────────── /api/feed ───────────────────────── */

async function handleFeed(url, ctx) {
    const source = url.searchParams.get('source');
    const feedUrl = Object.prototype.hasOwnProperty.call(FEEDS, source) ? FEEDS[source] : null;
    if (!feedUrl) return json({ error: 'invalid_source' }, 400);

    const cache = caches.default;
    const key = new Request(`${url.origin}/api/feed?source=${source}`);
    const hit = await cache.match(key);
    if (hit) return hit;

    const upstream = await fetch(feedUrl, {
        headers: { 'User-Agent': FEED_UA, Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.5' },
        cf: { cacheTtl: 600, cacheEverything: true },
    });
    if (!upstream.ok) return json({ error: 'upstream_error', status: upstream.status }, 502);

    const items = parseRss(await upstream.text()).slice(0, 10);
    if (!items.length) return json({ error: 'empty_feed' }, 502);

    const res = json({ source, items }, 200, { 'Cache-Control': 'public, max-age=300' });
    ctx.waitUntil(cache.put(key, res.clone()));
    return res;
}

function decodeEntities(s) {
    return s
        .replace(/&#(\d+);/g, (_, n) => safeCodePoint(parseInt(n, 10)))
        .replace(/&#x([0-9a-f]+);/gi, (_, n) => safeCodePoint(parseInt(n, 16)))
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&');
}

function safeCodePoint(n) {
    try {
        return String.fromCodePoint(n);
    } catch {
        return '';
    }
}

function rssTag(block, name) {
    const m = block.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
    if (!m) return '';
    return m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1').trim();
}

function parseRss(xml) {
    const items = [];
    for (const m of xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)) {
        const block = m[0];
        const title = decodeEntities(rssTag(block, 'title')).replace(/\s+/g, ' ').trim();
        const link = rssTag(block, 'link').trim();
        if (!title || !/^https?:\/\//i.test(link)) continue; // só links http(s)
        items.push({ title, link, pubDate: rssTag(block, 'pubDate') });
    }
    return items;
}

/* ───────────────────────── Firestore (REST) ───────────────────────── */

function firestoreBase(env) {
    return `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
}

// A chave do Firebase para web é pública (já está no código do site). Se ela tiver restrição
// por referenciador no Google Cloud, o Worker se identifica com o endereço do próprio site.
function firestoreHeaders(env) {
    return { Referer: `${env.SITE_ORIGIN}/` };
}

async function getNews(id, env) {
    const endpoint = `${firestoreBase(env)}/news/${encodeURIComponent(id)}?key=${env.FIREBASE_API_KEY}`;
    const res = await fetch(endpoint, {
        headers: firestoreHeaders(env),
        cf: { cacheTtl: 300, cacheEverything: true, cacheTtlByStatus: { '200-299': 300, '400-599': 0 } },
    });
    if (!res.ok) return null;

    const f = (await res.json()).fields || {};
    const str = (k) => (f[k] && f[k].stringValue) || '';
    const titulo = str('titulo').trim();
    if (!titulo) return null;

    return {
        titulo,
        corpo: str('corpo'),
        imagemUrl: str('imagemUrl'),
        autor: str('autor').trim(),
        createdAt: (f.createdAt && f.createdAt.timestampValue) || '',
    };
}

/* ───────────────────────── /pages/noticia ───────────────────────── */

function buildDescription(corpo) {
    const clean = String(corpo || '').replace(/\s+/g, ' ').trim();
    if (clean.length <= 160) return clean;
    return clean.slice(0, 157).replace(/\s+\S*$/, '') + '…';
}

async function handleNoticia(request, env, url) {
    const assetRes = await env.ASSETS.fetch(request);
    const id = url.searchParams.get('id');
    if (!assetRes.ok || !id || !NEWS_ID_RE.test(id)) return assetRes;

    const news = await getNews(id, env);
    if (!news) return assetRes; // a própria página mostra "notícia não encontrada"

    const origin = env.SITE_ORIGIN;
    const canonical = `${origin}/pages/noticia?id=${encodeURIComponent(id)}`;
    const title = `${news.titulo} · Fundação Fênix 193`;
    const desc = buildDescription(news.corpo) || 'Leia esta notícia da Fundação Fênix 193.';
    const image = /^https:\/\//i.test(news.imagemUrl) ? news.imagemUrl : '';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: news.titulo.slice(0, 110),
        description: desc,
        mainEntityOfPage: canonical,
        inLanguage: 'pt-BR',
        author: [
            news.autor && !news.autor.includes('@')
                ? { '@type': 'Person', name: news.autor }
                : { '@type': 'Organization', name: 'Fundação Fênix 193' },
        ],
        publisher: {
            '@type': 'Organization',
            name: 'Fundação Fênix 193',
            logo: { '@type': 'ImageObject', url: `${origin}/assets/ui/web-app-manifest-512x512.png` },
        },
    };
    if (news.createdAt) {
        jsonLd.datePublished = news.createdAt;
        jsonLd.dateModified = news.createdAt;
    }
    if (image) jsonLd.image = [image];

    const setContent = (value) => ({ element: (el) => el.setAttribute('content', value) });
    const headAppend =
        `<link rel="canonical" href="${escXml(canonical)}">` +
        `<meta property="og:url" content="${escXml(canonical)}">` +
        `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`;

    let rewriter = new HTMLRewriter()
        .on('title', { element: (el) => el.setInnerContent(title) })
        .on('meta[name="description"]', setContent(desc))
        .on('meta[property="og:type"]', setContent('article'))
        .on('meta[property="og:title"]', setContent(title))
        .on('meta[property="og:description"]', setContent(desc))
        .on('meta[name="twitter:title"]', setContent(title))
        .on('meta[name="twitter:description"]', setContent(desc))
        .on('head', { element: (el) => el.append(headAppend, { html: true }) });

    if (image) {
        rewriter = rewriter
            .on('meta[property="og:image"]', setContent(image))
            .on('meta[name="twitter:image"]', setContent(image))
            .on('meta[property="og:image:alt"]', setContent(news.titulo));
    }

    const transformed = rewriter.transform(assetRes);
    const out = new Response(transformed.body, transformed);
    out.headers.delete('ETag'); // o corpo muda por notícia; o ETag do arquivo estático não vale
    out.headers.set('Cache-Control', 'public, max-age=300');
    return out;
}

/* ───────────────────────── /sitemap-noticias.xml ───────────────────────── */

async function handleNewsSitemap(env, ctx) {
    const cache = caches.default;
    const key = new Request(`${env.SITE_ORIGIN}/sitemap-noticias.xml`);
    const hit = await cache.match(key);
    if (hit) return hit;

    const res = await fetch(`${firestoreBase(env)}:runQuery?key=${env.FIREBASE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...firestoreHeaders(env) },
        body: JSON.stringify({
            structuredQuery: {
                from: [{ collectionId: 'news' }],
                orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
                limit: 500,
            },
        }),
    });
    if (!res.ok) return json({ error: 'firestore_error', status: res.status }, 502);

    const rows = await res.json();
    const entries = [];
    for (const row of Array.isArray(rows) ? rows : []) {
        const doc = row.document;
        if (!doc || !doc.name) continue;
        const id = doc.name.split('/').pop();
        if (!NEWS_ID_RE.test(id)) continue;
        const ts = (doc.fields && doc.fields.createdAt && doc.fields.createdAt.timestampValue) || doc.updateTime || '';
        const lastmod = ts ? `\n    <lastmod>${escXml(ts.slice(0, 10))}</lastmod>` : '';
        entries.push(
            `  <url>\n    <loc>${escXml(`${env.SITE_ORIGIN}/pages/noticia?id=${encodeURIComponent(id)}`)}</loc>${lastmod}\n  </url>`
        );
    }

    const xml =
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        entries.join('\n') +
        `\n</urlset>\n`;

    const out = new Response(xml, {
        headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    });
    ctx.waitUntil(cache.put(key, out.clone()));
    return out;
}
