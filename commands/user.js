const { EmbedBuilder } = require("discord.js");
const { getLanguagePreference, getUserRecords } = require("../database");
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
        const [languagePreference, records] = await Promise.all([
            getLanguagePreference(guildId),
            getUserRecords(guildId, user.id),
        ]);
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
        const fields = [];
        if (records) {
            if (records.max_stank !== null && records.max_stank !== undefined)
                fields.push({ name: await translate("user", "record stank"), value: `${records.max_stank}%`, inline: true });
            if (records.max_howgay !== null && records.max_howgay !== undefined)
                fields.push({ name: await translate("user", "record howgay"), value: `${records.max_howgay}%`, inline: true });
            if (records.max_simp !== null && records.max_simp !== undefined)
                fields.push({ name: await translate("user", "record simp"), value: `${records.max_simp}%`, inline: true });
            if (records.max_pp !== null && records.max_pp !== undefined)
                fields.push({ name: await translate("user", "record pp"), value: `${records.max_pp_string} (${records.max_pp} cm)`, inline: true });
        }

        const description = fields.length > 0
            ? `${await translate("user", "setDescription", joinedAt)}\n\n${await translate("user", "records title")}`
            : await translate("user", "setDescription", joinedAt);

        const embed = new EmbedBuilder()
            .setTitle(user.username)
            .setDescription(description)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }));

        if (fields.length > 0) embed.addFields(fields);

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