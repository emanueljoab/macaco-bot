const axios = require('axios');
const cheerio = require('cheerio');

async function extrairDadosMacacos() {
    try {
        // Fazendo requisição para a página da lista de primatas na Wikipedia
        const response = await axios.get('https://pt.wikipedia.org/wiki/Lista_de_primatas_por_popula%C3%A7%C3%A3o');
        
        // Carregando o HTML da página usando o Cheerio
        const $ = cheerio.load(response.data);
        
        // Inicializando uma lista para armazenar os dados dos macacos
        const listaMacacos = [];
        
        // Encontrando o índice da coluna "Imagem"
        const indexImagem = $('table.wikitable th').filter((_, el) => $(el).text().trim() === 'Imagem').index();
        
        // Iterando sobre cada linha da tabela de primatas
        $('table.wikitable tbody tr').each((index, element) => {
            // Extraindo o nome popular e a URL da imagem do macaco
            const nomePopular = $(element).find('td').eq(0).text().trim();
            let imagemUrl = $(element).find('td').eq(indexImagem).find('img').attr('src');
            
            // Verificando se o nome popular e a URL da imagem existem
            if (nomePopular && imagemUrl) {
                // Removendo "/thumb" e o ".jpg" extra no final da URL da imagem
                imagemUrl = imagemUrl.replace('/thumb', '').replace(/\/[0-9]+px-[^/]+\.jpg$/, '');
                
                // Adicionando "https:" no início da URL da imagem
                imagemUrl = "https:" + imagemUrl;
                
                // Adicionando os dados do macaco à lista
                listaMacacos.push({ nomePopular, imagemUrl });
            }
        });
        
        // Exibindo a lista de macacos
        console.log(listaMacacos);
        
        // Retornando a lista de macacos
        return listaMacacos;
    } catch (error) {
        console.error('Ocorreu um erro:', error);
    }
}

// Chamando a função para extrair os dados dos macacos
extrairDadosMacacos();
