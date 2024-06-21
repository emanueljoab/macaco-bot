const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Responde com Pong e latência!'),
    async execute(interaction) {
        const startTimestamp = Date.now(); // Captura o timestamp antes do processamento da interação

        // Cria o embed inicial enquanto calcula a latência
        const initialEmbed = new EmbedBuilder()
            .setTitle('Pong!')
            .setDescription('Calculando...')

        // Verifica se a interação já foi deferida ou respondida
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ embeds: [initialEmbed] });
        } else {
            await interaction.reply({ embeds: [initialEmbed] });
        }

        const endTimestamp = Date.now(); // Captura o timestamp após o processamento da interação
        const latency = endTimestamp - startTimestamp;

        // Cria o embed final com a latência calculada
        const latencyEmbed = new EmbedBuilder()
            .setTitle('Pong!')
            .setDescription(`Latência: ${latency}ms`)

        // Atualiza a resposta com o embed final contendo a latência
        await interaction.editReply({ embeds: [latencyEmbed] });

        console.log(`${new Date().toLocaleString('pt-BR')} | Pong! Latência ${latency}ms (${interaction.user.tag})`);
    },
};
