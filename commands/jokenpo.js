const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

module.exports = {
    async execute(message, args, db) {
        try {
            // Verificar se há argumentos extras além de menções ou "rank"
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
                // Lógica para exibir o ranking
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

                const embed = new EmbedBuilder()
                    .setTitle("Jokenpo")
                    .setDescription(
                        `${player1.username} desafiou ${player2.username} para um jogo de Jokenpo!`
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
                    [player1.id, player2.id].includes(interaction.user.id);

                const collector = reply.createMessageComponentCollector({
                    filter,
                    time: 60000,
                });

                const choices = {};
                let resultado = "";

                collector.on("collect", async (interaction) => {
                    choices[interaction.user.id] = interaction.customId;
                    await interaction.deferUpdate();

                    // Edita o embed para mostrar que está aguardando o outro jogador
                    const jogadorEsperando =
                        Object.keys(choices).length === 1 ? player2 : player1;
                    embed.setDescription(
                        `${player1.username} desafiou ${player2.username} para um jogo de Jokenpo!\n*Aguardando a resposta de ${jogadorEsperando.username}...*`
                    );
                    await reply.edit({ embeds: [embed] });

                    if (player2.id === "1243673463902834809") {
                        const opcoes = [
                            "pedra \u{1F44A}",
                            "papel \u{270B}",
                            "tesoura \u{270C}",
                        ];
                        choices[player2.id] =
                            opcoes[Math.floor(Math.random() * 3)];
                    }

                    if (Object.keys(choices).length === 2) {
                        collector.stop();

                        if (choices[player1.id] === choices[player2.id]) {
                            resultado = "**Empate!**";
                        } else if (
                            (choices[player1.id] === "pedra \u{1F44A}" &&
                                choices[player2.id] === "tesoura \u{270C}") ||
                            (choices[player1.id] === "papel \u{270B}" &&
                                choices[player2.id] === "pedra \u{1F44A}") ||
                            (choices[player1.id] === "tesoura \u{270C}" &&
                                choices[player2.id] === "papel \u{270B}")
                        ) {
                            resultado = `**${player1.username.replace(
                                /_/g,
                                "\\_"
                            )} venceu!**`;
                        } else {
                            resultado = `**${player2.username.replace(
                                /_/g,
                                "\\_"
                            )} venceu!**`;
                        }

                        // Editar o Embed com o resultado (movido para dentro do if)
                        embed.setDescription(
                            `${player1.username} escolheu ${
                                choices[player1.id]
                            }\n${player2.username} escolheu ${
                                choices[player2.id]
                            }\n\n${resultado}`
                        );
                        await reply.edit({ embeds: [embed], components: [] });

                        // Atualizar o ranking no banco de dados (agora com db disponível)
                        const guildId = message.guild.id;

                        if (resultado.includes(player1.username)) {
                            // Player 1 venceu
                            atualizarPontuacao(
                                guildId,
                                player1.id,
                                player1.username,
                                1,
                                0
                            );
                            if (player2.id !== "Gerador de Macaco Aleatório") {
                                atualizarPontuacao(
                                    guildId,
                                    player2.id,
                                    player2.username,
                                    0,
                                    1
                                );
                            }
                        } else if (resultado.includes(player2.username)) {
                            // Player 2 venceu
                            atualizarPontuacao(
                                guildId,
                                player2.id,
                                player2.username,
                                1,
                                0
                            );
                            if (player2.id !== "Gerador de Macaco Aleatório") {
                                atualizarPontuacao(
                                    guildId,
                                    player1.id,
                                    player1.username,
                                    0,
                                    1
                                );
                            }
                        }
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
                                    "Erro ao atualizar pontuação:",
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
