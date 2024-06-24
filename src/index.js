require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const prefix = 'pls';
const macaco = require('../commands/macaco');  // Certifique-se de que o caminho está correto
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

    client.user.setActivity({
        name: 'pls macaco',
    });
});

// Comandos
client.on('messageCreate', (message) => {
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

// Verificar e executar comandos
if (commands[command]) {
    // Comandos que não aceitam argumentos
    const noArgsCommands = ['macaco', 'ping', 'server', 'user'];
    if (noArgsCommands.includes(command) && args.length > 0) return;
    
    // Verificação especial para o comando 'pp'
    if (command === 'pp') {
        // Verificar se a mensagem é exatamente "pls pp" ou se há um usuário mencionado
        if (args.length === 0 || message.mentions.users.size > 0) {
            commands[command](message, args);
            return;
        } else {
            return;
        }
    }

    commands[command](message, args);
}
});

client.login(process.env.TOKEN);
