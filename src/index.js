require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const { Client, GatewayIntentBits } = require("discord.js");
const { db } = require("../database"); // Importe a instância do banco de dados
const { loadTranslations, translate, setContext } = require("../translate");
const { executeMacacoCommandOnStartup } = require("../commands/macaco");

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
    loadTranslations(); // Carrega traduções ao iniciar o bot
    console.log(`${new Date().toLocaleString("pt-BR")} | Servidores em que estou:`);
    Array.from(client.guilds.cache.values()).forEach((guild, index) => {
        console.log(`${index + 1}. ${guild.name}`);
    });
    console.log(`${new Date().toLocaleString("pt-BR")} | ${client.user.tag} está online.`);
    await executeMacacoCommandOnStartup(); // Pré-carrega o fetch de 'macaco'
});

client.on("messageCreate", (message) => {
    setContext(message.guild.id);
    // Evento para mensagens
    const content = message.content.toLowerCase();

    if (content === "oi") {
        message.reply("vai tomar no cu");
        console.log(`${new Date().toLocaleString("pt-BR")} | vai tomar no cu (${message.author.username})`);
    }

    if (!content.startsWith(prefix) || message.author.bot) return;

    const args = content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const commands = {
        "8ball": ball8.execute,
        clima: clima.execute,
        config: config.execute,
        flip: flip.execute,
        help: help.execute.bind(null, client),
        howgay: howgay.execute,
        jokenpo: jokenpo.execute,
        macaco: macaco.execute,
        monkey: macaco.execute,
        ping: ping.execute,
        pp: pp.execute,
        rps: jokenpo.execute,
        server: server.execute,
        stank: stank.execute,
        simp: simp.execute,
        user: user.execute,
        weather: clima.execute,
    };

    if (commands[command]) {
        // Verificar e executar comandos
        try {
            const noArgsCommands = ["config", "flip", "help", "macaco", "monkey", "ping", "server"];
            if (noArgsCommands.includes(command) && args.length > 0) return; // Retorna se um dos noArgsCommands tiver algo escrito além do prefixo e comando

            const argsCommands = ["pp", "howgay", "stank", "simp", "user"];
            if (argsCommands.includes(command)) {
                if (
                    // Verifica se não tem args OU se menciona um usuário
                    args.length === 0 ||
                    (args.length === 1 && message.mentions.users.size > 0)
                ) {
                    commands[command](message, args, db, translate);
                } else {
                    return;
                }
            } else {
                commands[command](message, args, db, translate);
            }
        } catch (error) {
            console.error(`Erro ao executar o comando ${command}:`, error);
            message.reply("Ocorreu um erro ao tentar executar esse comando.");
        }
    }
});

client.login(process.env.TOKEN);
//test