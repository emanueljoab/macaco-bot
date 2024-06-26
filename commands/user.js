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

    const userEmbed = new EmbedBuilder()
        .setTitle(`${message.author.tag}`)
        .setDescription(`Juntou-se ao servidor em ${joinedAt}.`)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
    await message.reply({ embeds: [userEmbed] });
    console.log(`${new Date().toLocaleString('pt-BR')} | Comando 'user' executado (${message.author.tag})`);
}

module.exports = {
    execute,
};