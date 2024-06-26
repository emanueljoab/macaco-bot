const { EmbedBuilder } = require('discord.js');

async function execute(message) {
    let user = message.mentions.users.first() || message.author;
    let member = message.guild.members.cache.get(user.id);
    
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

    const joinedAt = member.joinedAt.toLocaleString('pt-BR', options);

    const Embed = new EmbedBuilder()
        .setTitle(user.username)
        .setDescription(`Juntou-se ao servidor em ${joinedAt}.`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    await message.reply({ embeds: [Embed] });
    console.log(`${new Date().toLocaleString('pt-BR')} | Comando 'user' executado (${message.author.username})`);
}

module.exports = {
    execute,
};