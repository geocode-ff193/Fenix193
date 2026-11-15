# 📁 Estrutura de Arquivos Atual

```text
Fenix193/
├── index.html                         # Página inicial (home)
├── pesquisa.html                      # Página de resultados da pesquisa global
├── 404.html                           # Página de erro personalizada
├── akannihub.html                     # Painel administrativo (autenticado)
├── firestore.rules                    # Regras de segurança Firestore v1.9.0
├── wrangler.jsonc                     # Configuração de deploy no Cloudflare Workers
├── _headers                           # Cabeçalhos HTTP e regras de cache (Cloudflare)
├── worker/
│   └── index.js                       # Worker: feed do CBMSE, SEO das notícias e sitemap de notícias
├── .assetsignore                      # Arquivos que não são publicados no site
├── site.webmanifest                   # PWA manifest
├── sitemap.xml                        # Mapa do site para SEO
├── robots.txt                         # Diretivas para crawlers
│
├── pages/                             # Subpáginas públicas
│   ├── nossa-historia.html
│   ├── missao-valores.html
│   ├── equipe.html
│   ├── projetos.html
│   ├── capacitacao.html
│   ├── eventos.html
│   ├── parcerias.html
│   ├── noticias.html
│   ├── noticia.html                   # Leitura de uma notícia
│   ├── transparencia.html
│   ├── galeria.html                   # Galeria de fotos
│   └── fale-conosco.html              # Formulário de contato (75 municípios de SE)
│
├── assets/
│   ├── css/
│   │   ├── style.css                  # Design system global (tokens, layout, componentes)
│   │   ├── header.css                 # Header em duas camadas (header--top / header--main)
│   │   ├── dropdown.css               # Menu dropdown desktop/mobile
│   │   ├── pages.css                  # Estilos compartilhados entre subpáginas
│   │   ├── noticias.css               # Grid, modal e estilos da página de notícias
│   │   ├── contato.css                # Página Fale Conosco
│   │   ├── pesquisa.css               # Página de resultados da pesquisa
│   │   ├── acessibilidade.css         # Painel de acessibilidade, paletas e player AD
│   │   ├── back-to-top.css            # Botão "Voltar ao topo"
│   │   ├── cbmse-feed.css             # Widget "Segurança & Defesa Civil"
│   │   ├── chatbot.css                # Chatbot flutuante LuminIA
│   │   └── 404.css                    # Animação da página de erro
│   │
│   ├── js/
│   │   ├── script.js                  # Lógica principal: menu, notícias, números de impacto, LGPD
│   │   ├── search-core.js             # Núcleo da busca (índice, leitura das páginas, Firestore, ranking)
│   │   ├── search.js                  # Dropdown de sugestões do hero
│   │   ├── pesquisa.js                # Lógica da página de resultados
│   │   ├── acessibilidade.js          # Painel de acessibilidade (auto-injetado)
│   │   ├── back-to-top.js             # Botão "Voltar ao topo" (auto-injetado)
│   │   ├── media-player.js            # Player de vídeo com audiodescrição
│   │   ├── cbmse-feed.js              # Widget "Segurança & Defesa Civil" (usa /api/feed do Worker)
│   │   ├── img-utils.js               # Otimização de imagens do Cloudinary (f_auto, q_auto, largura)
│   │   └── chatbot.js                 # Assistente virtual LuminIA
│   │
│   ├── data/                          # Faixas de audiodescrição (.json)
│   ├── img/                           # Imagens estáticas (logos, fotos institucionais)
│   └── ui/                            # Favicons e ícones PWA
│
└── .github/
    └── ISSUE_TEMPLATE/
        └── solicitacao_cliente.yml    # Template legado de chamado
```
