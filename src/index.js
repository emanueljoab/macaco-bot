require("dotenv").config();

const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { db, DEFAULT_PREFIX, getPrefix } = require("../database");
const { loadTranslations, translate: translateRaw } = require("../translate");
const { checkSpam } = require("../spam");
const { log, error, matchPrefix } = require("../utils");

const ball8 = require("../commands/8ball");
const clima = require("../commands/clima");
const config = require("../commands/config");
const flip = require("../commands/flip");
const help = require("../commands/help");
const howgay = require("../commands/howgay");
const jokenpo = require("../commands/jokenpo");
const macaco = require("../commands/macaco");
const rank = require("../commands/rank");
const ping = require("../commands/ping");
const pp = require("../commands/pp");
const server = require("../commands/server");
const simp = require("../commands/simp");
const stank = require("../commands/stank");
const user = require("../commands/user");

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once("clientReady", async () => {
    client.user.setActivity({ name: "pls macaco" });
    loadTranslations(); // Carregar traduções ao iniciar o bot
    log(null, `Servidores em que estou:`);
    Array.from(client.guilds.cache.values()).forEach((guild, index) => {
        log(null, `${index + 1}. ${guild.name}`);
    });
    log(null, `${client.user.tag} está online`);
});

client.on("messageCreate", async (message) => {
    if (process.env.DEV_MODE === 'true') { // Verificar se o modo de desenvolvimento está ativado
        if (message.channelId !== process.env.DEV_CHANNEL_ID) return;

        const originalReply = message.reply.bind(message);
        
        message.reply = (content) => {
            if (typeof content === 'string') {
                return originalReply('-# 🛠️ DEV MODE\n' + content);
            } else if (content?.embeds) {
                return originalReply({ ...content, content: '-# 🛠️ DEV MODE' });
            }
            return originalReply(content);
        };
    }

    // Verificar spam antes de qualquer coisa
    const guildTranslate = (command, key, ...args) => translateRaw(message.guild?.id, command, key, ...args);
    const isSpam = await checkSpam(message, guildTranslate).catch(err => error(message, `Erro no checkSpam: ${err.message}`));
    if (isSpam) return; // Mensagem deletada como spam; não processar comandos

    // Evento para mensagens
    const content = message.content.toLowerCase();

    if (message.author.bot) return;

    if (content === "oi") {
        message.reply("vai tomar no cu");
        log(message, `vai tomar no cu`);
    }

    if (!message.guild) return;

    const guildId = message.guild.id;
    const guildPrefix = (await getPrefix(guildId)) || DEFAULT_PREFIX;
    const translate = (command, key, ...args) => translateRaw(guildId, command, key, ...args);

    const rest = matchPrefix(content, guildPrefix);
    if (rest === null) return;

    const args = rest.split(/ +/).filter(Boolean);
    const command = args.shift()?.toLowerCase();
    if (!command) return;

    const commandDefs = [
        { names: ["bola8", "8ball"],                                          handler: ball8.execute },
        { names: ["clima", "weather"],                                        handler: clima.execute },
        { names: ["config", "settings"],                                      handler: config.execute,              noMention: true },
        { names: ["flip", "moeda", "coin"],                                   handler: flip.execute,                noMention: true },
        { names: ["help", "ajuda"],                                           handler: help.execute.bind(null, client), noMention: true },
        { names: ["howgay", "gay"],                                           handler: howgay.execute,              mention: true },
        { names: ["jokenpo", "jankenpon", "rps"],                             handler: jokenpo.execute },
        { names: ["macaco", "monkey"],                                        handler: macaco.execute,              noMention: true },
        { names: ["ping"],                                                    handler: ping.execute,                noMention: true },
        { names: ["pp"],                                                      handler: pp.execute,                  mention: true },
        { names: ["rank"],                                                    handler: rank.execute,                noMention: true },
        { names: ["server", "servidor"],                                      handler: server.execute,              noMention: true },
        { names: ["simp"],                                                    handler: simp.execute,                mention: true },
        { names: ["stank", "fedor"],                                          handler: stank.execute,               mention: true },
        { names: ["user", "usuario", "usuário", "profile", "perfil"],         handler: user.execute,                mention: true },
    ];

    const commands = {};
    const noMentionHandlers = new Set();
    const mentionHandlers = new Set();

    for (const def of commandDefs) {
        for (const name of def.names) commands[name] = def.handler;
        if (def.noMention) noMentionHandlers.add(def.handler);
        if (def.mention) mentionHandlers.add(def.handler);
    }

    if (commands[command]) {
        // Verificar e executar os comandos
        try {
            const fn = commands[command];

            if (noMentionHandlers.has(fn) && args.length > 0) return;

            if (mentionHandlers.has(fn)) {
                if (
                    args.length === 0 ||
                    (args.length === 1 && message.mentions.users.size > 0)
                ) {
                    await commands[command](message, args, db, translate);
                } else {
                    return;
                }
            } else {
                await commands[command](message, args, db, translate);
            }
        } catch (err) {
            error(message, `Erro ao executar o comando: ${err.message}`);
            const errorEmbed = new EmbedBuilder()
                .setDescription(await translate("index", "error", command));
            await message.reply({ embeds: [errorEmbed] });
        }
    }
});

client.login(process.env.TOKEN);

process.on("unhandledRejection", (err) => {
    error(null, `Unhandled rejection: ${err?.message ?? err}`);
});

client.on("error", (err) => {
    error(null, `Client error: ${err.message}`);
});