const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Fornece informação sobre o servidor.'),
    async execute(interaction) {
        // Cria o embed com as informações do servidor
        const serverEmbed = new EmbedBuilder()
            .setTitle(`${interaction.guild.name}`)
            .setDescription(`${interaction.guild.memberCount} membros`)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .addFields(
                { name: 'Data de Criação', value: interaction.guild.createdAt.toLocaleString('pt-BR'), inline: false }
            )

        // Verifica se a interação já foi deferida ou respondida
        if (interaction.deferred || interaction.replied) {
            // Atualize a resposta existente com o embed
            await interaction.editReply({ embeds: [serverEmbed] });
        } else {
            // Responda pela primeira vez com o embed
            await interaction.reply({ embeds: [serverEmbed] });
        }

        console.log(`${new Date().toLocaleString('pt-BR')} | Comando /server executado (${interaction.user.tag})`);
    },
};
