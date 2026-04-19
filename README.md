# 🔥 Fundação Fênix 193

Site institucional da **Fundação Fênix 193** — organização sem fins lucrativos de apoio ao **Corpo de Bombeiros Militar de Sergipe (CBMSE)** e à Proteção e Defesa Civil.

---

## 📋 Visão Geral

| Item | Detalhe |
|---|---|
| **Cliente** | Fundação Fênix 193 |
| **Foco** | Apoio ao CBMSE e Defesa Civil Sergipana |
| **Tipo** | Site Institucional |
| **Stack** | HTML5 · CSS3 · Vanilla JS · Firebase Firestore |
| **Hospedagem** | Vercel (sugerido) |
| **Dev** | [GeoCODE Programmer](https://eusougeovani.vercel.app) |

---

## 🗂️ Estrutura de Arquivos

```
ff193/
├── index.html        # Estrutura completa do site (SPA one-page)
├── style.css         # Estilos globais, sistema de design, responsivo
├── app.js            # Lógica JS: Firebase, contadores, menu, formulário
├── hero-bombeiros.jpg  # (você adiciona) Imagem de fundo do Hero
├── logo-final.png      # (você adiciona) Logo da Fundação
└── README.md
```

---

## 🎨 Sistema de Design

### Paleta de Cores
```css
--red:        #C62828   /* Vermelho Bombeiro — cor primária */
--red-dark:   #8B0000   /* Vermelho escuro — hover/destaque */
--fire:       #FF6F00   /* Laranja fogo — gradientes */
--amber:      #FF8F00   /* Âmbar — ícones e destaques quentes */
--navy:       #0A1628   /* Azul marinho profundo — fundo escuro */
--navy-mid:   #112244   /* Navy intermediário */
--white:      #FFFFFF
--off-white:  #F5F5F5
--gray-light: #ECEFF1   /* Fundo seções alternadas */
```

### Tipografia
- **Títulos:** `Barlow Condensed` (600, 700, 800) — impacto e legibilidade institucional
- **Corpo:** `Barlow` (300, 400, 500, 600) — leitura confortável e moderna

---

## 📑 Seções do Site

| # | Seção | Funcionalidade |
|---|---|---|
| 1 | **Hero** | Animação SVG da Fênix em loop, 6 CTAs, parallax overlay |
| 2 | **Quem Somos** | Texto institucional + painel expansível de Diretoria |
| 3 | **Números que Impactam** | Contadores animados via `requestAnimationFrame` |
| 4 | **Áreas de Atuação** | Grid de 4 cards com hover animado |
| 5 | **Projetos em Destaque** | 3 projetos principais + 3 extras expansíveis via botão |
| 6 | **Como Ajudar** | 3 blocos: Doações, Parcerias, Voluntariado |
| 7 | **Notícias** | Feed dinâmico via Firestore (layout: 1 destaque + 2 laterais) |
| 8 | **Transparência** | 8 links para documentos institucionais |
| 9 | **Contato** | Dados + Formulário com envio ao Firestore |
| — | **Rodapé** | CNPJ, links rápidos, redes sociais, créditos |

---

## ⚙️ Funcionalidades JavaScript

### Implementadas
- **Menu mobile** com animação hamburger → X e fechamento ao clicar fora
- **Scroll Reveal** — seções animam ao entrar na viewport (`IntersectionObserver`)
- **Contadores animados** — easing cúbico easeOut via `requestAnimationFrame`
- **Toggle Diretoria** — expansão/colapso com animação e acessibilidade (`aria-expanded`)
- **Toggle Projetos** — exibe cards extras com fade/slide staggerado
- **Formulário de contato** — validação + envio para Firestore collection `contatos`
- **Botão "Voltar ao topo"** — aparece após 380px de scroll
- **Ano dinâmico** no rodapé

### Feed de Notícias — Opções de Integração

#### Opção A — Curadoria Manual (padrão atual)
Adicione documentos diretamente no Firestore via Console:
```
Collection: noticias
Campos: titulo (string), resumo (string), imagem (string/URL),
        data (Timestamp), link (string), fonte (string)
```

#### Opção B — Vercel Edge Function (Spark plan)
```js
// /api/noticias.js (Vercel)
export default async function handler(req, res) {
    const rss = await fetch('https://www.cbm.se.gov.br/index.php/noticias/feed');
    const xml = await rss.text();
    // parse XML → retornar JSON
    res.json(items);
}
```

#### Opção C — Firebase Cloud Function + Cron
```js
// functions/index.js
const { onSchedule } = require('firebase-functions/v2/scheduler');
exports.syncCbmseNews = onSchedule('every 6 hours', async () => {
    // fetch RSS → parse → salvar no Firestore
});
```
> ⚠️ Cloud Functions exigem **plano Blaze** (pay-as-you-go) no Firebase.

---

## 🔥 Firebase — Configuração

1. Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com)
2. Ative o **Firestore** em modo de produção
3. Copie as credenciais para `app.js`:

```js
const firebaseConfig = {
    apiKey:            "SUA_API_KEY",
    authDomain:        "fundacao193.firebaseapp.com",
    projectId:         "fundacao193",
    storageBucket:     "fundacao193.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId:             "SEU_APP_ID"
};
```

### Regras de Segurança Firestore (sugeridas)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Notícias — leitura pública, escrita restrita
    match /noticias/{doc} {
      allow read:  if true;
      allow write: if request.auth != null;
    }

    // Contatos — qualquer um pode criar (formulário), leitura restrita
    match /contatos/{doc} {
      allow create: if request.resource.data.keys()
                       .hasAll(['nome','email','mensagem']);
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

---

## 🚀 Deploy na Vercel

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/ff193.git
cd ff193

# 2. Instale a CLI da Vercel (opcional)
npm i -g vercel

# 3. Deploy
vercel --prod
```

Ou conecte o repositório GitHub diretamente no painel da Vercel — deploy automático a cada push na branch `main`.

---

## ♿ Acessibilidade

- Marcação semântica HTML5 (`header`, `main`, `section`, `footer`, `nav`, `article`)
- Atributos `aria-label`, `aria-expanded`, `aria-live`, `aria-controls`
- Contraste de cores conforme WCAG 2.1 AA
- Navegação por teclado funcional
- `alt` descritivo em todas as imagens

---

## 📌 Pendências / Próximos Passos

- [ ] Adicionar `hero-bombeiros.jpg` (foto real do CBMSE)
- [ ] Adicionar `logo-final.png` (logotipo oficial da Fundação)
- [ ] Preencher CNPJ no rodapé e no `<footer>`
- [ ] Configurar credenciais Firebase reais
- [ ] Criar páginas internas: `noticia.html`, `projetos.html`, `instituidores.html`, `apoiadores.html`
- [ ] Configurar domínio `fundacaofenix193.org.br` na Vercel
- [ ] Publicar documentos institucionais (Estatuto, Prestação de Contas)
- [ ] Integrar ícone/favicon real da Fundação
- [ ] Adicionar Google Analytics / Meta Pixel (opcional)

---

## 👨‍💻 Desenvolvimento

Desenvolvido por **GeoCODE Programmer**
- 🌐 [eusougeovani.vercel.app](https://eusougeovani.vercel.app)
- 📧 geocodeprogrammer@gmail.com

---

*© Fundação Fênix 193 — Todos os direitos reservados.*