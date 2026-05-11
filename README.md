<div align="center">

<img src="assets/img/ff193_transp.png" alt="Fundação Fênix 193" width="130" />

# Fundação Fênix 193

### Projeto Web FF193 — Site Institucional + SaaS AkanniHub

<br/>

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Firebase](https://img.shields.io/badge/Firebase-FFA611?style=flat-square&logo=firebase&logoColor=white)](https://firebase.google.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![Versão](https://img.shields.io/badge/AkanniHub-v1.1.2-brightgreen?style=flat-square)](#)
[![Licença](https://img.shields.io/badge/licença-sob_encomenda-red?style=flat-square)](#-licença)

<br/>

> Plataforma web completa desenvolvida para a **Fundação Fênix 193**, organização sem fins lucrativos de apoio ao Corpo de Bombeiros Militar de Sergipe (CBMSE) e à Proteção e Defesa Civil. Combina um site institucional moderno com um sistema de gestão web (SaaS) integrado ao Firebase em tempo real.

<br/>

[🌐 Site Institucional](#-site-institucional-indexhtml) · [🖥️ SaaS AkanniHub](#-saas-akannihub-akannihubhtml) · [📁 Transparência](#-portal-de-transparência-institucional/transparenciahtml) · [📰 Notícias](#-notícias-atuacaonotiiciashtml) · [👥 Equipe](#-equipe-institucionalequipehtml)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Estrutura de Arquivos](#-estrutura-de-arquivos)
- [Funcionalidades](#-funcionalidades)
  - [Site Institucional](#-site-institucional-indexhtml)
  - [SaaS AkanniHub](#-saas-akannihub-akannihubhtml)
  - [Páginas Institucionais](#-páginas-institucionais)
  - [Páginas de Atuação](#-páginas-de-atuação)
- [Tecnologias](#-tecnologias)
- [Banco de Dados (Firestore)](#-banco-de-dados-firestore)
- [Segurança e Regras Firestore](#-segurança-e-regras-firestore)
- [Design System](#-design-system)
- [Como Configurar](#️-como-configurar)
- [SEO e Deploy](#-seo-e-deploy)
- [GitHub Issues](#-github-issues)
- [Próximas Funcionalidades](#-próximas-funcionalidades)
- [Desenvolvedor](#-desenvolvedor)
- [Licença](#-licença)

---

## 💡 Sobre o Projeto

A **Fundação Fênix 193** é uma organização sem fins lucrativos criada para apoiar, valorizar e fortalecer as ações do Corpo de Bombeiros Militar de Sergipe e da Proteção e Defesa Civil.

Este projeto entrega dois produtos integrados em um único repositório:

- **Site institucional público** — landing page multi-seção com notícias dinâmicas, busca em tempo real, formulário de contato e portal de transparência.
- **AkanniHub (SaaS)** — painel administrativo restrito com autenticação Google, gestão de contatos, publicação de notícias com upload de imagens via Cloudinary e gerenciamento de documentos de transparência.

**Principais diferenciais:**

- Arquitetura 100% serverless — sem backend próprio, sem Node.js em produção
- Autenticação e banco de dados gerenciados pelo Firebase (plano Spark gratuito)
- Segurança implementada exclusivamente via Firestore Security Rules
- Upload de imagens sem Firebase Storage — integração direta com Cloudinary
- PWA instalável com manifesto e tema configurado
- Busca no hero com índice estático + dados dinâmicos do Firestore
- Sistema de notificação de novas mensagens com badge em tempo real
- Design System coeso com CSS Variables, responsivo e acessível
- Deploy automatizado na Vercel com `cleanUrls`, cache agressivo e redirecionamento 404

---

## 📁 Estrutura de Arquivos

```
/
├── index.html                      # Landing page institucional (10 seções)
├── akannihub.html                  # SaaS — painel administrativo restrito
├── 404.html                        # Página de erro 404 com animação de fogo
│
├── robots.txt                      # Configuração de rastreamento para crawlers
├── sitemap.xml                     # Sitemap com 13 URLs indexadas
├── site.webmanifest                # Manifesto PWA (nome, ícones, tema)
├── vercel.json                     # Configurações de deploy, cache e headers
├── firestore.rules                 # Regras de segurança do Firestore
│
├── assets/
│   ├── css/
│   │   ├── style.css               # Design System principal (variáveis, layout, todos componentes)
│   │   ├── dropdown.css            # Estilos do menu dropdown (desktop hover + mobile toggle)
│   │   ├── noticias.css            # Estilos da página de notícias (cards, modal, paginação)
│   │   ├── search.css              # Estilos do hero search (dropdown, highlights, badges)
│   │   └── 404.css                 # Estilos da página 404 (animação "burn")
│   ├── js/
│   │   ├── script.js               # Lógica principal (Firebase init, menu, contadores, notícias home, form)
│   │   └── search.js               # Módulo isolado de busca (índice estático + Firestore cache)
│   ├── img/                        # Imagens do site e fotos dos membros dos conselhos
│   ├── akanni/                     # Assets exclusivos do AkanniHub (favicon, manifesto)
│   └── ui/                         # Assets de UI globais (favicons, apple-touch-icon)
│
├── institucional/
│   ├── nossa-historia.html         # Timeline da fundação e pilares fundadores
│   ├── missao-valores.html         # Missão, Visão e Valores (cards MVV + lista detalhada)
│   ├── equipe.html                 # Estrutura organizacional (4 conselhos com fotos reais)
│   └── transparencia.html          # Portal público de transparência (docs do Firestore)
│
└── atuacao/
    ├── projetos.html               # Catálogo de projetos com filtros e modal de detalhes
    ├── capacitacao.html            # Catálogo de cursos e treinamentos com processo de inscrição
    ├── eventos.html                # Eventos (abas "Próximos" e "Realizados" com modal)
    ├── parcerias.html              # Página de parcerias com processo de adesão em 5 passos
    └── noticias.html               # Blog paginado com modal de leitura e compartilhamento

.github/
└── ISSUE_TEMPLATE/
    └── solicitacao_cliente.yml     # Template de chamados para clientes (GitHub Issues)
```

---

## ✨ Funcionalidades

### 🌐 Site Institucional (`index.html`)

Landing page multi-seção, responsiva e com animações de scroll reveal:

- **Header sticky** com sombra dinâmica ao rolar, logo, nav com dropdowns e botão CTA
- **Menu mobile** com hamburger animado, overlay dark e dropdowns por clique
- **Hero Search** — campo de busca com dropdown de resultados dinâmicos:
  - Índice estático de 16 páginas/âncoras do site (sem consulta extra ao Firebase)
  - Cache de notícias e documentos carregados do Firestore em background (limite 30 notícias + todos os docs)
  - Highlight da query nos resultados, agrupamento por categoria, navegação por teclado (↑↓ Enter Esc)
  - Badges coloridos por tipo (Página, Atuação, Notícia, Documento, Contato)
  - Debounce de 300ms, normalização de acentos, busca case-insensitive
- **Quem Somos** — texto institucional com botão de link para página completa e embema visual
- **Números que Impactam** — contadores animados com easing cubic, acionados por IntersectionObserver
- **Áreas de Atuação** — grid de 4 cards com ícones e hover com barra colorida
- **Projetos em Destaque** — grid com 3 cards visíveis e toggle "Ver todos" para exibir mais 5
- **Como Ajudar** — 3 cards de modalidade (Doações, Parcerias, Voluntariado) com listas de benefícios
- **Últimas Notícias** — carrega as 2 mais recentes do Firestore com skeleton loader durante o fetch
- **Formulário de Contato** — salva na coleção `contacts` com campos de nome, e-mail, WhatsApp, assunto e mensagem; suporte a envio anônimo; feedback de sucesso/erro
- **Footer** com 4 colunas (Brand + Institucional + Atuação + Admin), redes sociais, CNPJ e créditos
- **PWA** — Web Manifest vinculado com ícones maskable
- **Botão "Voltar ao Topo"** com visibilidade dinâmica ao scroll
- **Scroll Reveal** em todos os blocos via IntersectionObserver (sem biblioteca externa)
- **Ano dinâmico** no rodapé via JavaScript

---

### 🖥️ SaaS AkanniHub (`akannihub.html`)

Painel administrativo completo em single-file, sem build step.

#### 🔐 Autenticação

- Login exclusivo via Google (Firebase Auth + `signInWithPopup`)
- Verificação de autorização por `getDoc(doc(db, 'admins', user.uid))` — lê apenas o documento do próprio UID (alinhado com as Firestore Rules)
- Conta Google não listada em `admins/` recebe mensagem de acesso não autorizado e é deslogada imediatamente
- Avatar e nome do usuário exibidos na topbar após autenticação
- Botão de logout disponível na topbar e na tela de login (link para voltar ao site)

#### ⏲️ Dashboard

- 3 cards de estatísticas em tempo real: total de Mensagens, Documentos de Transparência e Notícias
- Painel de "Acesso Rápido" com botões de atalho para as seções de Contatos, Transparência e Notícias
- Dados carregados em paralelo com `Promise.all` ao entrar no painel

#### ✉️ Contatos

- Tabela completa com colunas: Nome, E-mail, Assunto (tag), Mensagem (truncada), Data e Ações
- Badge numérico na sidebar indicando mensagens não lidas (`read: false`)
- Modal de detalhe com todos os campos, incluindo telefone quando disponível
- Ação **WhatsApp**: abre `wa.me` com mensagem pré-preenchida de retorno da Fundação
- Ação **E-mail**: abre cliente de e-mail com `mailto:` com assunto e corpo pré-preenchidos
- Ação **Excluir**: modal de confirmação antes da deleção permanente
- Botão de atualizar manualmente a lista
- Ocultação de colunas secundárias no mobile para melhor usabilidade

#### 📁 Transparência

- Formulário de publicação com campos: Nome do arquivo, Link (Google Drive), Categoria
- 7 categorias disponíveis: Prestação de Contas, Relatórios Institucionais, Estatuto Social, Certidões, Contratos, Editais, Atas
- Lista de documentos publicados com ícone por categoria, data de publicação, botão de abrir e botão de excluir
- Modal de confirmação antes de excluir qualquer documento

#### 📰 Notícias

- Formulário de criação com campos: Título, Autor, Texto (textarea), Imagem de Capa
- Upload de imagem com drag-and-drop na upload zone ou clique para selecionar
- Preview da imagem antes do envio
- Barra de progresso visual durante o upload para o Cloudinary
- URL da imagem salva via CDN Cloudinary (`secure_url`) no Firestore
- Formulário de edição in-place (reutiliza o mesmo form com estado de edição)
- Lista de notícias publicadas com thumbnail (ou placeholder), título, autor, data e ações
- Botões de editar e excluir por notícia
- Botão "Cancelar" visível apenas no modo de edição

#### 🎨 UX do Painel

- Layout com topbar fixa + sidebar fixa + área de conteúdo com scroll independente
- Sidebar com toggle mobile (botão hamburguer na topbar)
- Navegação por seções (Dashboard, Contatos, Transparência, Notícias) sem reload de página
- Sistema de Toast notifications (sucesso, erro, default) com auto-remoção em 4s
- Modal de confirmação de exclusão reutilizável (callback dinâmico)
- Spinners de loading nos estados de carregamento
- Empty states com ícones e mensagens contextuais
- Escape para fechar modais, click fora da área do modal fecha também

---

### 📑 Páginas Institucionais

#### Nossa História (`institucional/nossa-historia.html`)

- Texto introdutório
- Timeline alternada (esquerda/direita) com cards de eventos, ícones e anos em watermark
- Responsivo: timeline colapsa para coluna única no mobile
- Grid de "Pilares que nos Fundamentam" (4 cards com ícones)
- CTA final com links para "Como Ajudar" e "Equipe"

#### Missão e Valores (`institucional/missao-valores.html`)

- 3 cards MVV com gradientes distintos (vermelho, navy, laranja-fogo) e ícones grandes
- Seção "Valores em Detalhe" com grid de cards com borda esquerda colorida
- CTA final com links para Projetos e Transparência

#### Equipe (`institucional/equipe.html`)

- 4 conselhos com fotos reais dos membros:
  - **Presidente de Honra** — card centralizado com destaque
  - **Conselho de Curadores** — 5 membros (Presidente + Secretário + 3 membros)
  - **Conselho Executivo** — 3 membros (Diretor-Presidente, Administrativo, Financeiro)
  - **Conselho Fiscal** — 4 membros (Presidente + 2 membros + Suplente)
- Fotos reais dos membros (imagens em `/assets/img/`)
- Cards com badge de cargo, hover com barra superior animada
- Destaque visual (gradiente vermelho) para presidentes de cada conselho

#### Transparência (`institucional/transparencia.html`)

- Banner de "Compromisso com a Transparência"
- Carrega todos os documentos da coleção `transparency_docs` do Firestore
- Agrupa automaticamente por categoria seguindo ordem predefinida
- Cada categoria exibe: ícone, label, título e contador de documentos
- Cards de documento com nome, data, ícone da categoria e seta de acesso
- Link abre o documento do Google Drive em nova aba
- Scroll Reveal nos grupos de categorias carregados dinamicamente
- CTA para contato caso o documento desejado não esteja listado

---

### 🎯 Páginas de Atuação

#### Projetos (`atuacao/projetos.html`)

- Barra de filtros por status: Todos, Em Planejamento, Em Andamento, Cursos
- Contador dinâmico de projetos visíveis
- Grid de cards com cor de destaque por área, tag de status, descrição e botão de detalhes
- Modal de detalhes com ícone, título, status, área, público-alvo e objetivo principal
- CTA "Tem uma Ideia de Projeto?" com links para contato e parcerias

#### Capacitação (`atuacao/capacitacao.html`)

- Strip de 5 diferenciais dos cursos (navy background)
- Cards de curso com aside colorido (ícone, carga horária, nível) e corpo (título, descrição, conteúdo programático em grid 2 colunas, badges de informações)
- "Como Funciona a Inscrição" — processo em 5 passos com linha de progresso decorativa
- CTA de treinamento in company

#### Eventos (`atuacao/eventos.html`)

- Tabs "Próximos Eventos" e "Eventos Realizados" com navegação por atributos ARIA
- Estado inicial "Em Breve" com CTA de contato (quando não há eventos agendados)
- Estrutura pronta para card de evento destaque (featured) e grid de eventos menores
- Modal de detalhe de evento com data, título, descrição, horário, local, vagas e investimento
- Comentários no HTML com template de evento para descomenter quando houver dados reais

#### Parcerias (`atuacao/parcerias.html`)

- Grid "Por que ser Parceiro?" com 4 cards de motivação
- Processo de adesão em 5 passos com linha de progresso
- Grid de logos de parceiros (slots placeholder para substituição por logos reais)
- CTA final com links para contato e transparência

#### Notícias (`atuacao/noticias.html`)

- Carregamento paginado: 9 notícias por página via `startAfter` do Firestore
- Primeiro card com layout `featured` (destaque horizontal em grid)
- Contagem dinâmica "Exibindo X de Y notícias"
- Botão "Carregar mais notícias" com spinner durante o fetch
- Modal de leitura completa com imagem, meta, título, corpo e opções de compartilhamento
- Compartilhamento via WhatsApp (link com título da notícia) e Copiar Link (com feedback "Copiado!")
- URL com parâmetro `?noticia={id}` para deep link direto para uma notícia
- Scroll Reveal dinâmico aplicado nos novos cards a cada carregamento

---

## 🛠️ Tecnologias

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | HTML5, CSS3, JavaScript Vanilla (ES6+ Modules) | — |
| Autenticação | Firebase Authentication (Google Sign-In) | 9.15.0 |
| Banco de Dados | Firebase Firestore (NoSQL, tempo real) | 9.15.0 |
| Analytics | Firebase Analytics | 9.15.0 |
| Upload de Imagens | Cloudinary (upload direto via API REST) | — |
| Segurança | Firestore Security Rules | rules_version 2 |
| Ícones | Font Awesome | 6.5.0 |
| Tipografia (Site) | Barlow Condensed + Barlow | Google Fonts |
| Tipografia (404) | Playfair Display + Lato | Google Fonts |
| Progressive Web App | Web Manifest (sem Service Worker ativo) | — |
| Hospedagem | Vercel (cleanUrls + cache headers + 404 redirect) | — |

> Todos os módulos Firebase são carregados via CDN ESM (`gstatic.com`). Nenhum bundler ou etapa de build é necessária.

---

## 🗄️ Banco de Dados (Firestore)

```
Firestore (fundacaofenix193)
│
├── admins/
│   └── {uid}                    # ID = UID do Firebase Auth
│       ├── email: string
│       └── name: string         # (opcional, campos livres)
│
├── contacts/
│   └── {docId}
│       ├── nome: string
│       ├── email: string
│       ├── telefone: string     # (opcional)
│       ├── assunto: string
│       ├── mensagem: string
│       ├── read: boolean        # false = não lido (badge na sidebar)
│       └── createdAt: timestamp
│
├── transparency_docs/
│   └── {docId}
│       ├── nome: string
│       ├── link: string         # URL pública do Google Drive
│       ├── categoria: string    # Ver categorias válidas abaixo
│       └── createdAt: timestamp
│
└── news/
    └── {docId}
        ├── titulo: string
        ├── autor: string
        ├── corpo: string
        ├── imagemUrl: string    # URL do Cloudinary (null se sem imagem)
        ├── createdAt: timestamp
        └── updatedAt: timestamp # (presente apenas em edições)
```

**Categorias válidas para `transparency_docs`:**
`Prestação de Contas` · `Relatórios Institucionais` · `Estatuto Social` · `Certidões` · `Contratos` · `Editais` · `Atas`

---

## 🔐 Segurança e Regras Firestore

O sistema opera inteiramente no **plano Spark (gratuito)** sem Cloud Functions. A segurança é garantida por Firestore Security Rules em camadas.

### Funções auxiliares implementadas

| Função | Descrição |
|---|---|
| `isSignedIn()` | Verifica se `request.auth != null` |
| `isAdmin()` | Verifica se `isSignedIn()` e se existe o documento `admins/{request.auth.uid}` |
| `isValidContact()` | Valida campos obrigatórios: `nome`, `email` (regex básico) e `mensagem` |
| `isValidTransparencyDoc()` | Valida `nome`, `link`, `categoria` (enum de 7 valores) e `createdAt` |
| `isValidNews()` | Valida `titulo`, `autor`, `corpo` e `createdAt` |

### Matriz de permissões

| Coleção | Leitura | Criação | Atualização | Exclusão |
|---|---|---|---|---|
| `admins/{uid}` | Próprio UID autenticado | ❌ (só Console) | ❌ | ❌ |
| `contacts` | Apenas admin | Pública (com validação) | Apenas admin | Apenas admin |
| `transparency_docs` | Pública | Apenas admin (com validação) | Apenas admin | Apenas admin |
| `news` | Pública | Apenas admin (com validação) | Apenas admin | Apenas admin |

> **Ponto crítico de segurança**: a verificação de admin usa `getDoc` no documento do próprio UID (não `getDocs` na coleção), o que é permitido pelas regras e evita varredura não autorizada da coleção `admins`.

---

## 🎨 Design System

O sistema adota uma **identidade visual quente e institucional**, derivada das cores do Corpo de Bombeiros, com tipografia condensada e vibrante para headings.

### Paleta de Cores

```css
/* Cores primárias */
--red:          #E12217   /* Vermelho bombeiro — cor de ação principal */
--red-dark:     #872020   /* Vermelho escuro — hover, gradientes profundos */
--red-light:    #ED4C43   /* Vermelho claro — variação de hover */
--fire:         #F27613   /* Laranja fogo — gradientes, ícones de destaque */
--amber:        #F8BA25   /* Âmbar — acentos secundários, badges, CTA alternativo */

/* Base neutra */
--navy:         #313332   /* Navy — backgrounds escuros, texto principal */
--navy-mid:     #404241   /* Navy médio — variações de fundo */
--navy-light:   #505251   /* Navy claro — textos secundários em fundos escuros */

/* Superfícies claras */
--white:        #FFFFFF
--off-white:    #F4F3F0   /* Fundo geral das páginas */
--gray-light:   #E8E5DE   /* Bordas, separadores, fundos de hover */
--gray:         #9CA3AF   /* Texto terciário, placeholders */

/* Texto */
--text:         #313332
--text-muted:   #636665
```

### Tipografia

| Uso | Família | Pesos |
|---|---|---|
| Headings (h1–h5), labels de seção, nav | Barlow Condensed | 600, 700, 800 |
| Corpo, parágrafos, botões, inputs | Barlow | 300, 400, 500, 600 |
| Headings (404.html) | Playfair Display | 400, 600, 800 |
| Corpo (404.html) | Lato | 300, 400, 700 |

### Tokens de Layout

```css
--radius:       6px
--radius-lg:    14px
--shadow-sm:    0 2px 8px rgba(0,0,0,.08)
--shadow-md:    0 6px 24px rgba(0,0,0,.12)
--shadow-lg:    0 12px 48px rgba(0,0,0,.18)
--transition:   0.3s ease
```

---

## ⚙️ Como Configurar

### 1. Firebase — Criar o Projeto

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) e crie um projeto
2. Ative **Authentication** → método de login: **Google**
3. Ative **Firestore Database** no modo produção
4. Copie as credenciais e substitua o objeto `firebaseConfig` em todos os arquivos:
   - `assets/js/script.js`
   - `assets/js/search.js`
   - `akannihub.html` (bloco `<script type="module">`)
   - `institucional/transparencia.html`
   - `atuacao/noticias.html`

```javascript
const firebaseConfig = {
    apiKey:            "SUA_API_KEY",
    authDomain:        "seu-projeto.firebaseapp.com",
    projectId:         "seu-projeto",
    storageBucket:     "seu-projeto.firebasestorage.app",
    messagingSenderId: "SEU_MESSAGING_ID",
    appId:             "SEU_APP_ID",
    measurementId:     "SEU_MEASUREMENT_ID"   // opcional, Analytics
};
```

5. No **Firebase Console → Firestore → Regras**, publique o conteúdo do arquivo `firestore.rules`

### 2. Adicionar Administradores

Para autorizar um usuário a acessar o AkanniHub, crie manualmente um documento no Firestore:

```
Coleção:  admins
ID:       UID do usuário (obtido em Authentication → Users após o primeiro login)

Conteúdo mínimo do documento:
{
  "email": "admin@email.com.br",
  "name": "Nome do Admin"
}
```

> O usuário deve realizar o login ao menos uma vez (será bloqueado na primeira tentativa), e então o gestor adiciona o UID no Console e libera o acesso.

### 3. Cloudinary — Upload de Imagens

1. Crie uma conta em [cloudinary.com](https://cloudinary.com)
2. No Dashboard, copie o **Cloud Name**
3. Em **Settings → Upload**, crie um **Upload Preset** com modo `unsigned`
4. Substitua os valores no bloco de configuração do `akannihub.html`:

```javascript
const CLOUDINARY_CLOUD  = "seu_cloud_name";   // ex: "fenix193"
const CLOUDINARY_PRESET = "seu_preset";       // ex: "ml_default"
```

### 4. Vercel — Deploy

1. Faça push do repositório para o GitHub
2. Importe o projeto na [Vercel](https://vercel.com)
3. Não é necessária nenhuma configuração de build — o projeto é estático
4. O arquivo `vercel.json` já configura:
   - `cleanUrls: true` — URLs sem `.html` (ex: `/atuacao/noticias`)
   - `trailingSlash: false`
   - Redirecionamento 404 → `404.html`
   - Cache imutável para assets (`max-age=31536000`)
   - Cache de 24h + revalidação para CSS e JS
   - Sem cache para HTML (`must-revalidate`)
   - Headers de segurança: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`

### 5. Servir Localmente

Os módulos Firebase são carregados via CDN ESM. Para desenvolvimento local, é **obrigatório** servir os arquivos por um servidor HTTP:

```bash
# Python
python -m http.server 8000

# Node.js (npx)
npx serve .

# VS Code
# Extensão "Live Server" (recomendado)
```

> Abrir os arquivos diretamente no navegador (`file://`) fará os imports ESM falharem com erro de CORS.

---

## 📡 SEO e Deploy

### Sitemap (`sitemap.xml`)

O sitemap inclui 13 URLs com prioridades e frequências de atualização configuradas:

| URL | Prioridade | Frequência |
|---|---|---|
| `/` | 1.0 | weekly |
| `/atuacao/noticias` | 0.9 | weekly |
| `/institucional/nossa-historia` | 0.8 | yearly |
| `/institucional/missao-valores` | 0.8 | yearly |
| `/institucional/equipe` | 0.8 | monthly |
| `/atuacao/projetos` | 0.8 | monthly |
| `/atuacao/capacitacao` | 0.8 | monthly |
| `/institucional/transparencia` | 0.7 | monthly |
| `/atuacao/eventos` | 0.7 | weekly |
| `/atuacao/parcerias` | 0.7 | monthly |
| `/akannihub` | 0.2 | never |
| `/404` | 0.1 | never |

### robots.txt

```
User-agent: *
Allow: /
Sitemap: https://ff193.vercel.app/sitemap.xml
```

---

## 🐛 GitHub Issues

O repositório inclui um template de chamados para clientes (`solicitacao_cliente.yml`) acessível via **Issues → New Issue → Nova Solicitação (Cliente)**.

O formulário coleta:

| Campo | Tipo | Obrigatório |
|---|---|---|
| Seu Nome / Projeto | Input de texto | ✅ |
| Tipo da Solicitação | Dropdown (6 opções) | ✅ |
| Tela ou Link do problema | Input de texto | ✅ |
| Descrição detalhada | Textarea | ✅ |
| Passo a passo para reproduzir | Textarea | ❌ |

**Tipos de solicitação disponíveis:**
- 🐛 Erro no Sistema
- 🚨 Crítico / Urgente
- ✏️ Ajuste de Conteúdo
- 🎨 Ajuste Visual
- 💡 Nova Funcionalidade
- ❓ Dúvida

---

## 🚀 Próximas Funcionalidades

- Preenchimento dos conteúdos das páginas (história, missão, valores, projetos, cursos)
- CNPJ e dados de contato reais
- Redes sociais com links reais
- Dados dos stats (`data-target`) com números reais da Fundação
- Primeiro parceiro real (substituir slots placeholder)
- Seção de Eventos com evento real publicado
- Formulário de Contato com campo de assunto ativo no filtro do AkanniHub
- Marca d'água de lido/não lido nas mensagens de contato com ação no painel
- Google Analytics integrado e configurado (measurementId já está no config)

---

## 👨‍💻 Desenvolvedor

<div align="center">

**GeoCODE Programmer — Geovani Santos**

[![Portfólio](https://img.shields.io/badge/Portfólio-eusougeovani.vercel.app-blue?style=flat-square&logo=vercel)](https://eusougeovani.vercel.app)
[![E-mail](https://img.shields.io/badge/E--mail-geocodeprogrammer@gmail.com-red?style=flat-square&logo=gmail)](mailto:geocodeprogrammer@gmail.com)
[![Instagram](https://img.shields.io/badge/Instagram-@geovanikeeper-E4405F?style=flat-square&logo=instagram&logoColor=white)](https://www.instagram.com/geovanikeeper)

</div>

---

## 📜 Licença

Projeto desenvolvido sob encomenda para uso exclusivo da **Fundação Fênix 193**.
Redistribuição, cópia ou reutilização do código — total ou parcial — condicionada a autorização prévia e expressa do desenvolvedor.

---

<div align="center">

*AkanniHub SaaS — Versão 1.1.2 · Maio 2026*

*Desenvolvido com ☕ por [GeoCODE Programmer](https://www.eusougeovani.vercel.app)*

</div>