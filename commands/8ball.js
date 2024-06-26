const { EmbedBuilder } = require('discord.js');

async function execute(message, args) {
    const respostas = [
        '\u{1F7E2} É certo',
        '\u{1F7E2} É claramente verdade',
        '\u{1F7E2} Sem dúvida',
        '\u{1F7E2} Definitivamente sim',
        '\u{1F7E2} Pode contar com isso',
        '\u{1F7E2} Na minha opinião, sim',
        '\u{1F7E2} Provavelmente',
        '\u{1F7E2} Perspectiva boa',
        '\u{1F7E2} Sim',
        '\u{1F7E2} Os sinais apontam que sim',
        '\u{1F7E1} Resposta vaga, tente novamente',
        '\u{1F7E1} Pergunte novamente mais tarde',
        '\u{1F7E1} Melhor não te contar agora',
        '\u{1F7E1} Não é possível prever agora',
        '\u{1F7E1} Concentre-se e pergunte novamente',
        '\u{1F534} Não conte com isso',
        '\u{1F534} Minha resposta é não',
        '\u{1F534} Minhas fontes dizem que não',
        '\u{1F534} Perspectiva não muito boa',
        '\u{1F534} Duvido muito'
    ];

    const indiceAleatorio = Math.floor(Math.random() * respostas.length);
    const resposta = respostas[indiceAleatorio];
    const pergunta = args.join(' ');
    let perguntaCapitalizada = pergunta.charAt(0).toUpperCase() + pergunta.slice(1);

    if (args.length > 0) {
        perguntaCapitalizada = `*"${perguntaCapitalizada}"*\n`;
    }

    const embed = new EmbedBuilder()
        .setTitle('Bola 8 Mágica')
        .setDescription(`${message.author} perguntou\n${perguntaCapitalizada}\nMinha resposta é...\n**${resposta}**`)
        .setThumbnail('https://www.horoscope.com/images-US/games/game-magic-8-ball-no-text.png')
    await message.reply( {embeds: [embed] } );
    console.log(`${new Date().toLocaleString('pt-BR')} | ${resposta} (${message.author.username})`)
}

module.exports = {
    execute,
};
