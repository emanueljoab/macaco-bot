const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Responde com Pong e latência!'),
	async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pong! *Calculando latência...*', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply(`Pong! Latência: ${latency}ms.`);

		const now = new Date();
		const day = String(now.getDate()).padStart(2, '0');
		const month = String(now.getMonth() + 1).padStart(2, '0'); // Mês é zero-indexado, então adicionamos 1
		const year = now.getFullYear();
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');

		const timeZoneOffset = now.getTimezoneOffset() / 60; // Converte minutos para horas
		// Construa a string do fuso horário
		const timeZone = `(GMT${timeZoneOffset > 0 ? '-' : '+'}${Math.abs(timeZoneOffset)})`;

		const formattedDate = `${day}/${month}/${year} ${hours}:${minutes} ${timeZone}`;

		console.log(`${formattedDate} :: Pong! Latência ${latency}ms. (${interaction.user.username})`);
	},
};
