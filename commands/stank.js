const { EmbedBuilder } = require('discord.js');

async function execute(message) {
    let user = message.mentions.users.first() || message.author;
    let stank = Math.floor(Math.random() * 101);
    let thumbnails = [
        'https://i.imgur.com/dP60pVE.gif',
        'https://i.imgur.com/NbxSkEX.jpg',
        'https://i.imgur.com/DhTukGt.jpg',
        'https://i.imgur.com/p9oHo94.png',
        'https://i.imgur.com/DnmBv6d.gif'
    ];

    const thumbnailAleatorio = thumbnails[Math.floor(Math.random() * thumbnails.length)];

    // Construir a barra de porcentagem
    const barraPorcentagem = generateProgressBar(stank);

    const embed = new EmbedBuilder()
        .setTitle('Medidor de fedor')
        .setDescription(`${user.username} é ${stank}% fedido(a)\n\nFedômetro: ${barraPorcentagem}`)
        .setThumbnail(thumbnailAleatorio);

    await message.reply({ embeds: [embed] });
    console.log(`${new Date().toLocaleString('pt-BR')} | ${user.username} é ${stank}% fedido(a) (${message.author.username})`);
}

// Função para gerar a barra de porcentagem
function generateProgressBar(percent) {
    const progressChars = 10; // Número de caracteres da barra de progresso
    const filledBlocks = Math.floor((percent / 100) * progressChars);
    const emptyBlocks = progressChars - filledBlocks;

    const progressBar = '▰'.repeat(filledBlocks) + '▱'.repeat(emptyBlocks); // Usando caracteres Unicode

    return progressBar;
}

module.exports = {
    execute,
};
