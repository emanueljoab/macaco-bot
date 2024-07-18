const { EmbedBuilder } = require("discord.js");

async function execute(message, __, __, translate) {
    const user = message.mentions.users.first() || message.author;
    const simp = Math.floor(Math.random() * 101);
    let footer;

    if (simp === 100) {
        footer = "GADO! 🐂";
    }

    const embed = new EmbedBuilder()
        .setTitle(await translate("simp", "setTitle"))
        .setDescription(await translate("simp", "setDescription", user.username, simp))
        .setThumbnail("https://i.imgur.com/gvRF6X5.jpg");

    if (footer) {
        embed.setFooter({ text: footer });
    }

    await message.reply({ embeds: [embed] });
    console.log(`${new Date().toLocaleString("pt-BR")} | ${user.username} é ${simp}% simp (${message.author.username})`);
}

module.exports = {
    execute,
};
