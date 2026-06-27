const { EmbedBuilder } = require("discord.js");
const { getLanguagePreference } = require("../database");
const { log, error } = require("../utils");

async function execute(message, _args, _db, translate) {
    try {
        let user = message.mentions.users.first() || message.author;
        let member = message.guild.members.cache.get(user.id);
        if (!member) {
            try {
                member = await message.guild.members.fetch(user.id);
            } catch {
                const errorEmbed = new EmbedBuilder()
                    .setDescription(await translate("user", "member not found"));
                return message.reply({ embeds: [errorEmbed] });
            }
        }
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
        const embed = new EmbedBuilder()
            .setTitle(user.username)
            .setDescription(await translate("user", "setDescription", joinedAt))
            .setThumbnail(user.displayAvatarURL({ dynamic: true }));
        await message.reply({ embeds: [embed] });
        log(message, `Comando executado`);
    } catch (err) {
        error(message, `Erro ao executar comando: ${err.message}`);
        const errorEmbed = new EmbedBuilder()
            .setDescription(await translate("user", "error"));
        await message.reply({ embeds: [errorEmbed] });
    }
}

module.exports = {
    execute,
};