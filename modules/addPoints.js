const { Rank } = require("../database/models");

async function addPoints(victory, user) {
  if (victory) {
    const userRank = await Rank.findOne({
      where: { id: user.id },
    });
    const newWins = userRank.wins + 1;
    console.log(userRank);

    await Rank.update({ wins: newWins }, { where: { id: user.id } });

    console.log(`${user.username} ganhou um ponto.`);
  }
  if (!victory) {
    const userRank = await Rank.findOne({
      where: { id: user.id },
    });
    const newLosses = userRank.losses + 1;

    console.log(userRank);

    await Rank.update({ losses: newLosses }, { where: { id: user.id } });
    console.log(`${user.username} perdeu um ponto.`);
  }
}

module.exports = { addPoints };
