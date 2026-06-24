// config.js
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, PermissionsBitField } = require("discord.js");
const { db } = require("../database");

async function execute(message, _args, _db, translate) {
    // Verifica se o usuário tem permissão de administrador
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply(await translate("config", "permission"));
    }

    // Cria um embed com informações sobre a configuração
    const embed = new EmbedBuilder().setTitle(await translate("config", "setTitle")).setDescription(" ");

    embed.addFields({ name: "\u200B", value: await translate("config", "addFields") });

    // Cria um menu de seleção para os idiomas com bandeiras
    const languageMenu = new StringSelectMenuBuilder()
        .setCustomId("select-language")
        .setPlaceholder(await translate("config", "setPlaceholder"))
        .addOptions([
            {
                label: await translate("config", "label-en"),
                description: await translate("config", "description-en"),
                value: "english",
                emoji: "🇺🇸",
            },
            {
                label: await translate("config", "label-pt"),
                description: await translate("config", "description-pt"),
                value: "portuguese",
                emoji: "🇧🇷",
            },
        ]);

    // Cria uma action row e adiciona o menu de seleção
    const row = new ActionRowBuilder().addComponents(languageMenu);

    // Envia o embed e o menu de seleção
    message.reply({ embeds: [embed], components: [row] });

    // Listener para interações com o menu de seleção
    const filter = (interaction) => interaction.customId === "select-language" && interaction.user.id === message.author.id;

    const collector = message.channel.createMessageComponentCollector({ filter, componentType: ComponentType.StringSelect });

    collector.on("collect", (interaction) => {
        const selectedLanguage = interaction.values[0];
        const guild = interaction.guild;

        // Atualiza o idioma no banco de dados
        db.run(
            `INSERT INTO server_language (guild_id, language) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET language = ?`,
            [message.guild.id, selectedLanguage, selectedLanguage],
            async (err) => {
                if (err) {
                    console.error("Erro ao atualizar o idioma:", err);
                    embed.setFields({ name: "\u200B", value: await translate("config", "error") });
                    await interaction.update({ embeds: [embed], components: [] });
                } else {
                    embed.setFields({ name: "\u200B", value: await translate("config", "success", selectedLanguage) });
                    await interaction.update({ embeds: [embed], components: [] });
                    console.log(new Date().toLocaleString("pt-BR"), "| Idioma alterado para", selectedLanguage, "em", guild.name);
                }
                collector.stop();
            }
        );
    });
}

module.exports = {
    execute,
};
