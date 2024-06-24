const { EmbedBuilder } = require('discord.js');

function execute(message) {
    let user = message.mentions.users.first() || message.author;
    const tamanho = Math.floor(Math.random() * 20);
    const pp = '8' + '='.repeat(tamanho) + 'D';

    const embed = new EmbedBuilder()
        .setTitle('Medidor de pp')
        .setDescription(`pipi de ${user}\n${pp}`)
        .setFooter( {text: `${tamanho} cm`})

    message.reply({ embeds: [embed] });
    console.log(`${new Date().toLocaleString('pt-BR')} | Pipi de ${user.username} ${pp} ${tamanho} cm (${message.author.username})`);
}

module.exports = {
    execute,
};
