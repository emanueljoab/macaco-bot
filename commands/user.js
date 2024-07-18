const { EmbedBuilder } = require("discord.js");
const { getLanguagePreference } = require("../database");

async function execute(message, __, __, translate) {
    let user = message.mentions.users.first() || message.author;
    let member = message.guild.members.cache.get(user.id);

    const guildId = message.guild.id;
    const languagePreference = await getLanguagePreference(guildId);
    const timeZone = languagePreference === "english" ? "UTC" : "America/Sao_Paulo";

    const options = {
        timeZone: timeZone,
        timeZoneName: "short",
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
    };

    const joinedAt = member.joinedAt.toLocaleString(await translate("server", "toLocaleString"), options);

    const Embed = new EmbedBuilder()
        .setTitle(user.username)
        .setDescription(await translate("user", "setDescription", joinedAt))
        .setThumbnail(user.displayAvatarURL({ dynamic: true }));
    await message.reply({ embeds: [Embed] });
    console.log(`${new Date().toLocaleString("pt-BR")} | Comando 'user' executado (${message.author.username})`);
}

module.exports = {
    execute,
};
