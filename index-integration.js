/**
 * ============================================================
 *  FUNDAÇÃO FÊNIX 193 — index-integration.js
 *
 *  Substitui o script.js (ou acrescenta ao final) com:
 *  1. Notícias: exibe as 2 mais recentes da coleção `news`
 *  2. Formulário: envia contatos para a coleção `contacts`
 *
 *  NOTA: Esta integração substitui o bloco RSS iframes e o
 *  envio para `contatos`. Veja as instruções de HTML abaixo.
 * ============================================================
 */

// ── Imports (adicione junto com os existentes no script.js) ──
import {
    getFirestore,
    collection, getDocs, addDoc,
    query, orderBy, limit,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// db já inicializado no script.js — reutilize. Exemplo:
// const db = getFirestore(firebaseApp);

/* =============================================================
   NOTÍCIAS HOME — 2 mais recentes
   ─────────────────────────────────────────────────────────────
   No index.html, substitua o bloco `<div class="news-rss-grid">`
   pelo seguinte HTML:

   <div id="home-news-grid" class="news-home-grid">
       <!-- Skeletons enquanto carrega -->
       <div class="news-home-skeleton"></div>
       <div class="news-home-skeleton"></div>
   </div>
   <div style="text-align:center;margin-top:36px;">
       <a href="news.html" class="btn-outline-sm">
           <i class="fas fa-newspaper"></i> Ver todas as notícias
       </a>
   </div>

   E adicione este CSS inline ou no style.css:

   .news-home-grid {
       display: grid;
       grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
       gap: 28px;
   }
   .news-home-card {
       background: var(--white); border-radius: var(--radius-lg);
       border: 1px solid rgba(0,0,0,.06); overflow: hidden;
       box-shadow: var(--shadow-sm); transition: var(--transition);
       display: flex; flex-direction: column; text-decoration: none;
   }
   .news-home-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
   .news-home-img {
       width: 100%; height: 200px; object-fit: cover; display: block;
       transition: transform .5s ease;
   }
   .news-home-card:hover .news-home-img { transform: scale(1.04); }
   .news-home-img-placeholder {
       width: 100%; height: 200px;
       background: linear-gradient(135deg, var(--navy), var(--red-dark));
       display: flex; align-items: center; justify-content: center;
       font-size: 2.8rem; color: rgba(255,255,255,.12);
   }
   .news-home-body { padding: 22px; flex: 1; display: flex; flex-direction: column; gap: 10px; }
   .news-home-meta { font-size: .78rem; color: var(--gray); display: flex; align-items: center; gap: 10px; }
   .news-home-title { font-family: var(--font-display); font-size: 1.2rem; color: var(--navy); line-height: 1.2;
       display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
   .news-home-excerpt { font-size: .88rem; color: var(--text-muted); flex: 1;
       display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
   .news-home-link { color: var(--red); font-size: .83rem; font-weight: 700; text-transform: uppercase;
       letter-spacing: .05em; display: flex; align-items: center; gap: 6px; transition: gap var(--transition); }
   .news-home-card:hover .news-home-link { gap: 10px; }
   .news-home-skeleton {
       background: var(--white); border-radius: var(--radius-lg); overflow: hidden;
       box-shadow: var(--shadow-sm); height: 360px;
       background: linear-gradient(90deg, var(--gray-light) 25%, var(--off-white) 50%, var(--gray-light) 75%);
       background-size: 200% 100%; animation: shimmer 1.4s infinite;
   }
   @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
   ============================================================= */

(function initHomeNews() {
    const grid = document.getElementById('home-news-grid');
    if (!grid) return;

    function fmtDate(ts) {
        if (!ts) return '';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function escHtml(s) {
        return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    async function fetchHomeNews() {
        try {
            const q    = query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(2));
            const snap = await getDocs(q);

            grid.innerHTML = '';

            if (snap.empty) {
                grid.innerHTML = `
                    <div style="grid-column:1/-1;text-align:center;padding:48px 24px;color:var(--text-muted);">
                        <i class="fas fa-newspaper" style="font-size:2rem;opacity:.2;display:block;margin-bottom:12px;"></i>
                        <p>Nenhuma notícia publicada ainda. Fique atento!</p>
                    </div>`;
                return;
            }

            snap.forEach(d => {
                const n = d.data();
                const card = document.createElement('a');
                card.className = 'news-home-card';
                card.href      = `news.html?noticia=${d.id}`;
                card.setAttribute('aria-label', `Ler notícia: ${escHtml(n.titulo)}`);
                card.innerHTML = `
                    <div style="overflow:hidden;">
                        ${n.imagemUrl
                            ? `<img class="news-home-img" src="${escHtml(n.imagemUrl)}" alt="${escHtml(n.titulo)}" loading="lazy">`
                            : `<div class="news-home-img-placeholder"><i class="fas fa-fire-flame-curved"></i></div>`}
                    </div>
                    <div class="news-home-body">
                        <div class="news-home-meta">
                            <span><i class="fas fa-calendar-days"></i> ${fmtDate(n.createdAt)}</span>
                            <span><i class="fas fa-user"></i> ${escHtml(n.autor)}</span>
                        </div>
                        <h3 class="news-home-title">${escHtml(n.titulo)}</h3>
                        <p class="news-home-excerpt">${escHtml(n.corpo)}</p>
                        <span class="news-home-link">Ler mais <i class="fas fa-arrow-right"></i></span>
                    </div>`;
                grid.appendChild(card);
            });

        } catch (e) {
            console.error('[Fênix 193] Erro ao carregar notícias home:', e);
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">
                <p>Não foi possível carregar as notícias.</p></div>`;
        }
    }

    fetchHomeNews();
})();

/* =============================================================
   FORMULÁRIO DE CONTATO
   ─────────────────────────────────────────────────────────────
   IMPORTANTE: O formulário em index.html usa o id `contact-form`.
   Este módulo SUBSTITUI o bloco de formulário existente em script.js
   que enviava para `contatos`. Agora envia para `contacts`.

   Certifique-se que o campo <select id="assunto"> continua igual
   e adicione opcionalmente um campo telefone:
   <input type="tel" id="telefone" name="telefone" placeholder="(79) 9XXXX-XXXX">
   ============================================================= */

(function initContactForm() {
    const form   = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    if (!form || !status) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = form.querySelector('.btn-submit');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando…';

        const telefoneEl = form.querySelector('#telefone');

        const payload = {
            nome:     form.nome.value.trim(),
            email:    form.email.value.trim(),
            assunto:  form.assunto?.value  || '',
            mensagem: form.mensagem.value.trim(),
            ...(telefoneEl && { telefone: telefoneEl.value.trim() }),
            read:     false,           // flag para admin saber se já leu
            createdAt: serverTimestamp()
        };

        // Basic validation
        if (!payload.nome || !payload.email || !payload.mensagem) {
            status.textContent = '⚠ Preencha todos os campos obrigatórios.';
            status.className = 'form-status error';
            status.hidden = false;
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensagem';
            return;
        }

        try {
            await addDoc(collection(db, 'contacts'), payload);

            status.textContent = '✔ Mensagem enviada com sucesso! Em breve entraremos em contato.';
            status.className = 'form-status success';
            status.hidden = false;
            form.reset();

        } catch (err) {
            console.error('[Fênix 193] Erro ao enviar contato:', err);
            status.textContent = '✖ Falha ao enviar. Por favor, tente novamente.';
            status.className = 'form-status error';
            status.hidden = false;

        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensagem';
            setTimeout(() => { status.hidden = true; }, 6000);
        }
    });
})();

/* =============================================================
   INSTRUÇÃO FINAL para script.js:
   ─────────────────────────────────────────────────────────────
   1. Remova ou comente a função `initContactForm` existente
      que usa a coleção `contatos`.
   2. Remova ou comente a função `fetchNews` que usa os RSS iframes.
   3. No DOMContentLoaded, chame apenas os módulos acima.
   4. Certifique-se que `db` está no escopo — o `firebaseApp`
      e `db` devem ser inicializados antes deste módulo ser
      importado/executado.

   Para importar no script.js existente (como módulo ES6):
   // Adicione no topo com os outros imports:
   import { collection, getDocs, addDoc, query, orderBy, limit, serverTimestamp }
       from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
   ============================================================= */