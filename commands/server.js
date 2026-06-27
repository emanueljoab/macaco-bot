const { EmbedBuilder } = require("discord.js");
const { log, error } = require("../utils");

async function execute(message, _args, _db, translate) {
    try {
        const serverEmbed = new EmbedBuilder()
            .setTitle(`${message.guild.name}`)
            .setDescription(await translate("server", "setDescription", message.guild.memberCount))
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .addFields({ name: await translate("server", "addFields"), value: message.guild.createdAt.toLocaleString(await translate("server", "toLocaleString")), inline: false });
        await message.reply({ embeds: [serverEmbed] });
        log(message, `Comando executado`);
    } catch (err) {
        error(message, `Erro ao executar comando: ${err.message}`);
        const errorEmbed = new EmbedBuilder()
            .setDescription(await translate("server", "error"));
        await message.reply({ embeds: [errorEmbed] });
    }
}

module.exports = {
    execute,
};