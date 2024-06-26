const { EmbedBuilder } = require('discord.js');

function execute(message) {
    let user = message.mentions.users.first() || message.author;
    let howgay = Math.floor(Math.random() * 101);

    let description;
    let footer = null;
    if (howgay === 100) {
        description = `${user} é ${howgay}% gay \u{1F3F3}\u{FE0F}\u{200D}\u{1F308}`
        footer = 'Que bichona! \u{1F984}'
    } else if (howgay > 0 && howgay < 100) {
        description = `${user} é ${howgay}% gay \u{1F3F3}\u{FE0F}\u{200D}\u{1F308}`;
    } else {
        description = `${user} é ${howgay}% gay \u{26A5}`;
    }

    const embed = new EmbedBuilder()
        .setTitle('Medidor de gay')
        .setDescription(description)
        .setFooter({ text: footer })
    message.reply({ embeds: [embed] });
    console.log(`${new Date().toLocaleString('pt-BR')} | ${user.username} é ${howgay}% gay (${message.author.username})`)
}

module.exports = {
    execute,
}