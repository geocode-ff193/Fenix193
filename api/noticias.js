import Parser from 'rss-parser';

const parser = new Parser();

export default async function handler(req, res) {
  try {
    // Feed oficial do CBMSE (ajuste a URL se necessário)
    const FEED_URL = 'https://www.cbm.se.gov.br/index.php/noticias/feed';
    const feed = await parser.parseURL(FEED_URL);

    // Retorna apenas os 3 ou 4 últimos para o layout do site
    const topNews = feed.items.slice(0, 3).map(item => ({
      titulo: item.title,
      link: item.link,
      data: item.pubDate,
      resumo: item.contentSnippet || "",
      // O RSS do CBMSE às vezes não traz imagem direto, 
      // podemos tratar isso no front ou tentar extrair aqui.
    }));

    // Cache de 1 hora para não sobrecarregar o site do CBMSE
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(topNews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar notícias' });
  }
}