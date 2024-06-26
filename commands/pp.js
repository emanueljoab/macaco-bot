const { EmbedBuilder } = require('discord.js');

async function execute(message) {
    let user = message.mentions.users.first() || message.author;
    const tamanho = Math.floor(Math.random() * 21);
    const pp = '8' + '='.repeat(tamanho) + 'D';

    const embed = new EmbedBuilder()
        .setTitle('Medidor de pp')
        .setDescription(`pipi de ${user}\n${pp}`)
        .setFooter( {text: `${tamanho} cm`})
    await message.reply({ embeds: [embed] });
    console.log(`${new Date().toLocaleString('pt-BR')} | Pipi de ${user.username} ${pp} ${tamanho} cm (${message.author.username})`);
}

module.exports = {
    execute,
};
