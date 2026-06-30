const { EmbedBuilder } = require("discord.js");
const { getLanguagePreference, getUserRecords } = require("../database");
const { log, error } = require("../utils");

async function execute(message, _args, db, translate) {
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
        const [languagePreference, records, jokenpoRow, biggestVictimRow] = await Promise.all([
            getLanguagePreference(guildId),
            getUserRecords(guildId, user.id),
            new Promise((resolve, reject) => {
                db.get(
                    "SELECT wins, losses FROM jokenpo_rank WHERE guild_id = ? AND user_id = ?",
                    [guildId, user.id],
                    (err, row) => { if (err) reject(err); else resolve(row || null); }
                );
            }),
            new Promise((resolve, reject) => {
                db.get(
                    `SELECT
                        CASE WHEN player1_id = ? THEN player2_id ELSE player1_id END as opponent_id,
                        CASE WHEN player1_id = ? THEN player2_username ELSE player1_username END as opponent_username,
                        CASE WHEN player1_id = ? THEN player1_wins ELSE player2_wins END as user_wins,
                        CASE WHEN player1_id = ? THEN player2_wins ELSE player1_wins END as opp_wins
                    FROM jokenpo_history
                    WHERE (player1_id = ? OR player2_id = ?) AND (player1_wins + player2_wins) > 0
                    ORDER BY CAST(CASE WHEN player1_id = ? THEN player1_wins ELSE player2_wins END AS REAL) / (player1_wins + player2_wins) DESC
                    LIMIT 1`,
                    [user.id, user.id, user.id, user.id, user.id, user.id, user.id],
                    (err, row) => { if (err) reject(err); else resolve(row || null); }
                );
            }),
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
        const dash = "—";
        const fields = [
            { name: await translate("user", "record stank"),  value: records?.max_stank  != null ? `${records.max_stank}%`  : dash, inline: true },
            { name: await translate("user", "record howgay"), value: records?.max_howgay != null ? `${records.max_howgay}%` : dash, inline: true },
            { name: await translate("user", "record simp"),   value: records?.max_simp   != null ? `${records.max_simp}%`   : dash, inline: true },
            { name: await translate("user", "record pp"),     value: records?.max_pp     != null ? `${records.max_pp_string} (${records.max_pp} cm)` : dash, inline: true },
        ];

        let jokenpoValue;
        if (jokenpoRow) {
            const total = jokenpoRow.wins + jokenpoRow.losses;
            const rate = total > 0 ? Math.round((jokenpoRow.wins / total) * 100) : 0;
            jokenpoValue = await translate("user", "jokenpo field value", jokenpoRow.wins, jokenpoRow.losses, rate);
        } else {
            jokenpoValue = dash;
        }
        fields.push({ name: await translate("user", "jokenpo field name"), value: jokenpoValue, inline: true });

        let biggestVictimValue;
        if (biggestVictimRow) {
            const total = biggestVictimRow.user_wins + biggestVictimRow.opp_wins;
            const rate = total > 0 ? Math.round((biggestVictimRow.user_wins / total) * 100) : 0;
            biggestVictimValue = await translate("user", "biggest victim value", biggestVictimRow.opponent_username, rate);
        } else {
            biggestVictimValue = dash;
        }
        fields.push({ name: await translate("user", "biggest victim name"), value: biggestVictimValue, inline: true });

        const description = await translate("user", "setDescription", joinedAt);

        const embed = new EmbedBuilder()
            .setTitle(user.username)
            .setDescription(description)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(fields);

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