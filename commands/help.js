const { EmbedBuilder } = require("discord.js");
const { log, error } = require("../utils");

async function execute(client, message, _args, _db, translate) {
    const embed = new EmbedBuilder()
        .setTitle(await translate("help", "setTitle"))
        .setDescription(await translate("help", "setDescription"))
        .setThumbnail(client.user.avatarURL());
    message.reply({ embeds: [embed] });
    console.log(`${new Date().toLocaleString("pt-BR")} | Comando 'help' executado. (${message.author.username})`);
}

module.exports = {
    execute,
};
