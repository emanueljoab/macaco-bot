const { EmbedBuilder } = require('discord.js');

function execute(client, message) {
    const embed = new EmbedBuilder()
        .setTitle('Ajuda')
        .setDescription(`**Lista de comandos:**\n
            **\`8ball\`**: Faça uma pergunta e obtenha uma resposta.
            **\`clima\`**: Mostra as condições climáticas de uma cidade.
            **\`help\`**: Exibe todos os comandos.
            **\`howgay\`**: Mede o quão gay uma pessoa é.
            **\`jokenpo\`**: Joga um jogo de pedra, papel e tesoura.
            **\`macaco\`**: Gera um macaco aleatório.
            **\`ping\`**: Calcula o ping.
            **\`pp\`**: Mede o pipi.
            **\`server\`**: Exibe informações acerca do servidor.
            **\`stank\`**: Mede o fedor de alguém.
            **\`user\`**: Mostra informações sobre o usuário.`)
        .setThumbnail(client.user.avatarURL())
    message.reply({ embeds: [embed] })
    console.log(`${new Date().toLocaleString('pt-BR')} | Comando 'help' executado. (${message.author.username})`)
}

module.exports = {
    execute,
}