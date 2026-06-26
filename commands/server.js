const { EmbedBuilder } = require("discord.js");
const { log, error } = require("../utils");

async function execute(message, _args, _db, translate) {
    // Cria o embed com as informações do servidor
    const serverEmbed = new EmbedBuilder()
        .setTitle(`${message.guild.name}`)
        .setDescription(await translate("server", "setDescription", message.guild.memberCount))
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .addFields({ name: await translate("server", "addFields"), value: message.guild.createdAt.toLocaleString(await translate("server", "toLocaleString")), inline: false });
    await message.reply({ embeds: [serverEmbed] });
    console.log(`${new Date().toLocaleString("pt-BR")} | Comando 'server' executado (${message.author.tag})`);
}

module.exports = {
    execute,
};
