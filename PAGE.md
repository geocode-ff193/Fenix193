# 📁 Estrutura de Arquivos

```text
fenix193/
├── index.html                         # Página inicial (home)
├── 404.html                           # Página de erro personalizada
├── robots.txt                         # Diretivas para crawlers
├── sitemap.xml                        # Mapa do site para SEO
├── pesquisa.html                      # Página de resultados da pesquisa global
├── firestore.rules                    # Regras de segurança Firestore v1.9.0
├── wrangler.jsonc                     # Configuração de deploy no Cloudflare Workers
├── _headers                           # Cabeçalhos HTTP e regras de cache (Cloudflare)
├── .assetsignore                      # Arquivos que não são publicados no site
├── site.webmanifest                   # PWA manifest
├── README.md
├── ad-video-institucional.json
├── _redirects
├── worker/
│   └── index.js                       # Worker: feed do CBMSE, SEO das notícias e sitemap de notícias
│
├── pages/                             # Subpáginas públicas
│   ├── institucional/
│   │   ├── quem-somos.html
│   │   ├── nossa-historia.html
│   │   ├── missao-valores.html
│   │   ├── equipe.html
│   │   └── instituidores.html
│   │
│   ├── atuacao/
│   │   ├── projetos/
│   │   │   ├── index.html             # lista de projetos
│   │   │   └── [nome-do-projeto].html # um por projeto (meta, valor captado, fotos)
│   │   ├── capacitacao.html
│   │   ├── eventos.html
│   │   ├── galeria.html               # Galeria de fotos
│   │   └── parcerias.html
│   │
│   ├── transparencia/
│   │   ├── index.html                 # visão geral e atalhos
│   │   ├── prestacao-de-contas.html   # balanços e relatórios anuais por ano
│   │   ├── documentos.html            # estatuto, atas, certidões
│   │   ├── editais.html               # chamadas públicas e seleções
│   │   ├── integridade.html           # código de conduta e canal de denúncia
│   │   └── lgpd.html                  # encarregado (DPO) e direitos do titular
│   │
│   ├── noticias/
│   │   ├── index.html                 # lista com filtro por categoria
│   │   └── [data-titulo].html         # uma por notícia
│   │
│   ├── colabore/
│   │   ├── index.html                 # os 3 caminhos
│   │   ├── doar.html                  # PIX/QR Code, dados bancários, recorrência
│   │   ├── seja-parceiro.html
│   │   └── seja-voluntario.html       # formulário próprio
│   │
│   ├── contato/
│   │   ├── fale-conosco.html          # Formulário de contato
│   │   └── imprensa.html              # (opcional) kit de imprensa e logos
│   │
│   └── legal/
│       ├── politica-privacidade.html  # no domínio da Fundação
│       ├── termos-de-uso.html
│       ├── cookies.html
│       └── acessibilidade.html        # declaração de acessibilidade
│
├── akannihub.html                     # Painel administrativo (autenticado)
│
├── data/                              # conteúdo separado do HTML
│   ├── noticias.json
│   ├── projetos.json
│   ├── impacto.json
│   └── apoiadores.json
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
│   ├── img/
│   │   ├── ui/                        # Favicons e ícones
│   │   ├── logos/
│   │   ├── hero/
│   │   ├── galeria/
│   │   ├── noticias/
│   │   └── parceiros/
│   ├── docs/                         # PDFs de transparência, organizados por ano
│   │   ├── 2025/
│   │   └── 2026/
│   ├── fonts/
│   └── vendor/
│
└── .github/
    └── ISSUE_TEMPLATE/
        └── solicitacao_cliente.yml    # Template legado de chamado
```
