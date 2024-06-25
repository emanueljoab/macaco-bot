require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits } = require('discord.js');

const prefix = 'pls';

const macaco = require('../commands/macaco');
const pp = require('../commands/pp');
const ping = require('../commands/ping');
const server = require('../commands/server');
const user = require('../commands/user');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once('ready', async () => {
    console.log(`${new Date().toLocaleString('pt-BR')} | ${client.user.tag} está online.`);
    client.user.setActivity({ name: 'pls macaco' });
});

client.on('messageCreate', (message) => { // Evento para mensagens
    const content = message.content.toLowerCase();

    if (content === 'oi') {
        message.reply('vai tomar no cu');
        console.log(`${new Date().toLocaleString('pt-BR')} | vai tomar no cu`);
    }

    if (!content.startsWith(prefix) || message.author.bot) return;

    const args = content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const commands = {
        pp: pp.execute,
        macaco: macaco.execute,
        ping: ping.execute,
        server: server.execute,
        user: user.execute
    }

    if (commands[command]) { // Verificar e executar comandos
        try {
            const noArgsCommands = ['macaco', 'ping', 'server', 'user'];
            if (noArgsCommands.includes(command) && args.length > 0) return; // Retorna se a mensagem for um dos noArgsCommands com algum outro argumento
            
            if (command === 'pp') { 
                if (args.length === 0 || message.mentions.users.size > 0) { // Verifica se a mensagem é 'pls pp' OU se menciona um usuário
                    commands[command](message, args);
                } else {
                    return;
                }
            } else {
                commands[command](message, args);
            }
        } catch (error) {
            console.error(`Erro ao executar o comando ${command}:`, error);
            message.reply('Ocorreu um erro ao tentar executar esse comando.')
        }
    }
});

client.login(process.env.TOKEN);
