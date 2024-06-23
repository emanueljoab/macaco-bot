require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
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
    if (message.author.bot) return;

    // Comando oi
    if (message.content.toLowerCase() === 'oi') {
        message.reply('vai tomar no cu');
        console.log(`${new Date().toLocaleString('pt-BR')} | vai tomar no cu`);
    }

    // Comando pls pp
    if (message.content.toLowerCase() === 'pls pp') {
        pp.execute(message);
    }

    // Comando pls macaco
    if (message.content.toLowerCase() === 'pls macaco') {
        macaco.execute(message);
    }

    // Comando ping
    if (message.content.toLowerCase() === 'pls ping') {
        ping.execute(message);
    }

    // Comando server
    if (message.content.toLowerCase() === 'pls server') {
        server.execute(message);
    }

    // Comando user 
    if (message.content.toLowerCase() === 'pls user') {
        user.execute(message);
    }
});

client.login(process.env.TOKEN);
