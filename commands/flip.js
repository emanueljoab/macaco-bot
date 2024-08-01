const { EmbedBuilder } = require('discord.js');

async function execute(message, __, __, translate) {
    const user = message.mentions.users.first() || message.author;
    const ladosDaMoeda = await translate("flip", "ladosDaMoeda");
    const ladoEscolhido = ladosDaMoeda[Math.floor(Math.random() * ladosDaMoeda.length)];
    
    if (ladoEscolhido === "Coroa" || ladoEscolhido === "Tails") {
        miniatura = 'https://i.imgur.com/8wTa5Qa.png'
    } else {
        miniatura = 'https://i.imgur.com/2DSh2S5.png'
    }

    const embed = new EmbedBuilder()
        .setTitle("** **")
        .setDescription(await translate ("flip", "setDescription", user.username, ladoEscolhido))
        .setThumbnail(miniatura)

    await message.reply({ embeds: [embed] })
    console.log(`${new Date().toLocaleString("pt-BR")} | ${user.username} jogou uma moeda e conseguiu ${ladoEscolhido}`);
}

module.exports = {
    execute
}