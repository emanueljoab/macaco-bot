require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder, formatEmoji } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

module.exports = client;

client.commands = new Collection();
const foldersPath = path.join(__dirname, '..', 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[AVISO] O comando em ${filePath} está faltando uma propriedade "data" ou "execute" necessária.`);
		}
	}
}

client.once('ready', async () => {
    console.log(`${new Date().toLocaleString()} | ${client.user.tag} está online.`);

	client.user.setActivity({
		name: '/macaco',
	});
});

client.on('messageCreate', (message) => {
    if (message.author.bot) {
        return;
    }

    if (message.content.toLowerCase() === 'oi') {
        message.reply('vai tomar no cu');
    };
})

client.on('messageCreate', message => {
    // Verifica se a mensagem é "pls pp"
    if (message.content.toLowerCase() === 'pls pp') {
        const tamanho = Math.floor(Math.random() * 20) + 1;
        const pp = '8' + '='.repeat(tamanho) + 'D';

		const embed = new EmbedBuilder()
            .setTitle('Medidor de pp')
            .setDescription(`pipi de ${message.author.username}\n${pp}`)

        message.channel.send({ embeds: [embed] });
    }
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`Nenhum comando correspondente a ${interaction.commandName} foi encontrado.`);
		return;
	}

	try {
		await interaction.deferReply();

		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'Ocorreu um erro ao executar este comando!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'Ocorreu um erro ao executar este comando!', ephemeral: true });
		}
	}
});

client.login(process.env.TOKEN);