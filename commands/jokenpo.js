const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { checkRegistration } = require("../modules/registrationHandler");
const { addPoints } = require("../modules/addPoints");

module.exports = {
  async execute(message, args, client) {
    try {
      if (
        args.length > 0 &&
        !args.every((arg) => arg.startsWith("<@") && arg.endsWith(">"))
      ) {
        return; // Ignorar o comando se houver argumentos extras que não sejam menções
      }

      const challenger = message.author;
      let challenged = message.mentions.users.first();

      if (!challenged) {
        challenged = client.user;
      }

      checkRegistration(challenger);
      checkRegistration(challenged);

      const player1 = challenger;
      const player2 = challenged;

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

      const reply = await message.reply({ embeds: [embed], components: [row] });

      const filter = (interaction) =>
        interaction.isButton() &&
        [player1.id, player2.id].includes(interaction.user.id);

      const collector = reply.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      const choices = {};

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

        if (player2.id === client.user.id) {
          const opcoes = [
            "pedra \u{1F44A}",
            "papel \u{270B}",
            "tesoura \u{270C}",
          ];
          choices[player2.id] = opcoes[Math.floor(Math.random() * 3)];
        }

        if (Object.keys(choices).length === 2) {
          collector.stop();

          let resultado = "";
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
            resultado = `**${player1.username.replace(/_/g, "\\_")} venceu!**`;
            addPoints(true, player1);
            addPoints(false, player2);
          } else {
            resultado = `**${player2.username.replace(/_/g, "\\_")} venceu!**`;
            addPoints(true, player2);
            addPoints(false, player1);
          }

          embed.setDescription(
            `${player1.username} escolheu ${choices[player1.id]}\n${
              player2.username
            } escolheu ${choices[player2.id]}\n\n${resultado}`
          );
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
    } catch (error) {
      console.error("Ocorreu um erro ao executar o comando jokenpo:", error);
      message.reply("Ocorreu um erro ao executar o comando jokenpo");
    }
  },
};
