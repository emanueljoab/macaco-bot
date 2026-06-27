require("dotenv").config();

const { getLanguagePreference } = require("../database");
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { log, error } = require("../utils");

const familiasSimiiformes = ["Cebidae", "Cercopithecidae", "Hominidae", "Hylobatidae", "Pitheciidae", "Aotidae", "Atelidae", "Callitrichidae"];

let fetch;
async function loadFetch() {
    if (!fetch) {
        fetch = (await import("node-fetch")).default;
    }
}

// Função para traduzir texto usando a API da DeepL
async function translateText(text, message) {
    const apiKey = process.env.DEEPL_API_KEY;
    try {
        const response = await fetch("https://api-free.deepl.com/v2/translate", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `DeepL-Auth-Key ${apiKey}`,
            },
            body: `text=${encodeURIComponent(text)}&source_lang=EN&target_lang=PT`,
        });
        if (!response.ok) {
            const responseBody = await response.text();
            throw new Error(`Erro na requisição de tradução: ${response.statusText}. Detalhes: ${responseBody}`);
        }
        const data = await response.json();
        if (data.translations && data.translations.length > 0) {
            return data.translations[0].text;
        }
        throw new Error("Nenhuma tradução disponível");
    } catch (err) {
        error(message, `Erro ao traduzir texto: ${err.message}`);
        throw err;
    }
}

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

async function fetchVernacularNames(speciesKey, message) {
    await loadFetch(); // Carregar o fetch dinamicamente

    let retryCount = 3; // Tentativas máximas
    while (retryCount > 0) {
        try {
            const response = await fetch(`https://api.gbif.org/v1/species/${speciesKey}/vernacularNames`);
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.statusText}`);
            }
            return await response.json();
        } catch (err) {
            error(message, `Erro ao buscar nomes vernaculares para a espécie com chave ${speciesKey}: ${err.message}`);
            retryCount--;
            if (retryCount > 0) {
                log(message, `Tentando novamente... Restam ${retryCount} tentativas`);
                await new Promise((resolve) => setTimeout(resolve, 2000)); // Aguardar 2 segundos antes de tentar novamente
            } else {
                throw new Error(`Falha após ${retryCount + 1} tentativas: ${err.message}`);
            }
        }
    }
}

async function getRandomMonkey(message) {
    await loadFetch();
    const guildId = message.guild.id;
    const languagePreference = await getLanguagePreference(guildId);

    for (let tentativa = 0; tentativa < 20; tentativa++) {
        try {
            const offset = Math.floor(Math.random() * 1000);
            const speciesData = await fetchSpecies(offset);

            // Filtrar só as famílias válidas e embaralha
            const validas = speciesData.results
                .filter(s => familiasSimiiformes.includes(s.family))
                .sort(() => Math.random() - 0.5);

            for (const species of validas) {
                try {
                    if (!species.descriptions || species.descriptions.length === 0) continue;

                    const vernacularData = await fetchVernacularNames(species.key, message);

                    let vernacularName = null;
                    if (languagePreference === 'english') {
                        const eng = vernacularData.results.find(v => v.language === 'eng');
                        if (eng) vernacularName = eng.vernacularName;
                    } else {
                        const por = vernacularData.results.find(v => v.language === 'por');
                        const eng = vernacularData.results.find(v => v.language === 'eng');
                        vernacularName = por?.vernacularName || eng?.vernacularName || null;
                    }

                    if (!vernacularName) continue;

                    const imageUrl = await fetchImage(species.key);
                    if (!imageUrl) continue;

                    const randomIndex = Math.floor(Math.random() * species.descriptions.length);
                    let description = species.descriptions[randomIndex].description.slice(0, 200);
                    if (description.length === 200) description += '...';

                    return { nome: vernacularName, imagem: imageUrl, descricao: description };
                } catch {
                    continue;
                }
            }
        } catch {
            continue;
        }
    }

    return null;
}

async function execute(message, _args, _db, translate) {
    try {
        const loadingEmbed = new EmbedBuilder()
            .setDescription(await translate("macaco", "searching"));

        const reply = await message.reply({ embeds: [loadingEmbed] });

        const result = await getRandomMonkey(message);

        if (!result) {
            throw new Error("Não foi possível encontrar um macaco com imagem e descrição.");
        }

        const { nome, imagem, descricao } = result;

        log(message, `${nome}`);

        const guildId = message.guild.id;
        const language = await getLanguagePreference(guildId);

        let titulo = nome;
        let descricaoFinal = descricao;

        if (language === "portuguese") {
            titulo = await translateText(nome, message);
            descricaoFinal = await translateText(descricao, message);
        }

        // Disfarçar a requisição do bot como se fosse um navegador comum
        const imageResponse = await fetch(imagem, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
        });
        
        if (!imageResponse.ok) {
            throw new Error(`Erro ao baixar a imagem: ${imageResponse.statusText}`);
        }

        const arrayBuffer = await imageResponse.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);
        
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'macaco.jpg' });

        const embed = new EmbedBuilder()
            .setTitle(`${titulo} 🐒`)
            .setImage('attachment://macaco.jpg')
            .setDescription(descricaoFinal);

        await reply.edit({ embeds: [embed], files: [attachment] });
    } catch (err) {
        error(message, `Erro ao gerar macaco: ${err.message}`);
        await message.reply(await translate("macaco", "no monkey found"));
    }
}

module.exports = {
    execute,
};