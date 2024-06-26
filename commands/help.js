const { EmbedBuilder } = require('discord.js');

function execute(message) {
    const embed = new EmbedBuilder()
        .setTitle('Ajuda')
        .setDescription(`*Lista de comandos*\n
            **help**: Exibe todos os comandos.
            **howgay**: Mede o quão gay uma pessoa é.
            **macaco**: Gera um macaco aleatório.
            **ping**: Calcula o ping.
            **pp**: Mede o pipi.
            **server**: Exibe informações acerca do servidor.
            **user**: Mostra informações sobre o usuário.`)
    message.reply({ embeds: [embed] })
    console.log(`${new Date().toLocaleString('pt-BR')} | Comando 'help' executado. (${message.author.username})`)
}

module.exports = {
    execute,
}