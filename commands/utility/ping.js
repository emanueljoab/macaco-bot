const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Responde com Pong e latência!'),
    async execute(interaction) {
        const startTimestamp = Date.now(); // Captura o timestamp antes do processamento da interação

        // Verifica se a interação já foi deferida ou respondida
        if (interaction.deferred || interaction.replied) {
            // Atualize a resposta existente com a latência
            await interaction.editReply(`Pong! Latência: Em processamento...`);
        } else {
            // Responda pela primeira vez
            await interaction.reply(`Pong! Latência: Em processamento...`);
        }

        const endTimestamp = Date.now(); // Captura o timestamp após o processamento da interação
        const latency = endTimestamp - startTimestamp;

        // Verifica novamente se a interação já foi deferida ou respondida para atualizar com a latência correta
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(`Pong! Latência: ${latency}ms`);
        } else {
            await interaction.editFollowUp(`Pong! Latência: ${latency}ms`);
        }

        console.log(`${new Date().toLocaleString()} | Pong! Latência ${latency}ms (${interaction.user.tag})`);
    },
};
