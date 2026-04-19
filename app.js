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

// Funções de Interface
window.toggleDiretoria = function() {
    const info = document.getElementById('diretoria-info');
    info.style.display = info.style.display === 'block' ? 'none' : 'block';
}

// Animação de Números (Counter)
const animateCounters = () => {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const increment = target / 100;

        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(animateCounters, 20);
        } else {
            counter.innerText = target + "+";
        }
    });
};

// Intersection Observer para disparar a animação ao rolar
const observer = new IntersectionObserver((entries) => {
    if(entries[0].isIntersecting) animateCounters();
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats-container');
if(statsSection) observer.observe(statsSection);

// SIMULAÇÃO INTEGRAÇÃO FIREBASE (Notícias Dinâmicas do CBMSE)
/*
   No PDF você mencionou automatizar com o site do CBMSE. 
   Como o site oficial deles não fornece uma API pública direta, 
   o padrão sênior é usar um Cloud Function ou um Crawler que popula o Firestore.
*/
async function loadCBMSEnews() {
    console.log("Conectando ao Firestore para buscar feed CBMSE...");
    // Aqui viria a lógica: db.collection('noticias_bombeiros').limit(3).get()...
}

document.addEventListener('DOMContentLoaded', loadCBMSEnews);
