const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

async function execute(message, args, db, translate) {
    try {
        if (args.length > 1 || (args.length === 1 && args[0].toLowerCase() !== "rank" && !args[0].startsWith("<@") && !args[0].endsWith(">"))) {
            return;
        }
        if (args.length > 0 && args[0].toLowerCase() === "rank") {
            const guildId = message.guild.id;

            db.all("SELECT user_id, username, wins, losses FROM jokenpo_rank WHERE guild_id = ? ORDER BY wins DESC LIMIT 10", [guildId], async (err, rows) => {
                if (err) {
                    console.error("Erro ao obter o ranking do banco de dados:");
                    return message.reply(await translate("jokenpo", "reply rank error"));
                }

                const rankings = await Promise.all(
                    rows.map(async (row, index) => {
                        const user = message.guild.members.cache.get(row.user_id);
                        const username = row.username || (user ? escapeMarkdown(user.displayName) : await translate("jokenpo", "unknown user"));
                        return await translate("jokenpo", "users rank", index + 1, username, row.wins, row.losses);
                    })
                );

                const embed = new EmbedBuilder().setTitle(await translate("jokenpo", "jokenpo ranking")).setDescription(rankings.join("\n") || (await translate("jokenpo", "no rank data")));

                message.reply({ embeds: [embed] });
            });
        } else {
            const player1 = message.author;
            let player2 = message.mentions.users.first();

            if (!player2) {
                player2 = {
                    username: "Gerador de Macaco Aleatório",
                    id: "1243673463902834809",
                };
            }
            
            if (player1.id === player2.id) {
                return message.reply(await translate("jokenpo", "yourself"));
            }

            const isBotGame = player2.id === "1243673463902834809";
            const [sortedPlayer1, sortedPlayer2] = isBotGame ? [player1, player2] : player1.id < player2.id ? [player1, player2] : [player2, player1];

            const embed = new EmbedBuilder()
                .setTitle(await translate("jokenpo", "jokenpo"))
                .setDescription(await translate("jokenpo", "challenge", escapeMarkdown(player1.username), escapeMarkdown(player2.username)));

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(await translate("jokenpo", "id rock"))
                    .setLabel(await translate("jokenpo", "label rock"))
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(await translate("jokenpo", "id paper"))
                    .setLabel(await translate("jokenpo", "label paper"))
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(await translate("jokenpo", "id scissors"))
                    .setLabel(await translate("jokenpo", "label scissors"))
                    .setStyle(ButtonStyle.Danger)
            );

            const reply = await message.reply({
                embeds: [embed],
                components: [row],
            });

            const filter = (interaction) => interaction.isButton() && [sortedPlayer1.id, sortedPlayer2.id].includes(interaction.user.id);

            const collector = reply.createMessageComponentCollector({
                filter,
                time: 60000,
            });

            const choices = {};
            let resultado = "";
            let gameDecided = false; // Controle de estado para evitar múltiplas atualizações

            collector.on("collect", async (interaction) => {
                if (gameDecided) return; // Evita múltiplas interações após a decisão do jogo

                choices[interaction.user.id] = interaction.customId;
                await interaction.deferUpdate();

                if (Object.keys(choices).length < 2) {
                    const jogadorEsperando = [sortedPlayer1, sortedPlayer2].find((player) => !choices[player.id]);

                    embed.setDescription(
                        await translate("jokenpo", "waiting", escapeMarkdown(sortedPlayer1.username), escapeMarkdown(sortedPlayer2.username), escapeMarkdown(jogadorEsperando.username))
                    );

                    await reply.edit({ embeds: [embed] });
                }

                if (sortedPlayer2.id === "1243673463902834809") {
                    const opcoes = await translate("jokenpo", "options");
                    choices[sortedPlayer2.id] = opcoes[Math.floor(Math.random() * 3)];
                }

                if (Object.keys(choices).length === 2 && !gameDecided) {
                    gameDecided = true; // Marca que o jogo foi decidido
                    collector.stop();

                    if (choices[sortedPlayer1.id] === choices[sortedPlayer2.id]) {
                        resultado = await translate("jokenpo", "tie");
                        console.log(`${new Date().toLocaleString("pt-BR")} | Jokenpo: Empate entre ${sortedPlayer1.username} e ${sortedPlayer2.username}`);
                    } else if (
                        (choices[sortedPlayer1.id] === (await translate("jokenpo", "id rock")) && choices[sortedPlayer2.id] === (await translate("jokenpo", "id scissors"))) ||
                        (choices[sortedPlayer1.id] === (await translate("jokenpo", "id paper")) && choices[sortedPlayer2.id] === (await translate("jokenpo", "id rock"))) ||
                        (choices[sortedPlayer1.id] === (await translate("jokenpo", "id scissors")) && choices[sortedPlayer2.id] === (await translate("jokenpo", "id paper")))
                    ) {
                        resultado = await translate("jokenpo", "player 1 win", escapeMarkdown(sortedPlayer1.username));
                        console.log(`${new Date().toLocaleString("pt-BR")} | Jokenpo: ${sortedPlayer1.username} venceu ${sortedPlayer2.username}`);
                    } else {
                        resultado = await translate("jokenpo", "player 2 win", escapeMarkdown(sortedPlayer2.username));
                        console.log(`${new Date().toLocaleString("pt-BR")} | Jokenpo: ${sortedPlayer2.username} venceu ${sortedPlayer1.username}`);
                    }

                    embed.setDescription(
                        await translate(
                            "jokenpo",
                            "choices",
                            escapeMarkdown(sortedPlayer1.username),
                            choices[sortedPlayer1.id],
                            escapeMarkdown(sortedPlayer2.username),
                            choices[sortedPlayer2.id],
                            resultado
                        )
                    );

                    const guildId = message.guild.id;

                    let historyMessage = await translate("jokenpo", "no history");
                    if (resultado.includes(escapeMarkdown(sortedPlayer1.username))) {
                        historyMessage = await atualizarHistorico(sortedPlayer1.id, sortedPlayer2.id, sortedPlayer1.username, sortedPlayer2.username, 1, 0);
                        atualizarPontuacao(guildId, sortedPlayer1.id, sortedPlayer1.username, 1, 0);
                        atualizarPontuacao(guildId, sortedPlayer2.id, sortedPlayer2.username, 0, 1);
                    } else if (resultado.includes(escapeMarkdown(sortedPlayer2.username))) {
                        historyMessage = await atualizarHistorico(sortedPlayer1.id, sortedPlayer2.id, sortedPlayer1.username, sortedPlayer2.username, 0, 1);
                        atualizarPontuacao(guildId, sortedPlayer2.id, sortedPlayer2.username, 1, 0);
                        atualizarPontuacao(guildId, sortedPlayer1.id, sortedPlayer1.username, 0, 1);
                    } else {
                        historyMessage = await atualizarHistorico(sortedPlayer1.id, sortedPlayer2.id, sortedPlayer1.username, sortedPlayer2.username, 0, 0);
                    }

                    if (historyMessage) {
                        embed.setFooter({ text: historyMessage });
                    } else {
                        embed.setFooter({
                            text: await translate("jokenpo", "no history"),
                        });
                    }

                    await reply.edit({ embeds: [embed], components: [] });
                }
            });

            collector.on("end", async (collected, reason) => {
                if (reason === "time" && !gameDecided) {
                    embed.setDescription(await translate("jokenpo", "time up"));
                    reply.edit({ embeds: [embed], components: [] });
                }
            });

            function atualizarPontuacao(guildId, userId, username, winsToAdd, lossesToAdd) {
                db.run("INSERT OR IGNORE INTO jokenpo_rank (guild_id, user_id, username, wins, losses) VALUES (?, ?, ?, 0, 0)", [guildId, userId, username]);
                db.run("UPDATE jokenpo_rank SET wins = wins + ?, losses = losses + ? WHERE guild_id = ? AND user_id = ?", [winsToAdd, lossesToAdd, guildId, userId], function (err) {
                    if (err) {
                        console.error("Erro ao atualizar a pontuação:", err);
                    }
                });
            }

            function atualizarHistorico(player1Id, player2Id, player1Username, player2Username, player1WinsToAdd, player2WinsToAdd) {
                return new Promise((resolve, reject) => {
                    db.serialize(() => {
                        db.run(
                            `INSERT OR IGNORE INTO jokenpo_history (player1_id, player2_id, player1_username, player2_username, player1_wins, player2_wins)
                                VALUES (?, ?, ?, ?, 0, 0)`,
                            [player1Id, player2Id, player1Username, player2Username],
                            function (err) {
                                if (err) {
                                    console.error("Erro ao inserir no histórico:", err);
                                    reject(err);
                                }
                            }
                        );

                        db.run(
                            `UPDATE jokenpo_history
                                SET player1_wins = player1_wins + ?, player2_wins = player2_wins + ?
                                WHERE player1_id = ? AND player2_id = ?`,
                            [player1WinsToAdd, player2WinsToAdd, player1Id, player2Id],
                            function (err) {
                                if (err) {
                                    console.error("Erro ao atualizar o histórico:", err);
                                    reject(err);
                                } else {
                                    db.get(
                                        `SELECT player1_wins, player2_wins
                                            FROM jokenpo_history
                                            WHERE player1_id = ? AND player2_id = ?`,
                                        [player1Id, player2Id],
                                        async (err, row) => {
                                            if (err) {
                                                console.error("Erro ao obter o histórico atualizado:", err);
                                                reject(err);
                                            } else if (row) {
                                                const historyMessage = await translate("jokenpo", "score", player1Username, row.player1_wins, row.player2_wins, player2Username);
                                                resolve(historyMessage);
                                            } else {
                                                resolve(await translate("jokenpo", "no history"));
                                            }
                                        }
                                    );
                                }
                            }
                        );
                    });
                });
            }
        }
    } catch (error) {
        console.error("Ocorreu um erro ao executar o comando jokenpo:", error);
        message.reply(await translate("jokenpo", "error jokenpo"));
    }
}

module.exports = {
    execute,
};

function escapeMarkdown(text) {
    return text.replace(/([\\*_`~])/g, "\\$1");
}
