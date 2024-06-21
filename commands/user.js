const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Fornece informação sobre o usuário.'),
    async execute(interaction) {
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

        const joinedAt = interaction.member.joinedAt.toLocaleString('pt-BR', options);

        // Cria o embed com as informações do usuário
        const userEmbed = new EmbedBuilder()
            .setTitle(`${interaction.user.tag}`)
            .setDescription(`Juntou-se ao servidor em ${joinedAt}.`)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))

        // Verifica se a interação já foi deferida ou respondida
        if (interaction.deferred || interaction.replied) {
            // Atualize a resposta existente com o embed
            await interaction.editReply({ embeds: [userEmbed] });
        } else {
            // Responda pela primeira vez com o embed
            await interaction.reply({ embeds: [userEmbed] });
        }

        console.log(`${new Date().toLocaleString('pt-BR')} | Comando /user executado (${interaction.user.tag})`);
    },
};
