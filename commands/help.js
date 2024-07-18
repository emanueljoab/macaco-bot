const { EmbedBuilder } = require("discord.js");

async function execute(client, message, __, __, translate) {
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
