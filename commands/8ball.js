const { EmbedBuilder } = require("discord.js");

async function execute(message, args, __, translate) {
    const respostas = await translate("8ball", "respostas");
    const indiceAleatorio = Math.floor(Math.random() * respostas.length);
    const resposta = respostas[indiceAleatorio];
    let pergunta = args.join(" ");

    message.mentions.users.forEach((user) => {
        const mention = `<@${user.id}>`;
        const username = `${user.username}`;
        pergunta = pergunta.replace(mention, username);
    });

    let perguntaCapitalizada = pergunta.charAt(0).toUpperCase() + pergunta.slice(1);

    if (args.length > 0) {
        perguntaCapitalizada = `*"${perguntaCapitalizada}"*\n`;
    }

    const embed = new EmbedBuilder()
        .setTitle(await translate("8ball", "setTitle"))
        .setDescription(await translate("8ball", "setDescription", message.author.username, perguntaCapitalizada, resposta))
        .setThumbnail("https://i.imgur.com/z2Qu5QQ.png");
    await message.reply({ embeds: [embed] });
    console.log(`${new Date().toLocaleString("pt-BR")} | ${resposta} (${message.author.username})`);
}

module.exports = {
    execute,
};
