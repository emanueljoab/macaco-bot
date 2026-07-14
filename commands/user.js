const { EmbedBuilder } = require("discord.js");
const { getLanguagePreference, getUserRecords, RECORD_MAX } = require("../database");
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
                    WHERE (player1_id = ? OR player2_id = ?) AND (player1_wins + player2_wins) >= 5
                    AND player1_id != '1243673463902834809' AND player2_id != '1243673463902834809'
                    ORDER BY (player1_wins + player2_wins) DESC
                    LIMIT 1`,
                    [user.id, user.id, user.id, user.id, user.id, user.id],
                    (err, row) => { if (err) reject(err); else resolve(row || null); }
                );
            }),
        ]);
        const timeZone = languagePreference === "english" ? "UTC" : "America/Sao_Paulo";
        const options = {
            timeZone: timeZone,
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
        };
        const joinedAt = member.joinedAt.toLocaleString(await translate("server", "toLocaleString"), options);
        const dash = "—";
        // Mesma regra do rank: (Nx) quando atingiu o valor máximo mais de uma vez
        const recordValue = (column, suffix) => {
            if (records?.[column] == null) return dash;
            let value = `${records[column]}${suffix}`;
            const count = records[`${column}_count`] || 0;
            if (records[column] === RECORD_MAX[column] && count > 1) value += ` (${count}x)`;
            return value;
        };
        const fields = [
            { name: await translate("user", "record pp"),     value: recordValue("max_pp", " cm"), inline: true },
            { name: await translate("user", "record howgay"), value: recordValue("max_howgay", "%"), inline: true },
            { name: await translate("user", "record simp"),   value: recordValue("max_simp", "%"), inline: true },
            { name: await translate("user", "record stank"),  value: recordValue("max_stank", "%"), inline: true },
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
            const { user_wins, opp_wins, opponent_username } = biggestVictimRow;
            let rivalKey;
            if (user_wins > opp_wins) rivalKey = "biggest rival winning";
            else if (user_wins < opp_wins) rivalKey = "biggest rival losing";
            else rivalKey = "biggest rival tied";
            biggestVictimValue = await translate("user", rivalKey, opponent_username, user_wins, opp_wins, user.username);
        } else {
            biggestVictimValue = dash;
        }
        fields.push({ name: await translate("user", "biggest rival name"), value: biggestVictimValue, inline: true });

        const description = await translate("user", "setDescription", joinedAt);

        const embed = new EmbedBuilder()
            .setTitle(user.username)
            .setDescription(description)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(fields);

        await message.reply({ embeds: [embed] });
        log(message, `Perfil de ${user.username} exibido`);
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