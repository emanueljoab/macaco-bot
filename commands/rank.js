const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { log, warn, error } = require("../utils");

const BOT_ID = "1243673463902834809";

// Modos que leem recordes da tabela user_records (o modo wins lê de jokenpo_rank)
const RECORD_COLUMNS = {
    pp: "max_pp",
    howgay: "max_howgay",
    simp: "max_simp",
    stank: "max_stank",
};

function sortRows(rows, mode) {
    const column = RECORD_COLUMNS[mode];
    if (column) {
        // Desempate: quem atingiu o valor primeiro; recordes sem timestamp
        // (anteriores à migração) ficam por último até carimbarem a data
        const atColumn = `${column}_at`;
        return rows
            .filter((row) => row[column] != null)
            .sort((a, b) => {
                if (b[column] !== a[column]) return b[column] - a[column];
                if (a[atColumn] == null) return b[atColumn] == null ? 0 : 1;
                if (b[atColumn] == null) return -1;
                return a[atColumn] - b[atColumn];
            })
            .slice(0, 10);
    }

    return [...rows]
        .sort((a, b) => b.wins - a.wins || a.losses - b.losses)
        .slice(0, 10);
}

async function buildRankEmbed(rows, mode, message, translate) {
    const medals = ["🥇", "🥈", "🥉"];
    const sorted = sortRows(rows, mode);

    const rankings = await Promise.all(
        sorted.map(async (row, index) => {
            const user = message.guild.members.cache.get(row.user_id);
            const username = row.username || (user ? escapeMarkdown(user.displayName) : await translate("rank", "unknown user"));
            const prefix = medals[index] ?? `${index + 1}.`;

            const column = RECORD_COLUMNS[mode];
            if (column) {
                const entry = await translate("rank", mode === "pp" ? "entry pp" : "entry percent", prefix, username, row[column]);
                // <t:...:R> renderiza como data relativa no idioma/fuso de cada leitor
                const at = row[`${column}_at`];
                return at != null ? `${entry} · <t:${Math.floor(at / 1000)}:R>` : entry;
            }

            const total = row.wins + row.losses;
            const winRate = total > 0 ? Math.round((row.wins / total) * 100) : 0;
            return await translate("rank", "entry", prefix, username, row.wins, row.losses, winRate);
        })
    );

    return new EmbedBuilder()
        .setTitle(await translate("rank", `title ${mode}`))
        .setDescription(rankings.join("\n") || (await translate("rank", "empty")));
}

async function buildRankRows(mode, translate) {
    // O botão do rank exibido fica azul (Primary) e desabilitado; os demais, cinza
    const buildButton = async (key) =>
        new ButtonBuilder()
            .setCustomId(`rank_${key}`)
            .setLabel(await translate("rank", `button ${key}`))
            .setStyle(mode === key ? ButtonStyle.Primary : ButtonStyle.Secondary)
            .setDisabled(mode === key);

    const row = new ActionRowBuilder().addComponents(
        await Promise.all(["wins", ...Object.keys(RECORD_COLUMNS)].map(buildButton))
    );

    return [row];
}

function queryAll(db, sql, params) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
}

async function execute(message, args, db, translate) {
    try {
        const guildId = message.guild.id;

        let jokenpoRows, recordRows;
        try {
            [jokenpoRows, recordRows] = await Promise.all([
                queryAll(db, "SELECT user_id, username, wins, losses FROM jokenpo_rank WHERE guild_id = ? AND user_id != ?", [guildId, BOT_ID]),
                queryAll(db, "SELECT user_id, username, max_pp, max_pp_at, max_howgay, max_howgay_at, max_simp, max_simp_at, max_stank, max_stank_at FROM user_records WHERE guild_id = ?", [guildId]),
            ]);
        } catch (err) {
            error(message, `Erro ao obter o ranking do banco de dados: ${err.message}`);
            const rankErrEmbed = new EmbedBuilder().setDescription(await translate("rank", "error"));
            return message.reply({ embeds: [rankErrEmbed] });
        }

        const rowsFor = (m) => (RECORD_COLUMNS[m] ? recordRows : jokenpoRows);

        let mode = "wins";
        const embed = await buildRankEmbed(rowsFor(mode), mode, message, translate);
        const components = await buildRankRows(mode, translate);

        const reply = await message.reply({ embeds: [embed], components });
        log(message, `Ranking exibido`);

        const collector = reply.createMessageComponentCollector({
            filter: (interaction) => interaction.isButton() && interaction.customId.startsWith("rank_"),
            time: 300000,
        });

        collector.on("collect", async (interaction) => {
            try {
                const newMode = interaction.customId.slice("rank_".length);
                if (newMode === mode) return interaction.deferUpdate();

                mode = newMode;
                const newEmbed = await buildRankEmbed(rowsFor(mode), mode, message, translate);
                const newComponents = await buildRankRows(mode, translate);
                await interaction.update({ embeds: [newEmbed], components: newComponents });
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
    } catch (err) {
        error(message, `Erro ao executar o comando rank: ${err.message}`);
    }
}

module.exports = { execute, sortRows, buildRankEmbed };

function escapeMarkdown(text) {
    return text.replace(/([\\*_`~])/g, "\\$1");
}
