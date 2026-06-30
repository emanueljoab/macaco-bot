const { EmbedBuilder } = require('discord.js');
const { log, error } = require("../utils");

async function execute(message, _args, _db, translate) {
    try {
        const ladosDaMoeda = await translate("flip", "ladosDaMoeda");
        const ladoEscolhido = ladosDaMoeda[Math.floor(Math.random() * ladosDaMoeda.length)];
        
        let miniatura;
        if (ladoEscolhido === "COROA" || ladoEscolhido === "TAILS") {
            miniatura = 'https://i.imgur.com/8wTa5Qa.png'
        } else {
            miniatura = 'https://i.imgur.com/2DSh2S5.png'
        }
        const embed = new EmbedBuilder()
            .setDescription(await translate("flip", "setDescription", ladoEscolhido))
            .setThumbnail(miniatura)
        await message.reply({ embeds: [embed] })
        log(message, `Obteve "${ladoEscolhido}"`);
    } catch (err) {
        error(message, `Erro na execução: ${err.message}`);
    }
}

module.exports = {
    execute
}