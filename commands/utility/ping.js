const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Responde com Pong e latência!'),
    async execute(interaction) {
        try {
            const startTimestamp = Date.now(); // Captura o timestamp antes do processamento da interação

            if (interaction.deferred || interaction.replied) {
                // Se já foi respondido ou agendado, apenas atualize com follow-up
                await interaction.followUp(`Pong! Latência: Em processamento...`);
            } else {
                // Caso contrário, responda pela primeira vez
                await interaction.reply(`Pong! Latência: Em processamento...`);
            }

            const endTimestamp = Date.now(); // Captura o timestamp após o processamento da interação

            const latency = endTimestamp - startTimestamp;

            if (interaction.deferred || interaction.replied) {
                // Atualiza a mensagem com a latência correta
                await interaction.editReply(`Pong! Latência: ${latency}ms`);
            } else {
                // Atualiza a mensagem com a latência correta
                await interaction.editFollowUp(`Pong! Latência: ${latency}ms`);
            }

            console.log(`${new Date().toLocaleString()} :: Pong! Latência ${latency}ms (${interaction.user.tag})`);
        } catch (error) {
            console.error('Erro ao responder ao comando ping:', error);
            if (error.code === 'InteractionAlreadyReplied') {
                // Se já houve uma resposta, não faça nada
                return;
            }
            await interaction.followUp({ content: `Ocorreu um erro ao executar este comando: ${error.message}`, ephemeral: true });
        }
    },
};
