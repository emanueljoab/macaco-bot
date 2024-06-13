const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Fornece informação sobre o servidor.'),
    async execute(interaction) {
        try {
            if (interaction.deferred || interaction.replied) {
                // Atualize a resposta existente, se necessário
                await interaction.editReply(`Este é o servidor **${interaction.guild.name}** e tem ${interaction.guild.memberCount} membros.`);
                console.log(`Comando /server executado (${interaction.user.tag})`);
            } else {
                // Responda pela primeira vez
                await interaction.reply(`Este é o servidor **${interaction.guild.name}** e tem ${interaction.guild.memberCount} membros.`);
                console.log(`Comando /server executado (${interaction.user.tag})`);
            }
        } catch (error) {
            console.error('Erro ao responder ao comando server:', error);
            if (error.code === 'InteractionAlreadyReplied') {
                // Se já houve uma resposta, não faça nada
                return;
            }
            await interaction.followUp({ content: `Ocorreu um erro ao executar este comando: ${error.message}`, ephemeral: true });
        }
    },
};
