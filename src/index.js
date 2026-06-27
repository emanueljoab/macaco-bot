require("dotenv").config();

const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { db } = require("../database");
const { loadTranslations, translate: translateRaw } = require("../translate");
const { checkSpam } = require("../spam");
const { log, error } = require("../utils");

const prefix = "pls ";

const ball8 = require("../commands/8ball");
const clima = require("../commands/clima");
const config = require("../commands/config");
const flip = require("../commands/flip");
const help = require("../commands/help");
const howgay = require("../commands/howgay");
const jokenpo = require("../commands/jokenpo");
const macaco = require("../commands/macaco");
const ping = require("../commands/ping");
const pp = require("../commands/pp");
const server = require("../commands/server");
const simp = require("../commands/simp");
const stank = require("../commands/stank");
const user = require("../commands/user");

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once("ready", async () => {
    client.user.setActivity({ name: "pls macaco" });
    loadTranslations(); // Carregar traduções ao iniciar o bot
    log(null, `Servidores em que estou:`);
    Array.from(client.guilds.cache.values()).forEach((guild, index) => {
        log(null, `${index + 1}. ${guild.name}`);
    });
    log(null, `${client.user.tag} está online.`);
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
    await checkSpam(message, guildTranslate).catch(err => error(message, `Erro no checkSpam: ${err.message}`));

    // Evento para mensagens
    const content = message.content.toLowerCase();

    if (message.author.bot) return;

    if (content === "oi") {
        message.reply("vai tomar no cu");
        log(message, `vai tomar no cu`);
    }

    if (!content.startsWith(prefix)) return;
    if (!message.guild) return;

    const guildId = message.guild.id;
    const translate = (command, key, ...args) => translateRaw(guildId, command, key, ...args);

    const args = content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const commands = {
        bola8: ball8.execute, "8ball": ball8.execute,
        clima: clima.execute, weather: clima.execute,
        config: config.execute, settings: config.execute,
        flip: flip.execute, moeda: flip.execute, coin: flip.execute,
        help: help.execute.bind(null, client), ajuda: help.execute.bind(null, client), 
        howgay: howgay.execute, gay: howgay.execute,
        jokenpo: jokenpo.execute, jankenpon: jokenpo.execute, rps: jokenpo.execute,
        macaco: macaco.execute, monkey: macaco.execute,
        ping: ping.execute,
        pp: pp.execute,
        server: server.execute, servidor: server.execute,
        stank: stank.execute, fedor: stank.execute,
        simp: simp.execute,
        user: user.execute, usuario: user.execute, usuário: user.execute, profile: user.execute, perfil: user.execute
    };

    if (commands[command]) {
        // Verificar e executar comandos
        try {
            const noArgsCommands = ["config", "flip", "help", "macaco", "monkey", "ping", "server"];
            if (noArgsCommands.includes(command) && args.length > 0) return; // Retornar se um dos noArgsCommands tiver algo escrito além do prefixo e comando

            const argsCommands = ["pp", "howgay", "stank", "simp", "user"];
            if (argsCommands.includes(command)) {
                if (
                    // Verificar se não tem args OU se menciona um usuário
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