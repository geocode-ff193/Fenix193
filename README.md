<div align="center">

<img src="img/favicon.svg" alt="Fundação Fênix 193" width="130" />

# Fundação Fênix 193

### Projeto Web FF193 — Site institucional + SaaS Akanni

<br/>

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Firebase](https://img.shields.io/badge/Firebase-FFA611?style=flat-square&logo=firebase&logoColor=white)](https://firebase.google.com/)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Versão](https://img.shields.io/badge/versão-0.0.0-brightgreen?style=flat-square)](#)
[![Licença](https://img.shields.io/badge/licença-sob_encomenda-red?style=flat-square)](#-licença)

<br/>

> Projeto web desenvolvida para a **Fundação Fênix 193** que combina uma landing page institucional moderna com um sistema de gestão web completo, integrado ao Firebase em tempo real.

<br/>

[🌐 Site Institucional](#-site-institucional-indexhtml) · [🖥️ SaaS AkanniHub](#-akannihub-akannihubhtml) · [👪 Conselho](#-conselho-conselhohtml) · [📰 Notícias](#-news-newshtml) · [📁 Transparência](#-transparencia-transparenciahtml)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Estrutura de Arquivos](#-estrutura-de-arquivos)
- [Funcionalidades](#-funcionalidades)
  - [Site Institucional](#-site-institucionalindexhtml)
  - [SaaS AkanniHub](#-akannihub-akannihubhtml)
  - [Conselho](#-conselho-conselhohtml)
  - [Notícias](#-news-newshtml)
  - [Transparência](#-transparencia-transparenciahtml)
- [Tecnologias](#-tecnologias)
- [Banco de Dados (Firestore)](#-banco-de-dados-firestore)
- [Segurança e Regras Firestore](#-segurança-e-regras-firestore)
- [Design System](#-design-system)
- [Como Configurar](#️-como-configurar)
- [LGPD](#-lgpd)
- [Próximas Funcionalidades](#-próximas-funcionalidades)
- [Desenvolvedor](#-desenvolvedor)
- [Licença](#-licença)

---

## 💡 Sobre o Projeto



**Principais diferenciais:**

- 
- 
- 
- 
- 
- 
- 
- 

---

## 📁 Estrutura de Arquivos

```
/
├── index.html          # Site institucional
├── akannihub.html      # SaaS — área restrita da administração
├── conselho.html       # Página pública da Equipe
├── news.html           # Portal de notícias
├── transparencia.html  # Portal da Trasnparência
│
├── style.css           # Design System
├── script.js           # Lógica principal
│
├── firestore.rules     # Regras de segurança do Firestore
├── site.webmanifest    # Manifesto PWA
├── sitemap.xml         # SiteMap
└── img/                # Imagens, logos e ícones
    └── membros/        # Foto dos Membros da Equipe (conselho.html)
├── akanni/             # Imagens, logos e ícones do SaaS
```

---

## ✨ Funcionalidades

### 🌐 Site Institucional (`index.html`)

:

- 
- 
- 
- 
- 
- 
- 
- 

---

### 🖥️ SaaS AkanniHub (`akannihub.html`)

Sistema completo de gestão web para uso da administração.

#### 🔐 Autenticação

:

- 
- 
- 
- 
- 
- 
- 
- 

---

#### ⏲ Dashboard

:

- 
- 
- 
- 
- 
- 
- 
- 

---

#### ✉️ Contatos

:

- 
- 
- 
- 
- 
- 
- 
- 

---

#### 📁 Transparência

:

- 
- 
- 
- 
- 
- 
- 
- 

---

#### 📰 Notícias

:

- 
- 
- 
- 
- 
- 
- 
- 

---

### 👪 Conselho (`conselho.html`)

:

- 
- 
- 
- 
- 
- 
- 
- 

---

### 📰 Notícias (`news.html`)

:

- 
- 
- 
- 
- 
- 
- 
- 

---

### ⚖️ Transparência (`transparencia.html`)

:

- 
- 
- 
- 
- 
- 
- 
- 

---

## 🛠️ Tecnologias

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | HTML5, CSS3, JavaScript (Vanilla ES6+) | — |
| Backend / Auth | Firebase Authentication (Google) | 10.7.1 |
| Banco de dados | Firebase Firestore (NoSQL, tempo real) | 10.7.1 |
| Segurança | Firestore Security Rules | rules_version 2 |
| Ícones | Font Awesome | 6.5 |
| Tipografia | Playfair Display + DM Sans + Lato + Raleway | Google Fonts |
| Progressive Web App | Service Worker + Web Manifest | — |
| Hospedagem | Vercel | — |

---

## 🗄️ Banco de Dados (Firestore)

```


```

**Convenção de ID para `allowedEmails`:** substituir `.` por `_` e `@` por `_at_`.
Exemplo: `user@gmail.com` → `user_at_gmail_com`

---

## 🔐 Segurança e Regras Firestore

O sistema opera inteiramente no **plano Spark (gratuito)** sem Cloud Functions. A segurança é garantida por camadas de Firestore Security Rules:

### Funções auxiliares implementadas

| Função | Descrição |
|---|---|


### Pontos de acesso controlados

- **AkanniHub**: somente ` ` lê e escreve dados da administração

---

## 🎨 Design System

O sistema adota uma **paleta terrosa / identidade visual quente** consistente em todos os módulos:

```css
/* Tons de base (Escuros e Frios) */
--slate-deep:   #324158   /* Azul ardósia profundo — backgrounds escuros, texto principal */
--teal-dark:    #357066   /* Verde-azulado escuro — sidebar, painéis, gradientes */
--steel-blue:   #75A7BD   /* Azul aço médio — acentos secundários, elementos neutros */

/* Acento turquesa / menta (Cores de Ação) */
--mint-bright:  #34D1B7   /* Menta vibrante — CTAs principais, botões, destaques */
--aqua-muted:   #6CB7BD   /* Água suave — labels, badges, backgrounds de destaque suaves */
--mint-deep:    #29A893   /* Menta escurecido — hover de botões principais (tom derivado) */

/* Superfícies (Claras com leve fundo azulado para manter a harmonia) */
--ice-main:     #F0F4F8   /* Gelo suave — fundo principal do app */
--ice-soft:     #FAFCFD   /* Branco azulado — fundo de cards, modais e containers */
--ice-dark:     #E2E8F0   /* Cinza azulado — estados de hover, bordas e separadores */
--ice-alt:      #E8EEF2   /* Fundo alternativo para seções secundárias */

/* Status (Ajustados para combinar com a paleta fria) */
--success:      #2A9D8F   /* Verde água escuro — feedback positivo */
--danger:       #E07A5F   /* Coral / Vermelho suave — erros e ações destrutivas */
--warning:      #E9C46A   /* Amarelo queimado — alertas e avisos */
```

**Fontes:** Playfair Display (headings serif) + DM Sans / Lato (corpo sans-serif)

---

## ⚙️ Como Configurar

### 1. Firebase

1. Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com)
2. Ative **Authentication** → método: **Google**
3. Ative **Firestore Database** no modo produção

```javascript
const firebaseConfig = {
    apiKey:            "SUA_API_KEY",
    authDomain:        "seu-projeto.firebaseapp.com",
    projectId:         "seu-projeto",
    storageBucket:     "seu-projeto.firebasestorage.app",
    messagingSenderId: "SEU_MESSAGING_ID",
    appId:             "SEU_APP_ID"
};
```

4. Publique as regras de segurança do arquivo `firestore.rules` no console do Firebase

### 2. Whitelist de acesso Google (SaaS)

Para cada e-mail autorizado a usar o SaaS, crie um documento no Firestore:

```
Coleção:          allowedEmails
ID do documento:  substitua "." por "_" e "@" por "_at_"

Exemplo: email.teste@gmail.com → email_teste_at_gmail_com
Conteúdo do documento: { "email": "email.teste@gmail.com" }
```

### 3. E-mail do paciente no prontuário

Para que o paciente acesse o Portal, é **obrigatório** cadastrar o e-mail da conta Google dele no campo **E-mail** da ficha do paciente no SaaS. O login compara `user.email` (Google Auth) com `paciente.email` (Firestore) para fazer o vínculo automático.

### 4. Link do Portal do Paciente

```
https://seudominio.com/portal.html?uid=SEU_UID_AQUI
```

> O UID pode ser obtido no Firebase Console em **Authentication → Users** ou copiado em **SaaS → Configurações → Portal do Paciente** (botão "Copiar Link do Portal").

### 5. Link de Agendamento Público

```
https://seudominio.com/agendar.html?uid=SEU_UID_AQUI
```

### 6. Configuração da Agenda (`AGENDA_CONFIG`)

Localizado no início do `<script>` em `agendar.html` e `portal.html`:

```javascript
const AGENDA_CONFIG = {
    horarios: ['08:00', '09:00', '10:00', /* ... */, '20:00'],
    diasPermitidos: [1, 2, 3, 4, 5],    // 0 = Dom, 1 = Seg, ..., 6 = Sáb
    antecedenciaMinDias: 1,              // Mínimo de 1 dia de antecedência
    maxDiasAdiante: 60                   // Janela máxima de 60 dias
};
```

### 7. Google Calendar (opcional)

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie ou selecione um projeto e ative a **Google Calendar API**
3. Crie credenciais OAuth2 (tipo: Aplicativo Web) e adicione o domínio como origem autorizada
4. Substitua o valor em `visual.js`:

```javascript
const GOOGLE_CLIENT_ID = 'SEU_CLIENT_ID.apps.googleusercontent.com';
```


> **Atenção:** os módulos Firebase são carregados via CDN (ESM). É necessário servir os arquivos por um servidor HTTP (não abrir `index.html` diretamente no navegador).

---

## ⚖️ LGPD

O sistema foi desenvolvido em conformidade com a **Lei 13.709/2018 (LGPD)**:

| Requisito | Implementação |
|---|---|


---

## 🚀 Próximas Funcionalidades

:

- 
- 
- 
- 
- 
- 
- 
- 

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

*AkanniHub SaaS — Versão 0.0.0 · Abril 2026*

*Desenvolvido com ☕ por [GeoCODE Programmer](https://www.eusougeovani.vercel.app/geovanikeeper)*

</div>