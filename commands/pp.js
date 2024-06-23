const { EmbedBuilder } = require('discord.js');

function execute(message) {
    const tamanho = Math.floor(Math.random() * 19) + 1;
    const pp = '8' + '='.repeat(tamanho) + 'D';

    const embed = new EmbedBuilder()
        .setTitle('Medidor de pp')
        .setDescription(`pipi de ${message.author.tag}\n${pp}`)
        .setFooter( {text: `${tamanho} cm`})

    message.reply({ embeds: [embed] });
    console.log(`${new Date().toLocaleString('pt-BR')} | ${pp} ${tamanho} cm (${message.author.username})`);
}

module.exports = {
    execute,
};
