const { EmbedBuilder } = require('discord.js');

async function execute(message) {
    const startTimestamp = Date.now(); // Captura o timestamp antes do processamento da interação

    const initialEmbed = new EmbedBuilder()
        .setTitle('Pong!')
        .setDescription('Calculando...');
    const sentMessage = await message.reply({ embeds: [initialEmbed] });

    const endTimestamp = Date.now(); // Captura o timestamp após o processamento da interação
    const latency = endTimestamp - startTimestamp;

    // Cria o embed final com a latência calculada
    const latencyEmbed = new EmbedBuilder()
        .setTitle('Pong!')
        .setDescription(`Latência: ${latency}ms`);
    await sentMessage.edit({ embeds: [latencyEmbed] });
    console.log(`${new Date().toLocaleString('pt-BR')} | Pong! Latência ${latency}ms (${message.author.tag})`);
}

module.exports = {
    execute,
};
