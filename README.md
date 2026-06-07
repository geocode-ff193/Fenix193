# Fundação Fênix 193 — Ecossistema Digital

> **Versão atual: `v1.3.0`** · Junho 2026

[![Deploy](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)](https://ff193.vercel.app)
[![Firebase](https://img.shields.io/badge/backend-Firebase-orange?logo=firebase)](https://firebase.google.com)
[![Vanilla JS](https://img.shields.io/badge/frontend-Vanilla%20JS-yellow?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/licença-Privada-red)](#)

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Stack Tecnológica](#stack-tecnológica)
4. [Estrutura de Arquivos](#estrutura-de-arquivos)
5. [Módulos e Funcionalidades](#módulos-e-funcionalidades)
   - [Site Público](#site-público)
   - [AkanniHub — Painel Administrativo](#akannihub--painel-administrativo)
   - [Firebase & Regras de Segurança](#firebase--regras-de-segurança)
6. [Segurança](#segurança)
7. [SEO & Performance](#seo--performance)
8. [Suporte Técnico](#suporte-técnico)
9. [Controle de Versão](#controle-de-versão)
10. [Roadmap — Recomendações de Atualização](#roadmap--recomendações-de-atualização)

---

## Visão Geral

O **Ecossistema Digital da Fundação Fênix 193** é um sistema web completo desenvolvido para a Fundação de Apoio ao Corpo de Bombeiros Militar de Sergipe (CBMSE). O projeto contempla dois ambientes integrados:

| Ambiente | URL | Público-alvo |
|---|---|---|
| **Site Institucional Público** | `ff193.vercel.app` | Sociedade, parceiros, imprensa |
| **AkanniHub (Painel Admin)** | `ff193.vercel.app/akannihub` | Administradores autorizados |

O sistema foi projetado com foco em **baixo custo de manutenção**, **alta performance**, **zero dependência de build tools** e **máxima acessibilidade** para os gestores da Fundação — que não necessitam de conhecimento técnico para operar o conteúdo do site.

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                   USUÁRIO / NAVEGADOR                   │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTPS
┌───────────────────▼─────────────────────────────────────┐
│              VERCEL (CDN + Hosting)                     │
│  cleanUrls · trailingSlash: false · 404 personalizado   │
│  Cache: assets (1 ano) · HTML (no-cache)                │
└───────────────────┬─────────────────────────────────────┘
                    │ Firebase SDK v9 (ESM CDN)
┌───────────────────▼─────────────────────────────────────┐
│            FIREBASE (Google Cloud)                      │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Firestore DB  │  │    Auth      │  │  Analytics  │ │
│  │  (5 coleções)  │  │  (Google     │  │  (LGPD opt- │ │
│  │                │  │   OAuth)     │  │   in)       │ │
│  └────────────────┘  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│           CLOUDINARY (Image CDN)                        │
│  Upload de imagens de capa para notícias                │
└─────────────────────────────────────────────────────────┘
```

> **Princípio arquitetural:** Nenhum bundler, nenhum framework, nenhum processo de build. Todo o código é HTML5/CSS3/JavaScript ES6+ puro, executado diretamente no navegador. O Firebase SDK é importado via CDN ESM.

---

## Stack Tecnológica

| Camada | Tecnologia | Versão / Detalhes |
|---|---|---|
| **Markup** | HTML5 semântico | ARIA, roles, landmarks |
| **Estilização** | CSS3 Vanilla | Custom Properties, Grid, Flexbox |
| **Interatividade** | JavaScript ES6+ | Modules, async/await, IntersectionObserver |
| **Banco de Dados** | Cloud Firestore | Firebase SDK v9 (ESM) |
| **Autenticação** | Firebase Auth | Google OAuth 2.0 |
| **Imagens** | Cloudinary | Upload via API REST, CDN entrega |
| **Hosting** | Vercel | CDN global, HTTPS automático |
| **Ícones** | Font Awesome 6.5 | CDN |
| **Tipografia** | Google Fonts | Barlow Condensed + Barlow |
| **Analytics** | Firebase Analytics | Opt-in via LGPD |
| **CI/CD** | Vercel Dashboard | Deploy manual via painel |
| **Suporte** | GitHub Issues | Template YAML customizado |

---

## Estrutura de Arquivos

```
ff193/
├── index.html                  # Página inicial (home)
├── 404.html                    # Página de erro personalizada
├── akannihub.html              # Painel administrativo (autenticado)
├── firestore.rules             # Regras de segurança do Firestore v1.2.0
├── vercel.json                 # Configuração de deploy, redirects e headers
├── site.webmanifest            # PWA manifest
├── robots.txt                  # Diretivas para crawlers
├── sitemap.xml                 # Mapa do site para SEO
│
├── pages/                      # Subpáginas públicas
│   ├── nossa-historia.html
│   ├── missao-valores.html
│   ├── equipe.html
│   ├── projetos.html
│   ├── capacitacao.html
│   ├── eventos.html
│   ├── parcerias.html
│   ├── noticias.html
│   └── transparencia.html
│
├── assets/
│   ├── css/
│   │   ├── style.css           # Design system global (variáveis, layout, componentes)
│   │   ├── dropdown.css        # Menu dropdown desktop/mobile
│   │   ├── pages.css           # Estilos compartilhados entre subpáginas
│   │   ├── noticias.css        # Estilos da página de notícias e modal
│   │   ├── chatbot.css         # Estilos do chatbot flutuante LuminIA
│   │   └── 404.css             # Animação da página de erro
│   │
│   ├── js/
│   │   ├── script.js           # Lógica principal: menu, notícias, formulário de contato
│   │   ├── search.js           # Motor de busca hero (estático + Firestore)
│   │   └── chatbot.js          # Chatbot LuminIA (assistente virtual)
│   │
│   ├── img/                    # Imagens estáticas (logos, fotos institucionais)
│   └── ui/                     # Favicons e ícones PWA
│
└── .github/
    └── ISSUE_TEMPLATE/
        └── solicitacao_cliente.yml  # Template de chamado de suporte para clientes
```

---

## Módulos e Funcionalidades

### Site Público

#### Hero & Busca Global
- Campo de busca com **dropdown inteligente** de resultados em tempo real.
- Índice **estático** (15 páginas/seções do site) combinado com índice **dinâmico** (notícias e documentos de transparência carregados do Firestore).
- Highlight das palavras-chave buscadas nos resultados.
- Navegação por teclado completa (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`).
- Feed de **últimas 3 notícias** em grid 3×1 diretamente no hero, carregado do Firestore.

#### Navegação
- Header fixo com **menu hamburger** responsivo para mobile.
- **Dropdowns** com suporte a hover (desktop) e clique (mobile) via CSS + JS.
- Fechamento automático ao clicar fora ou pressionar `Esc`.

#### Seções da Home
| Seção | Descrição |
|---|---|
| Quem Somos | Carrossel automático de 4 imagens com autoplay, dots e botões prev/next |
| Números que Impactam | Contadores animados ativados por IntersectionObserver |
| Áreas de Atuação | Grid de 4 cards com ícones |
| Projetos em Destaque | 3 cards visíveis + "ver mais" com toggle animado |
| Como Ajudar | 3 formas de colaboração (Doação, Parceria, Voluntariado) |
| Últimas Notícias | 2 cards carregados dinamicamente do Firestore |
| Instituidores & Apoiadores | Carrossel marquee animado (ativa somente com ≥ 5 cards) |
| Formulário de Contato | Envio para coleção `contacts` no Firestore com validação |
| Banner de Cookies (LGPD) | Consentimento opt-in para Firebase Analytics |

#### Subpáginas Institucionais
- **Nossa História** — Linha do tempo vertical com cards alternados.
- **Missão e Valores** — Cards MVV + grid de 5 valores detalhados.
- **Equipe** — Organograma com 4 conselhos (Honra, Curadores, Executivo, Fiscal) com fotos reais.
- **Transparência** — Portal dinâmico com documentos agrupados por categoria, carregados do Firestore.
- **Projetos** — Grid com filtros por status (Planejamento / Andamento / Finalizado / Curso) + modal de detalhe.
- **Capacitação** — Catálogo de cursos com conteúdo programático e processo de inscrição.
- **Eventos** — Feed dinâmico do Firestore com separação automática entre "Próximos" e "Realizados".
- **Parcerias** — Grid de logos + processo de parceria em 5 etapas.
- **Notícias** — Grid paginado (9 por página) com `startAfter`, modal de leitura completa e compartilhamento via WhatsApp / Clipboard.

#### Chatbot LuminIA
Assistente virtual flutuante com árvore de navegação guiada:
- Menus interativos de botões (sem input de texto livre).
- Cobre 5 categorias principais: Sobre, Atuação, Como Ajudar, Transparência e Contato.
- Indicador de digitação animado entre interações.
- Caminhos de contato rápido (WhatsApp, formulário, redes sociais).
- Compatível com subpáginas (ajuste dinâmico de caminhos relativos).

#### 404 Personalizada
- Animação CSS de gradiente de fogo no número "404".
- Botão de retorno à home.

---

### AkanniHub — Painel Administrativo

Painel de gestão de conteúdo acessível em `/akannihub`, protegido por autenticação Google OAuth com verificação de permissão em coleção `admins` no Firestore.

#### Autenticação & Controle de Acesso
- Login exclusivo via **Google Sign-In** (popup).
- Verificação de UID contra coleção `admins` no Firestore após autenticação.
- Contas não autorizadas são imediatamente desconectadas com mensagem explicativa.
- Avatar e nome do usuário exibidos na topbar após login.

#### Dashboard
- 3 cards de estatísticas em tempo real: total de mensagens, documentos e notícias publicadas.
- Badge de contagem de mensagens não lidas no item do menu lateral.
- Acesso rápido para as principais ações.

#### Módulo: Contatos
- Tabela com todas as mensagens recebidas pelo formulário público.
- Colunas: Nome, E-mail, Assunto (badge colorido), Mensagem (truncada), Data.
- **Ações por linha:** Visualizar detalhe (modal), abrir WhatsApp (mensagem pré-preenchida), abrir cliente de e-mail, excluir com confirmação.
- Botão de atualização manual.
- Modal de detalhe com exibição completa da mensagem.

#### Módulo: Transparência
- Formulário de publicação: Nome do arquivo, link (Google Drive), Categoria.
- 7 categorias disponíveis: Prestação de Contas, Relatórios Institucionais, Estatuto Social, Certidões, Contratos, Editais, Atas.
- Lista de documentos publicados com ícone por categoria, data e ações (abrir link, excluir).

#### Módulo: Notícias
- Formulário de criação/edição: Título, Autor, Texto, Imagem de Capa.
- Upload de imagem diretamente para o **Cloudinary** com barra de progresso e preview em tempo real.
- Suporte a drag-and-drop na zona de upload.
- Modo de edição inline (preenche o formulário com dados existentes).
- Lista de notícias publicadas com thumbnail, título, autor, data e ações (editar, excluir).

#### Módulo: Eventos
- Formulário completo: Título, Data (date picker), Horário, Local, Custo (Gratuito/Pago), Link de Inscrição (opcional), Descrição.
- Lista de eventos com bloco de data visual (gradiente vermelho = futuro, navy = passado), badge de status e ações.
- Edição inline e exclusão com confirmação.

#### Módulo: Suporte Técnico
- Link direto para abertura de chamado no GitHub Issues via template YAML customizado.
- Credenciais de acesso ao GitHub de suporte exibidas no painel.

#### UX do Painel
- Sidebar com navegação entre seções (SPA-like via classes CSS).
- Modal global de confirmação de exclusão reutilizável.
- Sistema de toasts (success/error/default) com auto-dismiss em 4 segundos.
- Layout totalmente responsivo com sidebar colapsável em mobile.

---

### Firebase & Regras de Segurança

**Projeto Firebase:** `fundacaofenix193`

#### Coleções Firestore

| Coleção | Leitura | Escrita | Validações |
|---|---|---|---|
| `admins` | Próprio UID autenticado | Bloqueada (apenas Console) | — |
| `contacts` | Apenas admins | Pública (formulário) | nome, email (regex), mensagem ≤ 4000 chars |
| `transparency_docs` | Pública | Apenas admins | nome ≤ 200, link ≤ 500, categoria válida (enum) |
| `news` | Pública | Apenas admins | título ≤ 300, autor ≤ 100, corpo ≤ 50.000 chars |
| `eventos` | Pública | Apenas admins | data YYYY-MM-DD, horário HH:MM, custo enum, descrição ≤ 10.000 chars |

#### Funções auxiliares das Regras (v1.2.0)
- `isSignedIn()` — Verifica autenticação ativa.
- `isAdmin()` — Verifica existência do documento `admins/{uid}` (sem varredura da coleção inteira).
- `requiredString(field)` — Valida string não vazia.
- Validadores específicos por coleção: `isValidContact()`, `isValidTransparencyDoc()`, `isValidNews()`, `isValidEvento()`.

---

## Segurança

| Medida | Implementação |
|---|---|
| Autenticação admin | Google OAuth + whitelist por UID no Firestore |
| Regras Firestore | Validação de tipos, tamanhos e enums no lado do servidor |
| XSS | `escHtml()` aplicado em todo conteúdo dinâmico inserido via `innerHTML` |
| Headers HTTP | `X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy` via `vercel.json` |
| LGPD | Firebase Analytics desativado por padrão; opt-in via banner de cookies |
| Acesso ao painel | Verificação dupla: Firebase Auth + documento `admins/{uid}` no Firestore |
| 404 custom | Erros de rota tratados sem exposição de estrutura interna |

---

## SEO & Performance

- **`sitemap.xml`** completo com todas as páginas públicas e prioridades definidas.
- **`robots.txt`** com referência ao sitemap.
- `cleanUrls: true` no Vercel (URLs sem `.html`).
- Meta tags `description` customizadas por página.
- `<link rel="manifest">` para suporte PWA.
- `theme-color` definido para mobile browsers.
- Imagens com `loading="lazy"` e `alt` descritivos.
- Cache agressivo para assets estáticos (1 ano) e zero cache para HTML (always fresh).
- Scroll Reveal via `IntersectionObserver` para animações sem impacto na thread principal.

---

## Suporte Técnico

Chamados de suporte são gerenciados via **GitHub Issues** com template YAML estruturado (`.github/ISSUE_TEMPLATE/solicitacao_cliente.yml`), cobrindo:

- Identificação do cliente e contato.
- Tipo de solicitação (erro, urgência, ajuste, nova feature, acesso, dúvida).
- Nível de urgência (🟢 Pode aguardar → 🆘 Crítico).
- Local de ocorrência (URL ou descrição).
- Descrição do problema e comportamento esperado.
- Passo a passo de reprodução.
- Dispositivo e navegador.
- Checklist de confirmação antes do envio.

**Contato direto de suporte:** `geocode.ff193@gmail.com`  
**WhatsApp de suporte:** `(79) 9 8866-3905`

---

## Controle de Versão

### Histórico de Versões

| Versão | Data | Destaques |
|---|---|---|
| `v0.1.0` | 2025 Q3 | Estrutura inicial: home, seções estáticas, Firebase config |
| `v0.5.0` | 2025 Q4 | Subpáginas institucionais, dropdown nav, footer completo |
| `v0.8.0` | 2026 Q1 | AkanniHub v1 (contatos, transparência, notícias), Firestore Rules v1.0 |
| `v1.0.0` | 2026 Q2 | Módulo de eventos, chatbot LuminIA, busca global, hero news feed |
| `v1.1.0` | 2026 Q2 | Regras Firestore v1.2.0, LGPD/cookies, vercel.json com headers de segurança |
| `v1.2.0` | 2026 Q2 | GitHub Issues template, carrossel de apoiadores, PWA manifest |
| **`v1.3.0`** | **2026 Jun** | **README profissional, consolidação e auditoria da base de código** |

### Critérios de Versionamento Semântico
- **MAJOR** (`2.x.x`) — Mudança de plataforma, reestruturação completa ou quebra de compatibilidade.
- **MINOR** (`x.1.x`) — Novo módulo, nova página ou nova funcionalidade significativa.
- **PATCH** (`x.x.1`) — Correção de bug, ajuste visual, atualização de texto ou conteúdo.

---

## Roadmap — Recomendações de Atualização

As sugestões abaixo estão ordenadas por impacto estimado e complexidade de implementação.

---

### 🔴 Alta Prioridade

#### `v1.4.0` — Preenchimento de Conteúdo Real
> Várias páginas contêm placeholders (`DESCRIÇÃO`, `TÍTULO`, `TAGS`, `ANO`).

- Preencher a linha do tempo em `nossa-historia.html` com os marcos reais da Fundação.
- Completar os cards da página `capacitacao.html` com os cursos reais (carga horária, nível, módulos).
- Substituir os cards placeholder em `projetos.html` pelos projetos reais com descrições completas.
- Preencher os cards "Por que ser Parceiro" em `parcerias.html`.
- Atualizar os dados de contato (telefone, CNPJ) no footer e na página de contato.
- Atualizar os links das redes sociais (atualmente apontam para `?`).
- Atualizar os contadores de impacto (`data-target="0"`) com os números reais.

#### `v1.4.1` — Dados Sensíveis & Segurança
> A chave de API do Firebase (`apiKey`) está exposta no código-fonte do frontend. Isso é padrão para o Firebase Web SDK, mas as Firestore Security Rules são a linha de defesa real.

- **Revisar e testar as Firestore Rules** em ambiente de staging antes de qualquer alteração.
- Considerar adicionar **App Check** (Firebase) para bloquear acessos não originados do domínio oficial.
- Remover as credenciais de suporte (email/senha) da seção de Suporte Técnico no AkanniHub; substituir por link direto sem exibir credenciais em tela.

---

### 🟡 Média Prioridade

#### `v1.5.0` — Módulo de Doações
- Integrar gerador de **QR Code PIX** dinâmico para doações diretamente na home e na página "Como Ajudar".
- Adicionar campo de valor sugerido e modal de confirmação de doação.

#### `v1.5.1` — Notificações por E-mail
- Implementar **Vercel Serverless Function** (ou Firebase Cloud Function) para enviar e-mail automático aos admins quando um novo contato é recebido via formulário.
- Possibilidade de usar **EmailJS** ou **SendGrid** sem necessidade de servidor dedicado.

#### `v1.6.0` — Módulo de Voluntários no Painel
- Criar coleção `voluntarios` no Firestore.
- Formulário público de cadastro de voluntários (nome, área de atuação, disponibilidade, contato).
- Seção no AkanniHub para visualizar e gerenciar os cadastros.

#### `v1.6.1` — Estatísticas Reais no Dashboard
- Substituir os `data-target="0"` por valores gerenciáveis: criar coleção `stats` no Firestore editável pelo painel.
- Adicionar card de estatísticas no AkanniHub para editar os números de impacto.

---

### 🟢 Baixa Prioridade / Melhorias Futuras

#### `v1.7.0` — PWA Completa
- Implementar `sw.js` (Service Worker) para funcionamento offline.
- Configurar estratégias de cache (Network First para dados do Firestore, Cache First para assets).
- Adicionar prompt de instalação ("Adicionar à tela inicial").

#### `v1.7.1` — Acessibilidade Avançada (WCAG 2.1 AA)
- Auditoria completa com Lighthouse e axe DevTools.
- Melhorar contraste em elementos com `var(--gray)` sobre fundos claros.
- Adicionar `skip navigation` link no topo de todas as páginas.
- Verificar todos os `aria-label` em elementos interativos.

#### `v1.8.0` — Multilíngue (PT/EN)
- Estrutura `i18n` simples via objeto JS para suporte a inglês.
- Útil para atração de parcerias e doadores internacionais.

#### `v1.8.1` — Modo Escuro
- Implementar `data-theme="dark"` via CSS Custom Properties.
- Toggle no header com persistência em `localStorage`.

#### `v2.0.0` — Redesign do AkanniHub com Editor Rico
- Substituir o `<textarea>` plano do módulo de notícias por um **editor WYSIWYG** (ex: Quill.js ou TipTap) para formatação de texto rico.
- Suporte a listas, negrito, links e imagens embutidas no corpo das notícias.

---

## Créditos

Desenvolvido com ☕ por **[GeoCODE Programmer](https://eusougeovani.vercel.app)** — Geovani Santos  
Aracaju, Sergipe — Brasil

---

*Este documento reflete o estado do sistema em Junho de 2026. Para dúvidas técnicas, abra um chamado via [GitHub Issues](https://github.com/eusougeovani/FF193/issues/new?template=solicitacao_cliente.yml).*
