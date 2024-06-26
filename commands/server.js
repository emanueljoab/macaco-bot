const { EmbedBuilder } = require('discord.js');

async function execute(message) {
    // Cria o embed com as informações do servidor
    const serverEmbed = new EmbedBuilder()
        .setTitle(`${message.guild.name}`)
        .setDescription(`${message.guild.memberCount} membros`)
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .addFields(
            { name: 'Data de Criação', value: message.guild.createdAt.toLocaleString('pt-BR'), inline: false }
        )

    // Verifica se a interação já foi deferida ou respondida
    if (message.deferred || message.replied) {
        // Atualize a resposta existente com o embed
        await message.editReply({ embeds: [serverEmbed] });
    } else {
        // Responda pela primeira vez com o embed
        await message.reply({ embeds: [serverEmbed] });
    }

    console.log(`${new Date().toLocaleString('pt-BR')} | Comando 'server' executado (${message.author.tag})`);
}

module.exports = {
    execute,
};