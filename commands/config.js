// config.js
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const db = require("../database");

module.exports = {
    name: 'config',
    description: 'Configurações do bot para mudar o idioma',
    execute(message) {
        // Verifica se o usuário tem permissão de administrador
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('Você não tem permissão para usar este comando.');
        }

        // Cria um embed com informações sobre a configuração
        const embed = new EmbedBuilder()
            .setTitle('Configurações de Idioma (ainda não funciona)')
            .setDescription(' ')

        embed.addFields({ name: '\u200B', value: 'Selecione o idioma que você deseja que o bot utilize.' });

        // Cria um menu de seleção para os idiomas com bandeiras
        const languageMenu = new StringSelectMenuBuilder()
            .setCustomId('select-language')
            .setPlaceholder('Selecione um idioma')
            .addOptions([
                {
                    label: 'Inglês',
                    description: 'Muda o idioma do bot para inglês',
                    value: 'english',
                    emoji: '🇺🇸',
                },
                {
                    label: 'Português',
                    description: 'Muda o idioma do bot para português',
                    value: 'portuguese',
                    emoji: '🇧🇷',
                }
            ]);

        // Cria uma action row e adiciona o menu de seleção
        const row = new ActionRowBuilder().addComponents(languageMenu);

        // Envia o embed e o menu de seleção
        message.channel.send({ embeds: [embed], components: [row] });

        // Listener para interações com o menu de seleção
        const filter = (interaction) => interaction.customId === 'select-language' && interaction.user.id === message.author.id;

        const collector = message.channel.createMessageComponentCollector({ filter, componentType: ComponentType.StringSelect, time: 60000 });

        collector.on('collect', (interaction) => {
            const selectedLanguage = interaction.values[0];
            
            // Atualiza o idioma no banco de dados
            db.run(`INSERT INTO server_language (guild_id, language) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET language = ?`, [message.guild.id, selectedLanguage, selectedLanguage], async (err) => {
                if (err) {
                    console.error("Erro ao atualizar o idioma:", err);
                    embed.setFields({ name: '\u200B', value: 'Houve um erro ao tentar atualizar o idioma.' });
                    await interaction.update({ embeds: [embed], components: [] });
                } else {
                    embed.setFields({ name: '\u200B', value: `Idioma alterado para ${selectedLanguage}.` });
                    await interaction.update({ embeds: [embed], components: [] });
                }
                collector.stop();
            });
        });

        collector.on('end', collected => {
            if (!collected.size) {
                message.channel.send('Tempo esgotado para seleção de idioma.');
            }
        });
    },
};
