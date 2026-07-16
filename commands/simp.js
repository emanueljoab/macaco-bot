const { EmbedBuilder } = require("discord.js");
const { log, error, monkeyEmbed } = require("../utils");
const { updateRecord } = require("../database");

async function execute(message, _args, _db, translate) {
    try {
        const user = message.mentions.users.first() || message.author;
        const simp = Math.floor(Math.random() * 101);
        let footer;
        if (simp === 100) {
            footer = await translate("simp", "maxSimp");
        }
        const embed = new EmbedBuilder()
            .setTitle(await translate("simp", "setTitle"))
            .setDescription(await translate("simp", "setDescription", user.username, simp))
            .setThumbnail("https://i.imgur.com/gvRF6X5.jpg");
        if (footer) {
            embed.setFooter({ text: footer });
        }
        await message.reply({ embeds: [embed] });
        log(message, `${user.username} é ${simp}% simp`);
        updateRecord(message.guild.id, message.guild.name, user.id, user.username, "max_simp", simp);
    } catch (err) {
        error(message, `Erro ao executar comando: ${err.message}`);
        const errEmbed = monkeyEmbed(await translate("simp", "error"));
        await message.reply({ embeds: [errEmbed] });
    }
}

module.exports = {
    execute,
};