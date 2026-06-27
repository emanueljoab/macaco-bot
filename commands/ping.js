const { EmbedBuilder } = require("discord.js");
const { log, error } = require("../utils");

async function execute(message, _args, _db, translate) {
    try {
        const startTimestamp = Date.now();
        const initialEmbed = new EmbedBuilder().setTitle("Pong!").setDescription(await translate("ping", "calculating"));
        const sentMessage = await message.reply({ embeds: [initialEmbed] });
        const endTimestamp = Date.now();
        const latency = endTimestamp - startTimestamp;
        const latencyEmbed = new EmbedBuilder().setTitle("Pong!").setDescription(await translate("ping", "latency", latency));
        await sentMessage.edit({ embeds: [latencyEmbed] });
        log(message, `Pong! Latência ${latency} ms`);
    } catch (err) {
        error(message, `Erro ao executar ping: ${err.message}`);
        await message.reply(await translate("ping", "error"));
    }
}

module.exports = {
    execute,
};