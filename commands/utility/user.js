const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Fornece informação sobre o usuário.'),
    async execute(interaction) {
        try {
            // Verifica se a interação já foi deferida ou respondida
            if (interaction.deferred || interaction.replied) {
				await interaction.followUp(`Este comando foi executado por **${interaction.user.tag}**, que se juntou em ${interaction.member.joinedAt}.`);
                console.log(`Comando /user executado (${interaction.user.tag})`);
            }
        } catch (error) {
            console.error('Erro ao responder ao comando user:', error);
            await interaction.followUp({ content: `Ocorreu um erro ao executar este comando: ${error.message}`, ephemeral: true });
        }
    },
};
