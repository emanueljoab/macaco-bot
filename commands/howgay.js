const { EmbedBuilder } = require("discord.js");
const { log, error } = require("../utils");

async function execute(message, _args, _db, translate) {
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

    const embed = new EmbedBuilder()
        .setTitle(await translate("howgay", "setTitle"))
        .setDescription(description)
        .setFooter({ text: footer });
    await message.reply({ embeds: [embed] });
    log(message, `${user.username} é ${howgay}% gay`);
}

module.exports = {
    execute,
};
