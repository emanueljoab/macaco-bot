const { EmbedBuilder } = require("discord.js");
const { error } = require("../utils");

async function execute(message, args, db, translate) {
    try {
        const guildId = message.guild.id;

        db.all("SELECT user_id, username, wins, losses FROM jokenpo_rank WHERE guild_id = ? AND user_id != '1243673463902834809' ORDER BY wins DESC LIMIT 10", [guildId], async (err, rows) => {
            if (err) {
                error(message, `Erro ao obter o ranking do banco de dados: ${err.message}`);
                const rankErrEmbed = new EmbedBuilder().setDescription(await translate("rank", "error"));
                return message.reply({ embeds: [rankErrEmbed] });
            }

            const medals = ["🥇", "🥈", "🥉"];
            const rankings = await Promise.all(
                rows.map(async (row, index) => {
                    const user = message.guild.members.cache.get(row.user_id);
                    const username = row.username || (user ? escapeMarkdown(user.displayName) : await translate("rank", "unknown user"));
                    const prefix = medals[index] ?? `${index + 1}.`;
                    const total = row.wins + row.losses;
                    const winRate = total > 0 ? Math.round((row.wins / total) * 100) : 0;
                    return await translate("rank", "entry", prefix, username, row.wins, row.losses, winRate);
                })
            );

            const embed = new EmbedBuilder()
                .setTitle(await translate("rank", "title"))
                .setDescription(rankings.join("\n") || (await translate("rank", "empty")));

            message.reply({ embeds: [embed] });
        });
    } catch (err) {
        error(message, `Erro ao executar o comando rank: ${err.message}`);
    }
}

module.exports = { execute };

function escapeMarkdown(text) {
    return text.replace(/([\\*_`~])/g, "\\$1");
}
