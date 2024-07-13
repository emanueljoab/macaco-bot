require('dotenv').config();

const { getLanguagePreference } = require('../database');
const { EmbedBuilder } = require('discord.js');

const familiasSimiiformes = [
    'Cebidae', 'Cercopithecidae', 'Hominidae', 
    'Hylobatidae', 'Pitheciidae', 'Aotidae', 
    'Atelidae', 'Callitrichidae'
];

let fetch;
async function loadFetch() {
    if (!fetch) {
        fetch = (await import('node-fetch')).default;
    }
}

// Função para traduzir texto usando a API da DeepL
async function translateText(text) {
    const apiKey = process.env.DEEPL_API_KEY;
    try {
        const response = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `auth_key=${apiKey}&text=${encodeURIComponent(text)}&source_lang=EN&target_lang=PT`,
        });
        
        if (!response.ok) {
            const responseBody = await response.text();
            throw new Error(`Erro na requisição de tradução: ${response.statusText}. Detalhes: ${responseBody}`);
        }
        
        const data = await response.json();
        if (data.translations && data.translations.length > 0) {
            return data.translations[0].text;
        }
        
        throw new Error('Nenhuma tradução disponível');
    } catch (error) {
        console.error('Erro ao traduzir texto:', error);
        throw error;
    }
}

const macacos = {};

async function fetchSpecies(offset = 0) {
    await loadFetch(); // Carrega o fetch dinamicamente
    const response = await fetch(`https://api.gbif.org/v1/species/search?rank=SPECIES&highertaxon_key=798&limit=1000&offset=${offset}`);
    if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.statusText}`);
    }
    return await response.json();
}

async function fetchImage(speciesKey) {
    await loadFetch(); // Carrega o fetch dinamicamente
    const response = await fetch(`https://api.gbif.org/v1/occurrence/search?mediaType=StillImage&speciesKey=${speciesKey}&limit=1`);
    if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.results && data.results[0] && data.results[0].media && data.results[0].media[0]) {
        return data.results[0].media[0].identifier;
    }
    return null;
}

async function fetchVernacularNames(speciesKey) {
    await loadFetch(); // Carrega o fetch dinamicamente

    let retryCount = 3; // Tentativas máximas
    while (retryCount > 0) {
        try {
            const response = await fetch(`https://api.gbif.org/v1/species/${speciesKey}/vernacularNames`);
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Erro ao buscar nomes vernaculares para a espécie com chave ${speciesKey}:`, error);
            retryCount--;
            if (retryCount > 0) {
                console.log(`Tentando novamente... Restam ${retryCount} tentativas.`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 2 segundos antes de tentar novamente
            } else {
                throw new Error(`Falha após ${retryCount + 1} tentativas: ${error.message}`);
            }
        }
    }
}

async function fetchMacacos(message, offset) {
    try {
        const speciesData = await fetchSpecies(offset);

        const guildId = message.guild.id;
        const languagePreference = await getLanguagePreference(guildId);

        const promises = speciesData.results.map(async species => {
            if (!familiasSimiiformes.includes(species.family)) {
                return;
            }
            try {
                const vernacularData = await fetchVernacularNames(species.key);
                let vernacularName = null;
                
                if (languagePreference === 'english') {
                    // Procurar por um nome vernacular em inglês
                    const englishVernacular = vernacularData.results.find(vernacular => vernacular.language === 'eng');
                    if (englishVernacular) {
                        vernacularName = englishVernacular.vernacularName;
                    }
                } else {
                    // Procurar por um nome vernacular em português
                    const portugueseVernacular = vernacularData.results.find(vernacular => vernacular.language === 'por');
                    if (portugueseVernacular) {
                        vernacularName = portugueseVernacular.vernacularName;
                    } else {
                        // Se não houver nome em português, usar o nome em inglês
                        const englishVernacular = vernacularData.results.find(vernacular => vernacular.language === 'eng');
                        if (englishVernacular) {
                            vernacularName = englishVernacular.vernacularName;
                        }
                    }
                }

                // Obter uma descrição aleatória e limitar a 100 caracteres
                let description = "";
                if (species.descriptions && species.descriptions.length > 0) {
                    const randomIndex = Math.floor(Math.random() * species.descriptions.length);
                    description = species.descriptions[randomIndex].description;
                    description = description.slice(0, 100); // Limita a 100 caracteres
                    if (description.length === 100) {
                        description += '...'; // Adiciona reticências se cortou no meio da palavra
                    }
                }

                // Se encontramos um nome vernacular e uma descrição, adicionamos ao objeto macacos
                if (vernacularName && description) {
                    const imageUrl = await fetchImage(species.key);
                    if (imageUrl) {
                        macacos[vernacularName] = { imageUrl, description };
                    }
                }
            } catch (error) {
                console.error(`Erro ao obter informações para a espécie com chave ${species.key}:`, error);
            }
        });
        await Promise.all(promises);
    } catch (error) {
        console.error("Erro ao buscar espécies de macacos:", error);
    }
}

async function getRandomMonkey(message) {
    try {
        // Gera um offset aleatório para a página a ser buscada
        const offset = Math.floor(Math.random() * 1000);
        if (Object.keys(macacos).length === 0) {
            await fetchMacacos(message, offset);
        }
        const nomesMacacos = Object.keys(macacos);
        const aleatorio = nomesMacacos[Math.floor(Math.random() * nomesMacacos.length)];

        return {
            nome: aleatorio,
            imagem: macacos[aleatorio].imageUrl,
            descricao: macacos[aleatorio].description
        };
    } catch (error) {
        console.error("Erro ao obter macacos aleatórios:", error);
        return null;
    }
}

async function execute(message, __, __, translate) {
    try {
        const { nome, imagem, descricao } = await getRandomMonkey(message);

        if (!nome || !imagem || !descricao) {
            throw new Error('Não foi possível encontrar um macaco com imagem e descrição.');
        }

        const embed = new EmbedBuilder()
            .setTitle(nome)
            .setImage(imagem)
            .setDescription(descricao);

        const reply = await message.reply({
            embeds: [embed],
        });

        console.log(`${new Date().toLocaleString('pt-BR')} | ${nome} (${message.author.username})`);

        // Traduzir o nome e a descrição após enviar a resposta
        const guildId = message.guild.id;
        const language = await getLanguagePreference(guildId);
        
        if (language === 'portuguese') {
            try {
                const translatedNome = await translateText(nome);
                const translatedDescricao = await translateText(descricao);
                const translatedEmbed = new EmbedBuilder()
                    .setTitle(translatedNome)
                    .setImage(imagem)
                    .setDescription(translatedDescricao);

                await reply.edit({
                    embeds: [translatedEmbed],
                });
            } catch (translationError) {
                console.error('Erro ao traduzir nome e descrição:', translationError);
            }
        }

    } catch (error) {
        console.error('Erro ao gerar macaco:', error);
        await message.reply(await translate('macaco', 'no monkey found'));
    }
}

module.exports = {
    execute,
};
