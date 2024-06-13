const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Fornece informação sobre o servidor.'),
    async execute(interaction) {
        if (interaction.deferred || interaction.replied) {
            // Atualize a resposta existente, se necessário
            await interaction.editReply(`Este é o servidor **${interaction.guild.name}** e tem ${interaction.guild.memberCount} membros.`);
        } else {
            // Responda pela primeira vez
            await interaction.reply(`Este é o servidor **${interaction.guild.name}** e tem ${interaction.guild.memberCount} membros.`);
        }
        console.log(`${new Date().toLocaleString()} | Comando /server executado (${interaction.user.tag})`);
    },
};
