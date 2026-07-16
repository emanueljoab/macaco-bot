const { EmbedBuilder } = require("discord.js");
const { log, error, monkeyEmbed } = require("../utils");
const { updateRecord } = require("../database");

async function execute(message, _args, _db, translate) {
    try {
        let user = message.mentions.users.first() || message.author;
        let stank = Math.floor(Math.random() * 101);
        let thumbnails = ["https://i.imgur.com/dP60pVE.gif", "https://i.imgur.com/NbxSkEX.jpg", "https://i.imgur.com/DhTukGt.jpg", "https://i.imgur.com/p9oHo94.png", "https://i.imgur.com/DnmBv6d.gif"];
        const thumbnailAleatorio = thumbnails[Math.floor(Math.random() * thumbnails.length)];
        const barraPorcentagem = generateProgressBar(stank);
        const embed = new EmbedBuilder()
            .setTitle(await translate("stank", "setTitle"))
            .setDescription(await translate("stank", "setDescription", user.username, stank, barraPorcentagem))
            .setThumbnail(thumbnailAleatorio);
        if (stank === 100) {
            embed.setFooter({ text: await translate("stank", "maxStank") });
        }
        await message.reply({ embeds: [embed] });
        log(message, `${user.username} é ${stank}% fedido(a)`);
        updateRecord(message.guild.id, message.guild.name, user.id, user.username, "max_stank", stank);
    } catch (err) {
        error(message, `Erro ao executar comando: ${err.message}`);
        const errEmbed = monkeyEmbed(await translate("stank", "error"));
        await message.reply({ embeds: [errEmbed] });
    }
}

function generateProgressBar(percent) {
    const progressChars = 10;
    const filledBlocks = Math.floor((percent / 100) * progressChars);
    const emptyBlocks = progressChars - filledBlocks;
    const progressBar = "▰".repeat(filledBlocks) + "▱".repeat(emptyBlocks);
    return progressBar;
}

module.exports = {
    execute,
};