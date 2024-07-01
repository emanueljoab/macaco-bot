const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    async execute(message, args) {
        if (args.length > 0 && !args.every(arg => arg.startsWith('<@') && arg.endsWith('>'))) {
            return; // Ignorar o comando se houver argumentos extras que não sejam menções
        }
        const player1 = message.author;
        let player2 = message.mentions.users.first();

        if (!player2) {
        player2 = {
            username: 'Gerador de Macaco Aleatório',
            id: 'Gerador de Macaco Aleatório',
        };
        }

        const embed = new EmbedBuilder()
        .setTitle('Jokenpo')
        .setDescription(`${player1.username} desafiou ${player2.username} para um jogo de Jokenpo!`);

        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId('pedra \u{1F44A}')
            .setLabel('\u{1F44A} Pedra')
            .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
            .setCustomId('papel \u{270B}')
            .setLabel('\u{270B} Papel')
            .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
            .setCustomId('tesoura \u{270C}')
            .setLabel('\u{270C} Tesoura')
            .setStyle(ButtonStyle.Danger),
        );

        const reply = await message.reply({ embeds: [embed], components: [row] });

        const filter = (interaction) =>
        interaction.isButton() &&
        [player1.id, player2.id].includes(interaction.user.id);

        const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

        const choices = {};

        collector.on('collect', async (interaction) => {
            choices[interaction.user.id] = interaction.customId;
            await interaction.deferUpdate();

            if (player2.id === 'Gerador de Macaco Aleatório') {
                const opcoes = ['pedra \u{1F44A}', 'papel \u{270B}', 'tesoura \u{270C}'];
                choices[player2.id] = opcoes[Math.floor(Math.random() * 3)];
            }
        
            if (Object.keys(choices).length === 2) {
            collector.stop();

            let resultado = "";
            if (choices[player1.id] === choices[player2.id]) {
            resultado = "Empate!";
            } else if (
            (choices[player1.id] === "pedra \u{1F44A}" && choices[player2.id] === "tesoura \u{270C}") ||
            (choices[player1.id] === "papel \u{270B}" && choices[player2.id] === "pedra \u{1F44A}") ||
            (choices[player1.id] === "tesoura \u{270C}" && choices[player2.id] === "papel \u{270B}")
            ) {
            resultado = `**${player1.username} venceu!**`;
            } else {
            resultado = `**${player2.username} venceu!**`;
            }

            embed.setDescription(`${player1.username} escolheu ${choices[player1.id]}\n${player2.username} escolheu ${choices[player2.id]}\n\n${resultado}`);
            await reply.edit({ embeds: [embed], components: [] }); 
            }
        });

        collector.on('end', (collected, reason) => {
        if (reason === 'time') {
            embed.setDescription('Tempo esgotado! Ninguém escolheu a tempo.');
            reply.edit({ embeds: [embed], components: [] });
        }
        });
    },
};
