// Configuração Simbolizada do Firebase (Substitua pelas suas chaves da Vercel/Firebase)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "fundacao193.firebaseapp.com",
    projectId: "fundacao193",
    storageBucket: "fundacao193.appspot.com",
    messagingSenderId: "0000000000",
    appId: "1:00000000:web:000000"
};

// Iniciar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 1. Manipulação do Menu Mobile
const btnMobile = document.getElementById('btn-mobile');
const menu = document.getElementById('menu');

function toggleMenu() {
    menu.classList.toggle('active');
}
btnMobile?.addEventListener('click', toggleMenu);

// 2. Buscar Notícias do Firestore
async function fetchNews() {
    const newsContainer = document.getElementById('news-container');
    
    try {
        const q = query(collection(db, "noticias"), orderBy("data", "desc"), limit(3));
        const querySnapshot = await getDocs(q);
        
        newsContainer.innerHTML = ''; // Limpa o loader

        if (querySnapshot.empty) {
            newsContainer.innerHTML = '<p>Nenhuma notícia encontrada no momento.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const newsHtml = `
                <article class="news-card">
                    <img src="${data.imagem || 'https://via.placeholder.com/300x200'}" alt="${data.titulo}" style="width:100%">
                    <div class="news-info">
                        <h3>${data.titulo}</h3>
                        <p>${data.resumo}</p>
                        <a href="noticia.html?id=${doc.id}" class="link-red">Ler mais</a>
                    </div>
                </article>
            `;
            newsContainer.innerHTML += newsHtml;
        });
    } catch (error) {
        console.error("Erro ao buscar notícias: ", error);
        newsContainer.innerHTML = '<p>Erro ao carregar notícias. Tente novamente mais tarde.</p>';
    }
}

// 3. Efeito de Revelação Suave (Scroll Reveal)
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    fetchNews();
});
