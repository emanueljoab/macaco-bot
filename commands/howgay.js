const { EmbedBuilder } = require("discord.js");
const { log, error } = require("../utils");

async function execute(message, _args, _db, translate) {
    try {
        let user = message.mentions.users.first() || message.author;
        let howgay = Math.floor(Math.random() * 101);

        let description;
        let footer = null;
        if (howgay === 100) {
            description = await translate("howgay", "description1", user.username, howgay);
            footer = await translate("howgay", "footer");
        } else if (howgay > 0 && howgay < 100) {
            description = await translate("howgay", "description2", user.username, howgay);
        } else {
            description = await translate("howgay", "description3", user.username, howgay);
        }

        const embedBuilder = new EmbedBuilder()
            .setTitle(await translate("howgay", "setTitle"))
            .setDescription(description);
        if (footer) embedBuilder.setFooter({ text: footer });
        await message.reply({ embeds: [embedBuilder] });
        log(message, `${user.username} é ${howgay}% gay`);
    } catch (err) {
        error(message, `Erro ao executar comando: ${err.message}`);
    }
}

module.exports = {
    execute,
};
