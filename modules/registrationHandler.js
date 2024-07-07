const { Rank } = require("../database/models");

async function checkRegistration(user) {
  try {
    if (!user) throw new Error("Usuário inválido");

    const userExists = await Rank.findOne({ where: { id: user.id } });
    if (userExists) throw new Error("Usuário já registrado");

    const newUser = await Rank.create({
      id: user.id,
      name: user.username,
      wins: 0,
      losses: 0,
    });

    console.log("Novo usuário registrado:", newUser.name);
  } catch (err) {
    console.log(err);
  }
}

module.exports = { checkRegistration };
