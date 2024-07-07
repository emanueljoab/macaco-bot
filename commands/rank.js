const { EmbedBuilder } = require("discord.js");
const { Rank } = require("../database/models");

async function execute(message) {
  const users = await Rank.findAll();

  const ranking = users
    .map((r) => ({
      name: r.name,
      wins: r.wins,
      losses: r.losses,
      ratio: r.wins / (r.losses || 1),
    }))
    .sort((a, b) => b.ratio - a.ratio)
    .map((r) => `${r.name} - ${r.wins} vitorias : ${r.losses} derrotas `);

  console.log(ranking);

  const text = ranking.map((r, i) => `${i + 1}. ${r}`).join("\n");
  const embed = new EmbedBuilder()
    .setTitle("Ranking Jokenpo")
    .setDescription(text);

  message.reply({ embeds: [embed] });
}

module.exports = { execute };
