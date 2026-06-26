const { EmbedBuilder } = require("discord.js");
const { log, error } = require("../utils");

async function execute(message, args, _db, translate) {
    if (args.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle(await translate("8ball", "setTitle"))
            .setDescription(await translate("8ball", "no question"))
            .setFooter({ text: await translate("8ball", "setFooter") })
            .setThumbnail("https://i.imgur.com/z2Qu5QQ.png");
        log(message, `Usuário não introduziu uma pergunta`);    
        return message.reply({ embeds: [embed] });
    }

    const respostas = await translate("8ball", "respostas");
    const indiceAleatorio = Math.floor(Math.random() * respostas.length);
    const resposta = respostas[indiceAleatorio];
    let pergunta = args.join(" ");

    message.mentions.users.forEach((user) => {
        const mention = `<@${user.id}>`;
        const username = `${user.username}`;
        pergunta = pergunta.replace(mention, username);
    });

    const embed = new EmbedBuilder()
        .setTitle(await translate("8ball", "setTitle"))
        .setDescription(await translate("8ball", "setDescription", message.author.username, pergunta, resposta))
        .setThumbnail("https://i.imgur.com/z2Qu5QQ.png");
    await message.reply({ embeds: [embed] });
    log(message, `Pergunta: "${pergunta}" | Resposta: "${resposta}"`);
}

module.exports = {
    execute,
};
