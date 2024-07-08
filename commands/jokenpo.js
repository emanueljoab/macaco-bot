// jokenpo.js

const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

module.exports = {
    async execute(message, args, db) {
        try {
            if (
                args.length > 1 ||
                (args.length === 1 &&
                    args[0].toLowerCase() !== "rank" &&
                    !args[0].startsWith("<@") &&
                    !args[0].endsWith(">"))
            ) {
                return;
            }
            if (args.length > 0 && args[0].toLowerCase() === "rank") {
                const guildId = message.guild.id;

                db.all(
                    "SELECT user_id, username, wins, losses FROM jokenpo_rank WHERE guild_id = ? ORDER BY wins DESC LIMIT 10",
                    [guildId],
                    (err, rows) => {
                        if (err) {
                            console.error(
                                "Erro ao obter o ranking do banco de dados:",
                                err
                            );
                            return message.reply(
                                "Ocorreu um erro ao obter o ranking."
                            );
                        }

                        const embed = new EmbedBuilder()
                            .setTitle("Ranking Jokenpo")
                            .setDescription(
                                rows
                                    .map((row, index) => {
                                        const user =
                                            message.guild.members.cache.get(
                                                row.user_id
                                            );
                                        const username =
                                            row.username ||
                                            (user
                                                ? user.displayName
                                                : "Usuário Desconhecido");
                                        return `${index + 1}. ${username}: ${
                                            row.wins
                                        } vitórias, ${row.losses} derrotas`;
                                    })
                                    .join("\n") ||
                                    "Nenhum dado de ranking encontrado."
                            );

                        message.reply({ embeds: [embed] });
                    }
                );
            } else {
                const player1 = message.author;
                let player2 = message.mentions.users.first();

                if (!player2) {
                    player2 = {
                        username: "Gerador de Macaco Aleatório",
                        id: "1243673463902834809",
                    };
                }

                const isBotGame = player2.id === "1243673463902834809";
                const [sortedPlayer1, sortedPlayer2] = isBotGame
                    ? [player1, player2]
                    : player1.id < player2.id
                    ? [player1, player2]
                    : [player2, player1];

                const embed = new EmbedBuilder()
                    .setTitle("Jokenpo")
                    .setDescription(
                        `${sortedPlayer1.username} desafiou ${sortedPlayer2.username} para um jogo de Jokenpo!`
                    );

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("pedra \u{1F44A}")
                        .setLabel("\u{1F44A} Pedra")
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId("papel \u{270B}")
                        .setLabel("\u{270B} Papel")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId("tesoura \u{270C}")
                        .setLabel("\u{270C} Tesoura")
                        .setStyle(ButtonStyle.Danger)
                );

                const reply = await message.reply({
                    embeds: [embed],
                    components: [row],
                });

                const filter = (interaction) =>
                    interaction.isButton() &&
                    [sortedPlayer1.id, sortedPlayer2.id].includes(interaction.user.id);

                const collector = reply.createMessageComponentCollector({
                    filter,
                    time: 60000,
                });

                const choices = {};
                let resultado = "";

                collector.on("collect", async (interaction) => {
                    choices[interaction.user.id] = interaction.customId;
                    await interaction.deferUpdate();

                    if (Object.keys(choices).length < 2) {
                        const jogadorEsperando = [sortedPlayer1, sortedPlayer2].find(
                            (player) => !choices[player.id]
                        );

                        embed.setDescription(
                            `${sortedPlayer1.username} desafiou ${sortedPlayer2.username} para um jogo de Jokenpo!\n*Aguardando a resposta de ${jogadorEsperando.username}...*`
                        );
                        await reply.edit({ embeds: [embed] });
                    }

                    if (sortedPlayer2.id === "1243673463902834809") {
                        const opcoes = [
                            "pedra \u{1F44A}",
                            "papel \u{270B}",
                            "tesoura \u{270C}",
                        ];
                        choices[sortedPlayer2.id] =
                            opcoes[Math.floor(Math.random() * 3)];
                    }

                    if (Object.keys(choices).length === 2) {
                        collector.stop();

                        if (choices[sortedPlayer1.id] === choices[sortedPlayer2.id]) {
                            resultado = "**Empate!**";
                        } else if (
                            (choices[sortedPlayer1.id] === "pedra \u{1F44A}" &&
                                choices[sortedPlayer2.id] === "tesoura \u{270C}") ||
                            (choices[sortedPlayer1.id] === "papel \u{270B}" &&
                                choices[sortedPlayer2.id] === "pedra \u{1F44A}") ||
                            (choices[sortedPlayer1.id] === "tesoura \u{270C}" &&
                                choices[sortedPlayer2.id] === "papel \u{270B}")
                        ) {
                            resultado = `**${sortedPlayer1.username.replace(
                                /_/g,
                                "\\_"
                            )} venceu!**`;
                        } else {
                            resultado = `**${sortedPlayer2.username.replace(
                                /_/g,
                                "\\_"
                            )} venceu!**`;
                        }

                        embed.setDescription(
                            `${sortedPlayer1.username} escolheu ${
                                choices[sortedPlayer1.id]
                            }\n${sortedPlayer2.username} escolheu ${
                                choices[sortedPlayer2.id]
                            }\n\n${resultado}`
                        );

                        const guildId = message.guild.id;

                        let historyMessage = "Histórico não disponível.";
                        if (resultado.includes(sortedPlayer1.username)) {
                            historyMessage = await atualizarHistorico(
                                sortedPlayer1.id,
                                sortedPlayer2.id,
                                sortedPlayer1.username,
                                sortedPlayer2.username,
                                1,
                                0
                            );
                            atualizarPontuacao(
                                guildId,
                                sortedPlayer1.id,
                                sortedPlayer1.username,
                                1,
                                0
                            );
                            if (sortedPlayer2.id !== "Gerador de Macaco Aleatório") {
                                atualizarPontuacao(
                                    guildId,
                                    sortedPlayer2.id,
                                    sortedPlayer2.username,
                                    0,
                                    1
                                );
                            }
                        } else if (resultado.includes(sortedPlayer2.username)) {
                            historyMessage = await atualizarHistorico(
                                sortedPlayer1.id,
                                sortedPlayer2.id,
                                sortedPlayer1.username,
                                sortedPlayer2.username,
                                0,
                                1
                            );
                            atualizarPontuacao(
                                guildId,
                                sortedPlayer2.id,
                                sortedPlayer2.username,
                                1,
                                0
                            );
                            if (sortedPlayer2.id !== "Gerador de Macaco Aleatório") {
                                atualizarPontuacao(
                                    guildId,
                                    sortedPlayer1.id,
                                    sortedPlayer1.username,
                                    0,
                                    1
                                );
                            }
                        } else {
                            historyMessage = await atualizarHistorico(
                                sortedPlayer1.id,
                                sortedPlayer2.id,
                                sortedPlayer1.username,
                                sortedPlayer2.username,
                                0,
                                0
                            );
                        }

                        if (historyMessage) {
                            embed.setFooter({ text: historyMessage });
                        } else {
                            embed.setFooter({ text: "Histórico não disponível." });
                        }
                        
                        await reply.edit({ embeds: [embed], components: [] });
                    }
                });

                collector.on("end", (collected, reason) => {
                    if (reason === "time") {
                        embed.setDescription(
                            "Tempo esgotado! Um ou mais jogadores não escolheram a tempo."
                        );
                        reply.edit({ embeds: [embed], components: [] });
                    }
                });

                function atualizarPontuacao(
                    guildId,
                    userId,
                    username,
                    winsToAdd,
                    lossesToAdd
                ) {
                    console.log(
                        `Atualizando pontuação para guildId: ${guildId}, userId: ${userId}, wins: ${winsToAdd}, losses: ${lossesToAdd}`
                    );
                    db.run(
                        "INSERT OR IGNORE INTO jokenpo_rank (guild_id, user_id, username, wins, losses) VALUES (?, ?, ?, 0, 0)",
                        [guildId, userId, username]
                    );
                    db.run(
                        "UPDATE jokenpo_rank SET wins = wins + ?, losses = losses + ? WHERE guild_id = ? AND user_id = ?",
                        [winsToAdd, lossesToAdd, guildId, userId],
                        function (err) {
                            if (err) {
                                console.error(
                                    "Erro ao atualizar a pontuação:",
                                    err
                                );
                            } else {
                                console.log(
                                    "Pontuação atualizada com sucesso!"
                                );
                            }
                        }
                    );
                }

                function atualizarHistorico(player1Id, player2Id, player1Username, player2Username, player1WinsToAdd, player2WinsToAdd) {
                    return new Promise((resolve, reject) => {
                        // Garante que "Gerador de Macaco Aleatório" esteja sempre em player2
                        if (player1Id === "1243673463902834809") {
                            [player1Id, player2Id] = [player2Id, player1Id];
                            [player1Username, player2Username] = [player2Username, player1Username];
                        }
                
                        db.run(
                            `INSERT OR IGNORE INTO jokenpo_history (player1_id, player2_id, player1_username, player2_username, player1_wins, player2_wins) 
                             VALUES (?, ?, ?, ?, 0, 0)`,
                            [player1Id, player2Id, player1Username, player2Username], 
                            function (err) { 
                                if (err) {
                                    console.error("Erro ao inserir no histórico:", err);
                                    reject(err);
                                } else {
                                    console.log("Histórico de partida inserido com sucesso!");
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
                                        (err, row) => {
                                            if (err) {
                                                console.error("Erro ao obter o histórico atualizado:", err);
                                                reject(err);
                                            } else if (row) {
                                                const historyMessage = `Placar: ${player1Username} ${row.player1_wins} — ${row.player2_wins} ${player2Username}`;
                                                resolve(historyMessage);
                                            } else {
                                                resolve("Histórico não disponível.");
                                            }
                                        }
                                    );
                                }
                            }
                        );
                    });
                }
                
                
            }
        } catch (error) {
            console.error(
                "Ocorreu um erro ao executar o comando jokenpo:",
                error
            );
            message.reply("Ocorreu um erro ao executar o comando jokenpo");
        }
    },
};
