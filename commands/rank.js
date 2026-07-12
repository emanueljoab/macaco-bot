const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { log, warn, error } = require("../utils");

const BOT_ID = "1243673463902834809";
const Z = 1.96; // 95% de confiança

// Limite inferior do intervalo de Wilson: ordenar por vitórias "confiáveis", não só pela taxa bruta
function wilsonScore(wins, losses) {
    const n = wins + losses;
    if (n === 0) return 0;

    const phat = wins / n;
    const z2 = Z * Z;

    return (phat + z2 / (2 * n) - Z * Math.sqrt((phat * (1 - phat) + z2 / (4 * n)) / n)) / (1 + z2 / n);
}

function sortRows(rows, mode) {
    const sorted = [...rows];
    if (mode === "best") {
        sorted.sort((a, b) => wilsonScore(b.wins, b.losses) - wilsonScore(a.wins, a.losses));
    } else {
        sorted.sort((a, b) => b.wins - a.wins || a.losses - b.losses);
    }
    return sorted.slice(0, 10);
}

async function buildRankEmbed(rows, mode, message, translate) {
    const medals = ["🥇", "🥈", "🥉"];
    const sorted = sortRows(rows, mode);

    const rankings = await Promise.all(
        sorted.map(async (row, index) => {
            const user = message.guild.members.cache.get(row.user_id);
            const username = row.username || (user ? escapeMarkdown(user.displayName) : await translate("rank", "unknown user"));
            const prefix = medals[index] ?? `${index + 1}.`;

            if (mode === "best") {
                return await translate("rank", "entry best", prefix, username, row.wins, row.losses);
            }

            const total = row.wins + row.losses;
            const winRate = total > 0 ? Math.round((row.wins / total) * 100) : 0;
            return await translate("rank", "entry", prefix, username, row.wins, row.losses, winRate);
        })
    );

    const embed = new EmbedBuilder()
        .setTitle(await translate("rank", mode === "best" ? "title best" : "title wins"))
        .setDescription(rankings.join("\n") || (await translate("rank", "empty")));

    if (mode === "best") {
        embed.setFooter({ text: await translate("rank", "footer best") });
    }

    return embed;
}

async function buildRankRow(mode, translate) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("rank_best")
            .setLabel(await translate("rank", "button best"))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(mode === "best"),
        new ButtonBuilder()
            .setCustomId("rank_wins")
            .setLabel(await translate("rank", "button wins"))
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(mode === "wins")
    );
}

async function execute(message, args, db, translate) {
    try {
        const guildId = message.guild.id;

        db.all(
            "SELECT user_id, username, wins, losses FROM jokenpo_rank WHERE guild_id = ? AND user_id != ?",
            [guildId, BOT_ID],
            async (err, rows) => {
                if (err) {
                    error(message, `Erro ao obter o ranking do banco de dados: ${err.message}`);
                    const rankErrEmbed = new EmbedBuilder().setDescription(await translate("rank", "error"));
                    return message.reply({ embeds: [rankErrEmbed] });
                }

                let mode = "best";
                const embed = await buildRankEmbed(rows, mode, message, translate);
                const row = await buildRankRow(mode, translate);

                const reply = await message.reply({ embeds: [embed], components: [row] });
                log(message, `Ranking exibido`);

                const collector = reply.createMessageComponentCollector({
                    filter: (interaction) => interaction.isButton() && ["rank_wins", "rank_best"].includes(interaction.customId),
                    time: 300000,
                });

                collector.on("collect", async (interaction) => {
                    try {
                        const newMode = interaction.customId === "rank_best" ? "best" : "wins";
                        if (newMode === mode) return interaction.deferUpdate();

                        mode = newMode;
                        const newEmbed = await buildRankEmbed(rows, mode, message, translate);
                        const newRow = await buildRankRow(mode, translate);
                        await interaction.update({ embeds: [newEmbed], components: [newRow] });
                    } catch (err) {
                        if (err.code !== 10062) {
                            error(message, `Erro no collector do rank: ${err.message}`);
                        }
                    }
                });

                collector.on("end", async () => {
                    try {
                        await reply.edit({ components: [] });
                    } catch (err) {
                        if (err.code !== 10008) {
                            warn(message, `Não foi possível remover os botões do rank: ${err.message}`);
                        }
                    }
                });
            }
        );
    } catch (err) {
        error(message, `Erro ao executar o comando rank: ${err.message}`);
    }
}

module.exports = { execute };

function escapeMarkdown(text) {
    return text.replace(/([\\*_`~])/g, "\\$1");
}
