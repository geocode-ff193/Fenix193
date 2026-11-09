<div align="center">

<img src="assets/img/ff193_transp.webp" width="80" alt="Fundação Fênix 193 logo" />

# Fundação Fênix193 — Ecossistema Digital

**`v1.5.0`** · Outubro 2026 · Produção estável

[![Deploy](https://img.shields.io/badge/deploy-Cloudflare-F38020?style=flat-square&logo=cloudflare&logoColor=fff)](https://fenix193.org.br)
[![Firebase](https://img.shields.io/badge/backend-Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=000)](https://firebase.google.com)
[![Stack](https://img.shields.io/badge/stack-Vanilla%20JS-F7DF1E?style=flat-square&logo=javascript&logoColor=000)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/license-Privado-red?style=flat-square)](#-créditos)

*Sistema web completo para fundação de apoio ao CBMSE — site institucional, painel administrativo, portal de transparência, notícias, eventos, pesquisa global, fale conosco e chatbot institucional.*

</div>

---

## Índice

- [Visão Geral](#-visão-geral)
- [Novidades da v1.5.0](#-novidades-da-v150)
- [Arquitetura e Stack](#-arquitetura-e-stack)
- [Produtos do Ecossistema](#-produtos-do-ecossistema)
- [Site Público](#-site-público)
- [Pesquisa Global](#-pesquisa-global)
- [AkanniHub — Painel Administrativo](#-akannihub--painel-administrativo)
- [Acessibilidade](#-acessibilidade)
- [Chatbot LuminIA](#-chatbot-luminia)
- [Segurança — Firestore Rules](#-segurança--firestore-rules)
- [Estrutura de Arquivos](#-estrutura-de-arquivos)
- [Configuração e Deploy](#-configuração-e-deploy)
- [Versionamento](#-versionamento)
- [Correções Recentes](#-correções-recentes)
- [Pendências Conhecidas](#-pendências-conhecidas)
- [Roadmap — Próximas Atualizações](#-roadmap--próximas-atualizações)
- [Créditos](#-créditos)

---

## 📌 Visão Geral

Sistema web institucional desenvolvido por **GeoCODE Programmer (Geovani Santos)** para a **Fundação Fênix 193** — entidade privada sem fins lucrativos com sede em Aracaju/SE, criada para apoiar o Corpo de Bombeiros Militar de Sergipe (CBMSE) e as ações de Proteção e Defesa Civil.

O projeto é composto por dois produtos integrados via Firebase, ambos em stack vanilla sem build tools, com deploy contínuo no Cloudflare (Workers), a partir da branch `main` deste repositório.

> **Filosofia de desenvolvimento:** zero dependências de framework, zero processo de build, CSS modular com design tokens, Firebase SDK v9 via CDN ESM — máxima performance e manutenção acessível ao time técnico.

---

## ✨ Novidades da v1.5.0

Ciclo de atualização com 7 melhorias no site e no painel, mais ajustes de acabamento.

| # | Melhoria | Onde |
| --- | ---------- | ------ |
| 1 | **Botão "Voltar ao topo"** em todas as páginas, com detecção de rolagem | Site e AkanniHub |
| 2 | **Header padronizado em duas camadas** — `header--top` (logo, pesquisa, AkanniHub, redes sociais) e `header--main` (navegação com dropdowns) | Site |
| 3 | **Painel de acessibilidade ampliado** — texto ±, escala de cinza, alto contraste, controle negativo, fundo claro, links sublinhados, fonte legível e redefinir, tudo salvo no `localStorage` | Site |
| 4 | **Suporte Técnico como formulário** — o chamado vai por e-mail para a equipe de suporte, com protocolo | AkanniHub |
| 5 | **Página Fale Conosco** — formulário com os 75 municípios de Sergipe, envio anônimo opcional e envio por e-mail para a Fundação | Site |
| 6 | **Aba Números** — edição das estatísticas de impacto, gravadas no Firestore e lidas pela home | AkanniHub + Site |
| 7 | **Pesquisa global** — página de resultados dedicada, que pesquisa em todo o site | Site |

**Ajustes de acabamento:**

- "Colabore" voltou a ser um item de menu normal (sem destaque de botão).
- O formulário de contato saiu da home: a seção "Entre em Contato" mantém endereço, telefone e e-mail e leva ao Fale Conosco. Os botões *Fazer Doação*, *Ser Parceiro* e *Ser Voluntário* abrem o Fale Conosco já com o assunto selecionado (`?assunto=doacao|parceria|voluntariado`).
- Regras do Firestore atualizadas para **v1.9.0** (nova coleção `site_stats`).
- Credenciais de suporte removidas da tela do painel (item de segurança do roadmap anterior).

---

## 🛠 Arquitetura e Stack

### Frontend

| Camada | Tecnologia |
| -------- | ----------- |
| Marcação | HTML5 semântico (ARIA, roles, landmarks) |
| Estilização | CSS3 + Custom Properties (design tokens) |
| Lógica | JavaScript ES6+ Vanilla, ES Modules |
| Fontes | Google Fonts — Barlow Condensed · Barlow · Atkinson Hyperlegible (carregada só quando "Fonte legível" é ativada) |
| Ícones | Font Awesome 6.5 |

### Backend / BaaS

| Serviço | Finalidade |
| --------- | ----------- |
| Firebase Authentication | Login de administradores (Google OAuth 2.0 e e-mail/senha) |
| Cloud Firestore | Banco NoSQL — 10 coleções |
| Firebase Security Rules | Controle de acesso granular por coleção e por grau de administração (v1.9.0) |
| Firebase Analytics | Métricas de acesso (opt-in LGPD) |
| Cloudinary | Upload e hospedagem de imagens das notícias |
| FormSubmit | Envio de e-mail sem servidor (Fale Conosco e Suporte Técnico) |

### Infraestrutura

| Item | Configuração |
| ------ | ------------- |
| Hosting | Cloudflare Workers (assets estáticos, deploy contínuo via GitHub) |
| Configuração | `wrangler.jsonc` (deploy e Worker), `_headers` (cabeçalhos e cache), `.assetsignore` (arquivos não publicados) |
| Worker | `worker/index.js`: só atende `/api/feed`, `/pages/noticia` e `/sitemap-noticias.xml`; o resto do site é estático |
| Roteamento | `html_handling: drop-trailing-slash` (URLs sem `.html` e sem barra final) e `not_found_handling: 404-page` (usa o `404.html`) |
| Cache HTML | Padrão do Cloudflare Workers (revalida a cada acesso) |
| Cache CSS/JS | `max-age=0, must-revalidate` (os arquivos não têm hash no nome) |
| Cache imagens e ícones | `max-age=604800` (7 dias); faixas de audiodescrição: 1 hora |
| Headers de segurança | `X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`; `X-Robots-Tag: noindex, nofollow` no AkanniHub |
| Domínio | `fenix193.org.br`, registrado no Registro.br com DNS no Cloudflare |

> O site foi migrado da Vercel para o Cloudflare em novembro de 2026. O antigo `vercel.json` foi removido.

---

## 🗂 Produtos do Ecossistema

| # | Produto | Rota | Público-alvo |
|---|---------|------|-------------|
| 1 | **Site Institucional Público** | `/`, `/pages/*` e `/pesquisa` | Sociedade, parceiros, imprensa |
| 2 | **AkanniHub (Painel Admin)** | `/akannihub` | Administradores autorizados |

---

## 🌐 Site Público

### Header padronizado

Todas as páginas (exceto a 404, que é uma tela isolada) usam o mesmo cabeçalho, em duas camadas dentro de `#main-header`:

| Camada | Conteúdo |
|--------|----------|
| **`header--top`** | Logo · campo de **pesquisa** · botão **AkanniHub** · **redes sociais** (Instagram, Facebook, WhatsApp, YouTube) |
| **`header--main`** | Navegação principal: Início · Institucional ▾ · Atuação ▾ · Transparência · Impacto · Notícias · Contato · Colabore |

- **Desktop:** a camada superior sai da tela ao rolar e só a barra de navegação escura permanece fixa (`position: sticky`), economizando altura. O item da página atual pode receber `aria-current="page"` e ganha destaque.
- **Mobile:** só logo e hambúrguer ficam no topo; pesquisa, AkanniHub e redes aparecem dentro do menu em tela cheia.
- **Telas médias:** até 1024 px as redes saem do topo; até 900 px o botão AkanniHub vira só ícone.
- **Dropdowns** com hover (desktop) e clique (mobile); fecham ao clicar fora ou com `Esc`.
- "Contato" leva à página **Fale Conosco**.
- Os IDs `#main-header`, `#nav-menu`, `#menu` e `#btn-mobile` são a base dos scripts de menu — não renomear.
- Estilos em `assets/css/header.css` (carregado depois de `style.css` e `dropdown.css`).

### Botão "Voltar ao topo"

- Aparece depois de 300 px de rolagem e some ao voltar ao topo.
- Fica no canto inferior direito, logo acima do botão da LuminIA (no AkanniHub, que não tem chatbot, encosta no canto).
- Scroll suave (respeita `prefers-reduced-motion`), foco devolvido ao início da página e adaptação aos temas de contraste.
- O botão é injetado por `back-to-top.js`; basta incluir o script e `back-to-top.css`.

### Hero & Busca

- Campo de busca com **dropdown de sugestões** em tempo real (índice estático + notícias e documentos do Firestore), destaque dos termos e navegação por teclado (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`).
- `Enter` sem item selecionado, ou o link **"Ver todos os resultados"**, abre a [página de pesquisa global](#-pesquisa-global).
- Feed de **últimas 3 notícias** em grid 3×1 diretamente no hero.

### Seções da Home

| Seção | Descrição |
| ------- | --------- |
| **Quem Somos** | Carrossel automático de 4 imagens com autoplay, dots e botões prev/next |
| **Números que Impactam** | Contadores animados (IntersectionObserver) com valores **editados no AkanniHub** (coleção `site_stats`). Sem dados, mostram "—" em vez de um "0+" enganoso |
| **Áreas de Atuação** | Grid de 4 cards (Apoio Operacional, Capacitação, Projetos Sociais, Prevenção) |
| **Projetos em Destaque** | 3 cards visíveis + toggle "ver todos" com animação escalonada |
| **Como Ajudar** | 3 cards: Doações (PIX), Parcerias (empresas), Voluntariado — os botões abrem o Fale Conosco com o assunto já selecionado |
| **Últimas Notícias** | 2 cards carregados dinamicamente do Firestore com skeleton loading |
| **Instituidores & Apoiadores** | Carrossel marquee animado (ativa somente com ≥ 5 cards) |
| **Entre em Contato** | Endereço, telefone e e-mail, mais um cartão que leva ao Fale Conosco (o formulário migrou para a página própria) |
| **Banner de Cookies (LGPD)** | Opt-in para Firebase Analytics com persistência em `localStorage` |

### Subpáginas Institucionais

<details>
<summary><strong>🏛 Nossa História</strong></summary>

- Linha do tempo vertical com cards alternados (esquerda/direita), alimentada pela coleção `timeline`.
- Grid de 4 pilares fundadores.
- CTA para "Como Ajudar" e página de Equipe.

</details>

<details>
<summary><strong>🎯 Missão e Valores</strong></summary>

- 3 cards MVV com gradientes distintos (Missão, Visão, Valores).
- Grid de 5 valores detalhados com ícones e descrições.
- CTA para Projetos e Transparência.

</details>

<details>
<summary><strong>👥 Equipe</strong></summary>

- Organograma com 4 conselhos: Presidente de Honra, Curadores, Executivo e Fiscal.
- Cards com fotos reais, nome e cargo de cada membro.
- Hover com barra de destaque animada.

</details>

<details>
<summary><strong>📂 Transparência</strong></summary>

- Portal dinâmico com documentos agrupados por 7 categorias (Prestação de Contas, Relatórios, Estatuto, Certidões, Contratos, Editais, Atas).
- Documentos carregados do Firestore em tempo real.
- Cada documento abre diretamente no Google Drive (nova aba).
- Estado de loading, vazio e erro tratados com feedback visual.

</details>

<details>
<summary><strong>📋 Projetos</strong></summary>

- Grid com filtros por status: Todos / Em Planejamento / Em Andamento / Finalizados / Cursos.
- Contador de projetos visíveis atualizado dinamicamente.
- Modal de detalhe com ícone, status badge, descrição, área, público-alvo e objetivo.
- CTA para contato e parceria.

</details>

<details>
<summary><strong>🎓 Capacitação</strong></summary>

- Strip de 5 diferenciais (instrutores, certificação, turmas, in company, conteúdo).
- Catálogo de cursos com conteúdo programático, carga horária e badges de categoria.
- Processo de inscrição em 5 etapas.
- CTA in company para proposta personalizada.

</details>

<details>
<summary><strong>📅 Eventos</strong></summary>

- Feed dinâmico do Firestore com separação automática entre **Próximos** e **Realizados** (tabs).
- Bloco de data visual por evento (vermelho = futuro, navy = passado).
- Badge de custo (Gratuito / Pago) e botão de inscrição por link externo.
- Estado de vazio customizado por categoria (próximos vs. histórico).

</details>

<details>
<summary><strong>🤝 Parcerias</strong></summary>

- Grid "Por que ser Parceiro?" com cards de benefícios.
- Processo em 5 etapas (Interesse → Reunião → Proposta → Termo → Ativo).
- Grid de logos de instituidores e apoiadores com hover colorido.
- CTA para contato e transparência.

</details>

<details>
<summary><strong>📰 Notícias</strong></summary>

- Grid paginado (9 por página) com `startAfter` do Firestore.
- Primeiro card em destaque (`featured`, layout horizontal).
- Modal de leitura completa com imagem hero, meta, corpo e compartilhamento.
- Compartilhamento via **WhatsApp** e **Clipboard** com feedback visual.
- URL com `?noticia=ID` para links diretos por notícia.
- Skeletons de loading e estados de vazio e erro.

</details>

<details open>
<summary><strong>✉️ Fale Conosco</strong> <em>(novo)</em> — <code>pages/fale-conosco.html</code></summary>

Página de contato com formulário completo, que substitui o formulário da home.

- **Campos:** nome, e-mail, WhatsApp/telefone (com máscara `(79) 99999-9999`), **município**, assunto e mensagem (contador de 4.000 caracteres).
- **Município:** lista com os **75 municípios de Sergipe** em ordem alfabética, mais "Outro estado ou país".
- **Assuntos:** Denúncia, Doação, Parceria empresarial, Voluntariado, Imprensa, Dúvida ou informação, Sugestão ou elogio, Outro. Aceita `?assunto=doacao|parceria|voluntariado|...` na URL para já abrir com o assunto escolhido.
- **Envio sem identificação:** a opção *"Quero enviar sem me identificar"* desativa nome, e-mail e telefone e dispensa o consentimento. Sem e-mail não há resposta; a opção é pensada para denúncias.
- **LGPD:** quem se identifica precisa marcar o consentimento de uso dos dados apenas para responder à mensagem.
- **Para onde vai a mensagem:**
  1. **E-mail** para a Fundação, via FormSubmit (assunto `[Site] Assunto — Município — Protocolo`; o "responder para" é o e-mail de quem escreveu).
  2. **Cópia no Firestore** (coleção `contacts`), que aparece na aba *Contatos* do AkanniHub.
  3. Conta como enviada se **pelo menos um** dos dois canais funcionar. Se ambos falharem, os dados continuam no formulário e há um link para abrir a mensagem pronta no aplicativo de e-mail.
- **Proteções:** campo-armadilha (honeypot) contra robôs, intervalo mínimo de 30 s entre envios, validação nativa e mensagens lidas por leitores de tela. Cada envio gera um **protocolo** (`FF193-AAAAMMDD-XXXX`).
- **Mensagens anônimas no Firestore:** as regras exigem e-mail; por isso a cópia guarda `anonimo@anonimo.invalid` com `anonimo: true`.
- Estilos em `assets/css/contato.css`.

</details>

### Widget "Segurança & Defesa Civil"

- Bloco lateral que exibe automaticamente as últimas notícias publicadas nos sites oficiais do **CBMSE** e da **Defesa Civil de Sergipe**, com abas para alternar entre as duas fontes.
- Busca as notícias em tempo real diretamente dos feeds públicos desses órgãos — a Fundação não precisa cadastrar nada manualmente.
- Caso os serviços externos estejam temporariamente indisponíveis, o widget exibe a última versão salva no navegador do visitante, evitando bloco vazio.

### 404 Personalizada

- Animação CSS de gradiente de fogo no número "404".
- Ícone de chama animado com `float`.
- Botão de retorno à home.

---

## 🔎 Pesquisa Global

Página de resultados dedicada em `/pesquisa` (arquivo `pesquisa.html`, na raiz). Recebe a busca por URL e pesquisa em todo o site.

**Como a busca chega até ela**

| Origem | Comportamento |
| -------- | -------------- |
| Barra do **header** (qualquer página) | Envia para `pesquisa.html?q=termo`. Na própria página de resultados, pesquisa ali mesmo, sem recarregar |
| **Hero** da home | Dropdown de sugestões; `Enter` ou "Ver todos os resultados" abre a página completa |
| Campo da **página** de resultados | Atualiza a URL (`History API`); voltar/avançar no navegador refaz a busca |

**O que é pesquisado**

1. **Índice curado** de páginas e âncoras do site.
2. **Texto real das páginas**: o `<main>` de cada página é lido sob demanda, dividido por títulos (h1–h3) e guardado na sessão por 30 minutos. O resultado leva à âncora da seção quando ela existe. Assim a busca enxerga o conteúdo que estiver no HTML, sem lista mantida à mão.
3. **Firestore**: notícias (30 mais recentes), documentos de transparência, projetos, capacitação, eventos, linha do tempo e apoiadores.

**Como os resultados são ordenados e exibidos**

- Ignora **maiúsculas e acentos** ("incendio" encontra "incêndio").
- Com vários termos, **todos** precisam aparecer, em qualquer ordem.
- **Relevância:** título pesa mais que palavras-chave, que pesam mais que o corpo do texto; frase exata e notícias recentes ganham bônus.
- Cada resultado mostra ícone, título, **trecho com os termos destacados**, categoria, autor e data. Documentos externos abrem em nova aba.
- **Filtros por categoria** com contagem (Páginas, Atuação, Notícias, Documentos, Contato), "Mostrar mais" de 10 em 10 e `?cat=` na URL.
- Estados tratados: carregando (skeleton), termo curto, sem resultado (com atalhos), aviso parcial quando o Firestore ou alguma página não puder ser lida.
- **Segurança:** o termo digitado e o conteúdo do banco são sempre escapados; o destaque é montado trecho a trecho, sem `innerHTML` com dados brutos.
- A página usa `noindex` para não aparecer em buscadores.

**Arquivos**

| Arquivo | Função |
| --------- | -------- |
| `assets/js/search-core.js` | Núcleo compartilhado: índice curado, leitura das páginas, Firestore, ranking, destaque e trechos |
| `assets/js/search.js` | Dropdown de sugestões do hero (usa o núcleo) |
| `assets/js/pesquisa.js` | Lógica da página de resultados |
| `assets/css/pesquisa.css` | Estilos da página de resultados |

> A leitura do texto das páginas usa `fetch`, então a busca completa exige o site servido por HTTP (Cloudflare ou servidor local, por exemplo `npx wrangler dev`), e não aberto por `file://`.

---

## 🔧 AkanniHub — Painel Administrativo

SPA (Single Page Application) de gestão de conteúdo acessível em `/akannihub`, protegida por autenticação Firebase com verificação de permissão contra a coleção `admins` no Firestore.

### Autenticação & Controle de Acesso

- Login por **Google Sign-In** (popup) ou **e-mail e senha**.
- Verificação do documento `admins/{uid}` no Firestore após autenticação; contas não autorizadas são desconectadas com mensagem explicativa.
- **Graus de administração:** cada admin recebe um ou mais graus no campo `graus` (array de números). Itens de menu, cards e seções que o admin não pode usar ficam ocultos, e a tentativa de abrir uma seção sem permissão é barrada.

| Grau | Acesso |
| ------ | -------- |
| `1` | **Acesso a tudo** |
| `2` | Notícias |
| `3` | Transparência |
| `4` | Contatos |
| `5` | Atuação (Projetos, Capacitação e Eventos) |
| `6` | Edição (Linha do Tempo, Apoiadores e Números) |

O **Suporte Técnico** é liberado a qualquer grau. Contas antigas sem o campo `graus` são tratadas como `[1]`.

- Avatar, nome e badge do grau exibidos na topbar após login.

### Organização do menu

| Grupo | Seções |
| ------- | -------- |
| **Painel** | Dashboard |
| **Gestão** | Atuação · Contatos · Transparência · Notícias |
| **Edição** | Linha do Tempo · Apoiadores · **Números** |
| **Suporte** | Suporte Técnico |

### Dashboard

- Cards de estatísticas em tempo real: mensagens, documentos e notícias (cada card aparece conforme o grau do admin).
- Badge de contagem de mensagens não lidas no item do menu lateral.
- Acesso rápido às principais ações.

### Módulos disponíveis

<details>
<summary><strong>📬 Contatos</strong> (grau 4)</summary>

- Tabela completa com as mensagens recebidas, incluindo as vindas do **Fale Conosco**.
- Colunas: Nome, E-mail, Assunto (badge colorido), Mensagem (truncada), Data.
- **Ações por linha:** modal de detalhe, abrir WhatsApp com mensagem pré-preenchida, abrir cliente de e-mail, excluir com confirmação.
- Botão de atualização manual e cache local das mensagens para abertura rápida do modal.

</details>

<details>
<summary><strong>📁 Transparência</strong> (grau 3)</summary>

- Formulário: Nome do arquivo, Link (Google Drive), Categoria.
- 7 categorias: Prestação de Contas, Relatórios Institucionais, Estatuto Social, Certidões, Contratos, Editais, Atas.
- Lista com ícone por categoria, data de publicação, link externo e exclusão confirmada.

</details>

<details>
<summary><strong>✍️ Notícias</strong> (grau 2)</summary>

- Formulário: Título, Autor, Texto (textarea), Imagem de Capa.
- Upload de imagem para **Cloudinary** com barra de progresso e preview em tempo real.
- Suporte a drag-and-drop na zona de upload.
- Modo de edição inline com preenchimento automático do formulário.
- Lista com thumbnail, título, autor, data e ações (editar / excluir).

</details>

<details>
<summary><strong>🎯 Atuação</strong> (grau 5) — Projetos · Capacitação · Eventos</summary>

Três sub-abas dentro de uma só seção:

- **Projetos:** título, status (Em Planejamento / Em Andamento / Finalizado / Curso), ícone, área, público-alvo, objetivo e descrição.
- **Capacitação:** título, descrição, carga horária, nível, ícone, cor, módulos.
- **Eventos:** título, data, horário, local, custo (Gratuito/Pago), link de inscrição (opcional) e descrição; bloco de data visual (vermelho = futuro, navy = passado) e helper `parseDateLocal()` para evitar deslocamento de fuso.
- Edição inline e exclusão com confirmação em todas as sub-abas.

</details>

<details>
<summary><strong>🕰 Linha do Tempo</strong> (grau 6)</summary>

- Gerencia os marcos exibidos em *Nossa História*: ano, tag, título e descrição.

</details>

<details>
<summary><strong>🤝 Apoiadores</strong> (grau 6)</summary>

- Gerencia o carrossel de instituidores e apoiadores: nome, foto (URL da imagem) e link opcional.

</details>

<details open>
<summary><strong>📊 Números</strong> <em>(novo)</em> (grau 6)</summary>

Edita as estatísticas exibidas em **"Números que Impactam"** na página inicial.

- **Campos:** Pessoas Beneficiadas, Projetos Realizados, Bombeiros Apoiados e Ações Educativas.
- **Prévia ao vivo** no estilo do site (ex.: `1.250+`), que muda enquanto se digita; o site só muda depois de **Salvar números**.
- **Validação:** apenas inteiros de 0 a 100.000.000; campos inválidos ficam marcados e o botão Salvar só libera com os quatro válidos e alguma alteração. *Desfazer* volta ao valor salvo.
- Mostra a **última atualização** (data, hora e quem editou).
- **Banco:** documento único `site_stats/impacto` com os quatro números, `updatedAt` e `updatedBy`. A home lê esse documento (leitura pública); se ele não existir ou a leitura falhar, os contadores mostram "—".

</details>

<details open>
<summary><strong>🛠 Suporte Técnico</strong> <em>(refeito)</em> (qualquer grau)</summary>

Formulário de chamado que envia e-mail para a equipe de suporte técnico.

- **Campos:** nome e e-mail (preenchidos com a conta logada), tipo de solicitação, área do painel afetada, prioridade, assunto, descrição (até 4.000 caracteres) e link opcional de print ou vídeo.
- **Informações técnicas** (página, navegador, resolução) podem ser anexadas com uma caixa marcada por padrão.
- O e-mail chega em tabela, com assunto `[AkanniHUB] [Prioridade] Assunto — Protocolo`; o "responder para" é o e-mail informado. Também seguem a conta do painel, o UID e os graus de acesso.
- Cada chamado recebe um **protocolo** (`FF193-AAAAMMDD-XXXX`) exibido para quem enviou.
- Se o envio falhar, os dados ficam no formulário e o painel oferece abrir a mensagem no aplicativo de e-mail da pessoa.
- Proteções: honeypot, intervalo de 30 s entre envios e tempo máximo de espera de 15 s.
- **Substitui** o antigo link para o GitHub Issues e a exibição das credenciais de suporte na tela.

</details>

### UX do Painel

| Feature | Detalhe |
| --------- | --------- |
| **Navegação SPA** | Alternância de seções via classes CSS sem recarregamento de página |
| **Modal de confirmação** | Componente global reutilizável para todas as exclusões |
| **Toast notifications** | Sistema success/error/default com auto-dismiss em 4 segundos |
| **Responsividade** | Sidebar colapsável em mobile via botão hamburger |
| **Sidebar badge** | Contagem de mensagens não lidas atualizada ao carregar |
| **Voltar ao topo** | Mesmo botão do site, posicionado no canto inferior direito |

---

## ♿ Acessibilidade

Componente próprio, independente do restante do site, adicionado a todas as páginas.
Conformidade-alvo: **WCAG 2.1 nível AA** e **eMAG**.

| Arquivo | Local no projeto | Função |
| --------- | ------------------ | -------- |
| `acessibilidade.css` | `assets/css/acessibilidade.css` | Botão flutuante, painel, paletas de contraste, filtros, foco visível |
| `acessibilidade.js` | `assets/js/acessibilidade.js` | Lógica do painel (auto-injetado via JS) e persistência |
| `media-player.js` | `assets/js/media-player.js` | Player de vídeo customizado com audiodescrição |
| `*.json` de faixa AD | `assets/data/` | Faixas de audiodescrição (tempo + texto) por vídeo |

### Painel de ferramentas

Botão flutuante no **canto inferior esquerdo** (o canto direito é da LuminIA). Todas as preferências são salvas no `localStorage` (chave `ff193_a11y_prefs`) e reaplicadas em todas as páginas.

| Recurso | Como funciona |
| --------- | -------------- |
| **Aumentar / Diminuir texto** | Ajusta o `font-size` do `<html>` (todo o site usa `rem`), com limite por largura de tela para não quebrar o layout; botão "A" volta a 100% |
| **Escala de cinza** | Liga/desliga |
| **Alto contraste** | Cada clique avança um passo: desligado → escuro (preto, branco e links dourados) → amarelo/preto → desligado |
| **Controle negativo** | Inverte as cores da página; imagens e vídeos são re-invertidos para manter a aparência |
| **Fundo claro** | Fundo branco, texto escuro e links azuis |
| **Links sublinhados** | Sublinha todos os links |
| **Fonte legível** | Troca para Atkinson Hyperlegible (carregada sob demanda, com Verdana/Tahoma de reserva); ícones não são afetados |
| **Redefinir** | Volta tudo ao padrão e salva esse estado |

**Regras de combinação:** *Alto contraste*, *Controle negativo* e *Fundo claro* são mutuamente exclusivos (ligar um desliga os outros). Escala de cinza, links sublinhados e fonte legível combinam com qualquer um. Quem já tinha tema ou tamanho de fonte salvo na versão anterior é migrado automaticamente.

**Paleta inteligente.** Alto contraste e Fundo claro não pintam tudo com a mesma cor: o script lê a cor de fundo **original** de cada elemento e decide o que recolorir.

| O elemento tem… | O que acontece |
| ----------------- | ---------------- |
| Imagem de fundo ou degradê (hero, números, fotos) | **Preservado** — já tem texto claro sobre fundo escuro |
| Cor viva da marca (botões vermelhos, selos) | **Preservado** |
| Fundo claro ou cinza | Recolorido para a paleta (cartões pequenos e brancos ganham contorno) |
| Fundo escuro neutro (barra de menu, rodapé) | Vira uma "superfície" levemente diferente do fundo |
| Sem fundo (transparente) | Herda o contexto do elemento pai |

Conteúdo inserido depois da carga (notícias do Firebase, por exemplo) é classificado por um `MutationObserver`. No *Fundo claro*, hero e faixa de números continuam escuros, pois são foto/degradê com texto branco.

**Acessibilidade do próprio painel:** foco preso ao painel (focus trap), fecha com `Esc`, botões com `aria-pressed`, ✓ além da cor no estado ativo, mudanças anunciadas a leitores de tela (`aria-live`) e `skip link` para o conteúdo principal.

### Player de mídia com audiodescrição

- Controles customizados 100% acessíveis via teclado (Espaço, Setas)
- Botão dedicado de Audiodescrição (AD)
- Narração via `window.speechSynthesis`, sincronizada aos tempos do vídeo, pausando a reprodução durante a fala
- Texto da descrição também exposto em um container `aria-live="polite"`, garantindo acesso mesmo sem suporte à Speech API

---

## 🤖 Chatbot LuminIA

Assistente virtual flutuante presente na home e nas subpáginas.

| Feature | Detalhe |
| --------- | --------- |
| **Interface** | Botões de opção (sem input de texto livre) |
| **Categorias** | Sobre a Fundação · Projetos e Atuação · Como Colaborar · Transparência · Contato |
| **Subcategorias** | Quem Somos, Missão, Equipe, Projetos, Capacitação, Eventos, Parcerias, Doação, Voluntariado, WhatsApp, Redes Sociais |
| **Contato** | O botão de formulário leva à página **Fale Conosco** |
| **Indicador de digitação** | Animação de 3 dots entre interações |
| **Rotas relativas** | Ajuste dinâmico de caminhos conforme a subpágina atual |
| **Encerramento** | Botão "Encerrar" fecha o chat automaticamente após 2 segundos |

---

## 🔒 Segurança — Firestore Rules

**Versão das regras:** `v1.9.0` · 10 coleções

| Coleção | Leitura | Escrita | Validações |
| --------- | --------- | --------- | ----------- |
| `admins/{uid}` | Próprio UID autenticado | Bloqueada (apenas Console) | — |
| `contacts/{id}` | Grau 1/4 | **Pública** (formulários) · gestão Grau 1/4 | nome string (pode ser vazio) · email regex · mensagem ≤ 4.000 chars · campo `read: bool` |
| `transparency_docs/{id}` | Pública | Grau 1/3 | nome ≤ 200 · link ≤ 500 · categoria enum (7 valores) |
| `news/{id}` | Pública | Grau 1/2 | título ≤ 300 · autor ≤ 100 · corpo ≤ 50.000 chars |
| `eventos/{id}` | Pública | Grau 1/5 | data YYYY-MM-DD · horário HH:MM · custo enum · descrição ≤ 10.000 chars |
| `projetos/{id}` | Pública | Grau 1/5 | título ≤ 300 · status enum (planning · active · deactive · course) · campos obrigatórios (ícone, área, público, objetivo, descrição) |
| `capacitacao/{id}` | Pública | Grau 1/5 | título ≤ 300 · descrição ≤ 5.000 · cor enum (red · fire · navy · green) · carga horária, nível, ícone e módulos obrigatórios |
| `timeline/{id}` | Pública | Grau 1/6 | ano ≤ 20 · tag ≤ 60 · título ≤ 200 · descrição ≤ 3.000 |
| `apoiadores/{id}` | Pública | Grau 1/6 | nome ≤ 200 · foto ≤ 500 · link opcional ≤ 500 |
| `site_stats/{id}` | **Pública** | Grau 1/6, **somente o documento `impacto`**; exclusão bloqueada | 4 números inteiros de 0 a 100.000.000 · `updatedAt` obrigatório · `updatedBy` opcional ≤ 120 · nenhum outro campo |

> O Grau `1` dá acesso a tudo. As regras da coleção `site_stats` (v1.9.0) **precisam ser publicadas** para a aba *Números* conseguir salvar.

**Funções auxiliares:**

| Função | Descrição |
| -------- | ----------- |
| `isSignedIn()` | Verifica autenticação ativa |
| `isAdmin()` | Verifica `admins/{uid}` sem varredura da coleção inteira |
| `myGraus()` / `hasGrau(g)` | Lê os graus do admin (assume `[1]` se o campo não existir) e verifica permissão; o Grau 1 passa em todas as verificações |
| `requiredString(field)` | Valida string não-vazia |
| `isValidContact()` | Validador do formulário público |
| `isValidTransparencyDoc()` | Validador com enum de categorias |
| `isValidNews()` | Validador de campos e limites de tamanho |
| `isValidEvento()` | Validador com enum de custo e formato de data/hora |
| `isValidProjeto()` · `isValidCapacitacao()` | Validadores dos módulos de Atuação |
| `isValidTimeline()` · `isValidApoiador()` | Validadores dos módulos de Edição |
| `isValidStats()` | Validador dos números de impacto |

---

## 📁 Estrutura de Arquivos

```
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

---

## ⚙️ Configuração e Deploy

### Pré-requisitos

- Projeto Firebase `fundacaofenix193` configurado (Auth + Firestore + Analytics)
- Conta Cloudinary com upload preset `ffenix193` (unsigned) e cloud name `darq3foje`
- Conta Cloudflare com o domínio `fenix193.org.br` e o Worker `fenix193` vinculado ao repositório GitHub
- Acesso às caixas de e-mail de destino (para ativar o FormSubmit — veja abaixo)

### Variáveis de configuração

Todas as configurações estão inline nos arquivos (sem `.env`):

| Arquivo | Constante | Finalidade |
| --------- | ----------- | ----------- |
| `assets/js/script.js` | `firebaseConfig` | Credenciais do projeto Firebase |
| `assets/js/search-core.js` | `FIREBASE_CONFIG` | Mesma configuração, usada pela busca (reaproveita a instância se já existir) |
| `akannihub.html` | `CLOUDINARY_CLOUD` / `CLOUDINARY_PRESET` | Upload de imagens das notícias |
| `akannihub.html` | `SUPPORT_EMAIL` | Destino dos chamados do Suporte Técnico |
| `pages/fale-conosco.html` | `FOUNDATION_EMAIL` | Destino das mensagens do Fale Conosco (altere também o e-mail exibido na coluna esquerda) |

### Deploy

```bash
# Deploy contínuo no Cloudflare (recomendado):
# 1. Workers e Pages → conectar o repositório GitHub ao Worker "fenix193"
#    (o nome deve ser igual ao campo "name" do wrangler.jsonc)
# 2. Build command: (vazio) — não há processo de build
# 3. Deploy command: npx wrangler deploy
# 4. Cada push na branch main publica o site automaticamente
# 5. Domínio: Worker → Settings → Domains & Routes → fenix193.org.br e www.fenix193.org.br

# Pré-visualização local:
npx wrangler dev

# Observação: o Worker usa as variáveis públicas de wrangler.jsonc ("vars").
# Teste local das rotas dinâmicas: http://localhost:8787/api/feed?source=cbmse

# Deploy manual (se necessário):
npx wrangler deploy

# Publicar regras do Firestore (v1.9.0):
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```


### Worker (rotas dinâmicas)

O site é estático, mas três endereços passam primeiro pelo Worker (`run_worker_first` no `wrangler.jsonc`):

| Rota | O que faz |
|---|---|
| `/api/feed?source=cbmse` ou `defesacivil` | Lê o RSS do CBMSE ou da Defesa Civil, converte para JSON e guarda em cache por alguns minutos. Só aceita as duas fontes da lista. |
| `/pages/noticia?id=ID` | Devolve a página da notícia com título, descrição, `canonical`, Open Graph e JSON-LD (`NewsArticle`) já preenchidos, lendo o documento no Firestore. Se algo falhar, entrega a página estática normal. |
| `/sitemap-noticias.xml` | Sitemap com as notícias publicadas (até 500, mais recentes primeiro). |

O widget "Segurança & Defesa Civil" usa `/api/feed` e só recorre aos proxies públicos antigos se o Worker estiver fora do ar. Títulos do feed entram como texto (nunca como HTML) e somente links `http(s)` são aceitos.

### Checklist pós-deploy da v1.5.0

1. **Publicar o `firestore.rules`** (v1.9.0). Sem isso, a aba *Números* falha com "Sem permissão".
2. **Ativar o FormSubmit** para cada e-mail de destino: no primeiro envio de cada formulário (Fale Conosco e Suporte Técnico), o serviço manda um e-mail de confirmação; clique no link. Até lá os chamados do Suporte exibem o aviso de falha (com o plano B por e-mail), e as mensagens do Fale Conosco ainda chegam ao AkanniHub pela cópia no Firestore.
3. **Preencher os números de impacto** em *AkanniHub → Edição → Números*. Até lá a home mostra "—".
4. **Substituir os links das redes sociais** (hoje `#`, marcados com `TODO` no header) pelas URLs oficiais.
5. Conferir o **telefone** e o **e-mail** exibidos na página Fale Conosco e na seção de contato da home.
6. Conferir que `fenix193.org.br` e `www.fenix193.org.br` estão em **Firebase → Authentication → Settings → Authorized domains** e, se as chaves de API tiverem restrição por referenciador, no Google Cloud Console.

### Adicionar um novo admin

```
Firebase Console → Firestore → coleção "admins"
Criar documento com ID = UID do usuário (Auth → Users)
Campos mínimos: { email: "admin@exemplo.com", name: "Nome", graus: [2, 3] }
# graus: 1 = tudo · 2 = Notícias · 3 = Transparência · 4 = Contatos
#        5 = Atuação · 6 = Edição (Linha do Tempo, Apoiadores, Números)
```

### Privacidade dos formulários

Os envios por e-mail (Fale Conosco e Suporte Técnico) passam pelo serviço de terceiros **FormSubmit**. Mensagens do Fale Conosco também são gravadas no Firestore, na coleção `contacts`, acessível somente a admins com grau 1 ou 4. Na opção de envio sem identificação, o site não coleta nome, e-mail nem telefone.

---

## 🏷 Versionamento

O projeto adota **Semantic Versioning (SemVer)**:

```
v1.5.0
│ │ └── Patch  — correções de bugs, ajustes de CSS, atualização de conteúdo
│ └──── Minor  — novas features, novos módulos, novas páginas
└────── Major  — mudança arquitetural significativa ou quebra de compatibilidade
```

### Histórico de marcos

| Versão | Marco |
| -------- | ------- |
| `v0.1.0` | Estrutura inicial: home, seções estáticas, Firebase config |
| `v0.5.0` | Subpáginas institucionais, dropdown nav, footer completo |
| `v0.8.0` | AkanniHub v1 (contatos, transparência, notícias), Firestore Rules v1.0 |
| `v1.0.0` | Módulo de eventos, chatbot LuminIA, busca global, hero news feed |
| `v1.1.0` | Firestore Rules v1.2.0, LGPD/cookies, headers de segurança na hospedagem (Vercel, na época) |
| `v1.2.0` | GitHub Issues template, carrossel de apoiadores marquee, PWA manifest |
| `v1.3.0` | README profissional, consolidação e auditoria da base de código |
| `v1.4.0` | Componente de Acessibilidade Audiovisual (WCAG 2.1 AA / eMAG), correção de bug de banner (CSS crítico x assíncrono) |
| **`v1.5.0`** | **Botão "Voltar ao topo", header em duas camadas, painel de acessibilidade ampliado (8 recursos), Suporte Técnico por formulário, página Fale Conosco, aba Números no AkanniHub, pesquisa global, Firestore Rules v1.9.0** |

---

## 🐛 Correções Recentes

**Alto contraste e Fundo claro deixavam o site "chapado"**

A primeira versão dos modos pintava todos os elementos com a mesma cor, apagando o hero, os botões coloridos e a separação entre cartões. Foi substituída pela **paleta inteligente** (veja [Acessibilidade](#-acessibilidade)): só o que tem fundo claro ou neutro é recolorido; imagens, degradês e cores da marca são preservados.

**Destaque de termos na busca desalinhava com `&`, `<` e `>`**

O destaque antigo calculava posições no texto normalizado e as aplicava ao texto já escapado. Agora os intervalos são calculados no texto original e cada trecho é escapado separadamente.

**Credenciais de suporte expostas no painel**

A aba Suporte Técnico exibia o e-mail e a "senha padrão" de uma conta de suporte. Foram removidos junto com o link para o GitHub Issues, e a aba virou um formulário.

**Formulário da home aceitava "denúncia anônima" no texto, mas as regras exigiam e-mail**

O formulário da home foi retirado. O Fale Conosco trata o envio sem identificação explicitamente (por e-mail e com cópia no Firestore usando um e-mail reservado `.invalid`).

**Banner de página some ~1s após o carregamento (CSS crítico x assíncrono)**

O projeto usa CSS crítico inline (renderização instantânea) + `pages.css` carregado de forma assíncrona (`media="print"` com swap no `onload`). Duas inconsistências entre essas camadas causavam o efeito de a imagem de fundo "piscar e sumir":

- `noticias.html`: a seção `.page-hero` não tinha nenhuma classe de variante (`--historia`, `--equipe` etc.). A imagem definida no CSS crítico (`bomb7.webp`) era sobrescrita pela regra genérica de `pages.css` (sem imagem) assim que este terminava de carregar. **Corrigido** com a nova classe/regra `.page-hero--noticias`.
- `index.html`: o CSS crítico do hero referenciava `bomb_2.webp` (nome inconsistente com o resto do projeto, que usa `bomb2.webp`). **Corrigido** para manter o mesmo nome de arquivo em todas as referências.

---

## 🚧 Pendências Conhecidas

| Item | Detalhe |
| ------ | --------- |
| **Redes sociais** | Os quatro links do header estão como `#` (e o rodapé como `?`). Falta informar as URLs oficiais |
| **Telefone** | A página Fale Conosco e a seção de contato da home ainda exibem `(79) XXXX-XXXX` |
| **E-mail da Fundação** | O rodapé exibe `contato@fenix193.org.br`, enquanto a seção de contato e o Fale Conosco usam `contato@fundacaofenix193.org.br`. Padronizar e ajustar a constante `FOUNDATION_EMAIL`. Atenção: o domínio `fenix193.org.br` ainda não recebe e-mail (os registros MX e SPF padrão do Cloudflare bloqueiam). Para usar endereços `@fenix193.org.br`, configurar o **Cloudflare Email Routing** |
| **Barra de busca duplicada na home** | Hero e header têm campo de pesquisa. Para manter só o do header, remova o bloco `#hero-search` do `index.html` (o `search.js` ignora o hero quando ele não existe) |
| **Menu mobile nas subpáginas** | O script de menu inline das subpáginas não trava a rolagem nem fecha o menu ao clicar num link, ao contrário do `script.js` da home. Candidato a unificação |
| **Notícias na busca** | A pesquisa cobre as 30 notícias mais recentes (limite herdado do `search.js` original; ajustável em `search-core.js`) |
| **Cores de fundo dinâmicas** | Um elemento que muda de cor depois da carga (ex.: aba ativa de um feed) mantém a classificação original no modo de alto contraste até o modo ser religado |

---

## 🚀 Roadmap — Próximas Atualizações

As sugestões abaixo foram derivadas da análise da base de código atual e representam evoluções naturais do sistema. Itens que já foram entregues na v1.5.0 foram removidos.

---

### 🔴 Alta Prioridade

#### `v1.5.1` — Preenchimento de Conteúdo Real

Etapa natural de um projeto em desenvolvimento: a estrutura e o funcionamento das páginas já estão prontos, faltando apenas a Fundação repassar as informações finais para publicação. Itens previstos:

- Preencher a linha do tempo em `nossa-historia.html` com os marcos reais da Fundação (pela aba *Linha do Tempo* do AkanniHub).
- Completar os cards de `capacitacao.html` com cursos reais (carga horária, nível, módulos).
- Substituir os cards de exemplo em `projetos.html` pelos projetos reais.
- Preencher os cards "Por que ser Parceiro" em `parcerias.html`.
- Atualizar telefone, CNPJ, e-mail e **links de redes sociais** em todo o site (veja [Pendências Conhecidas](#-pendências-conhecidas)).
- Informar os **números reais de impacto** pela aba *Números* do AkanniHub.

#### `v1.5.2` — Segurança: App Check

- Implementar **Firebase App Check** para bloquear requisições ao Firestore originárias de fora do domínio oficial.
- *(Concluído na v1.5.0: remoção das credenciais de suporte da tela do painel.)*

---

### 🟡 Média Prioridade

#### `v1.6.0` — Módulo de Doações com PIX

- Integrar gerador de **QR Code PIX** dinâmico (payload EMV + CRC16) na home e na página "Como Ajudar".
- Modal de doação com valores sugeridos e instrução de cópia do código.

#### `v1.6.1` — Notificações por E-mail com Mais Controle

- O envio atual usa o FormSubmit (sem servidor). Migrar para um **Cloudflare Worker** (função serverless) ou integração com **EmailJS / SendGrid** daria controle de remetente, modelo do e-mail e registro de envios, além de notificar os admins a cada nova mensagem no Fale Conosco.

#### `v1.7.0` — Módulo de Voluntários no AkanniHub

- Criar coleção `voluntarios` no Firestore.
- Formulário público de cadastro (nome, área de atuação, disponibilidade, contato).
- Seção de gestão no AkanniHub para visualizar, filtrar e excluir cadastros.
- Regras de segurança correspondentes (criação pública com validação, leitura restrita a admins).

#### `v1.7.1` — Evoluções da Pesquisa

- Índice de pesquisa pré-gerado (em vez de ler as páginas a cada sessão) e sugestões ao vivo também na barra do header.
- Coluna de **município** na tabela de *Contatos* do AkanniHub, aproveitando o campo já gravado pelo Fale Conosco.

---

### 🟢 Melhorias e Qualidade de Vida

#### `v1.8.0` — PWA Completa com Service Worker

- Implementar `sw.js` com estratégias de cache (Network First para Firestore, Cache First para assets).
- Suporte offline para páginas visitadas anteriormente.
- Prompt de instalação ("Adicionar à tela inicial") em Android e iOS.

#### `v1.8.1` — Auditoria de Acessibilidade (WCAG 2.1 AA)

- Auditoria completa com Lighthouse e axe DevTools sobre o painel de acessibilidade e as novas páginas.
- Revisar contraste de `var(--gray)` em fundos claros.
- Garantir `aria-live` em todas as áreas de conteúdo dinâmico.

#### `v1.9.0` — Tema Escuro Nativo

- Implementar `data-theme="dark"` via override de CSS Custom Properties, como tema de design (além do *Alto contraste* e do *Controle negativo*, que já existem no painel de acessibilidade).
- Toggle no header com persistência em `localStorage`.
- Os design tokens já estão centralizados em `style.css`, tornando esta evolução de baixa complexidade.

#### `v1.9.1` — Variáveis de Configuração em Ambiente Cloudflare

- Mover credenciais do Cloudinary para variáveis de ambiente (secrets) do Worker no Cloudflare.
- Criar um Worker mínimo para servir as credenciais ao frontend sem expô-las no código-fonte.

---

### 🔵 Longo Prazo / Exploratório

#### `v2.0.0` — Editor Rico de Notícias no AkanniHub

- Substituir o `<textarea>` plano por um editor **WYSIWYG** (Quill.js ou TipTap, sem build step).
- Suporte a listas, negrito, itálico, links e imagens embutidas no corpo das notícias.

#### `v2.0.0` — Galeria de Fotos/Eventos no Site

- Módulo de galeria fotográfica gerenciado pelo AkanniHub.
- Exibição pública com lightbox e agrupamento por evento.
- Upload de múltiplas imagens para Cloudinary com progresso.

#### `v2.0.0` — Integração com Redes Sociais

- Widget de últimas publicações do Instagram na home.
- Botão de compartilhamento nativo em cada notícia e evento.
- Metadados Open Graph completos por página para preview rico em WhatsApp e redes sociais.

---

## 👨‍💻 Créditos

<div align="center">

| | |
| -- | -- |
| **Desenvolvimento** | Geovani Santos — GeoCODE Programmer |
| **Portfólio** | [eusougeovani.vercel.app](https://eusougeovani.vercel.app) |
| **Suporte técnico** | (79) 9 8866-3905 |
| **Cliente** | Fundação Fênix 193 — Aracaju/SE |
| **Site** | [fenix193.org.br](https://fenix193.org.br) |

*Desenvolvido com ☕ por GeoCODE Programmer — 2025 / 2026*

</div>
