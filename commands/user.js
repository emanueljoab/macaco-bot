const { EmbedBuilder } = require('discord.js');

async function execute(message) {
    const options = {
        timeZone: 'America/Sao_Paulo',
        timeZoneName: 'short',
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    };

    const joinedAt = message.member.joinedAt.toLocaleString('pt-BR', options);

    // Cria o embed com as informações do usuário
    const userEmbed = new EmbedBuilder()
        .setTitle(`${message.author.tag}`)
        .setDescription(`Juntou-se ao servidor em ${joinedAt}.`)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))

    // Verifica se a interação já foi deferida ou respondida
    if (message.deferred || message.replied) {
        // Atualize a resposta existente com o embed
        await message.editReply({ embeds: [userEmbed] });
    } else {
        // Responda pela primeira vez com o embed
        await message.reply({ embeds: [userEmbed] });
    }

    console.log(`${new Date().toLocaleString('pt-BR')} | Comando /user executado (${message.author.tag})`);
}

module.exports = {
    execute,
};