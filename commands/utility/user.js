const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Fornece informação sobre o usuário.'),
    async execute(interaction) {
        // Verifica se a interação já foi deferida ou respondida
        if (interaction.deferred || interaction.replied) {
            await interaction.followUp(`Este comando foi executado por **${interaction.user.tag}**, que se juntou em ${interaction.member.joinedAt}.`);
            console.log(`${new Date().toLocaleString('pt-BR')} | Comando /user executado (${interaction.user.tag})`);
        } else {
            console.warn('A interação não está deferida nem respondida.');
        }
    },
};
