const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, PermissionsBitField } = require("discord.js");
const { db } = require("../database");
const { log, error } = require("../utils");

async function execute(message, _args, _db, translate) {
    // Verificar se o usuário tem permissão de administrador
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const permEmbed = new EmbedBuilder().setDescription(await translate("config", "permission"));
        return message.reply({ embeds: [permEmbed] });
    }

    // Criar um embed com informações sobre a configuração
    const embed = new EmbedBuilder().setTitle(await translate("config", "setTitle")).setDescription(" ");

    embed.addFields({ name: "\u200B", value: await translate("config", "addFields") });

    // Criar um menu de seleção para os idiomas com bandeiras
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

    const row = new ActionRowBuilder().addComponents(languageMenu);

    const reply = await message.reply({ embeds: [embed], components: [row] });

    // Listener para interações com o menu de seleção
    const filter = (interaction) => interaction.customId === "select-language" && interaction.user.id === message.author.id;

    const collector = reply.createMessageComponentCollector({ 
        filter, 
        componentType: ComponentType.StringSelect,
        time: 60000 
    });

    collector.on("collect", (interaction) => {
        const selectedLanguage = interaction.values[0];

        // Atualizar o idioma no banco de dados
        db.run(
            `INSERT INTO server_language (guild_id, language) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET language = ?`,
            [message.guild.id, selectedLanguage, selectedLanguage],
            async (err) => {
                try {
                    if (err) {
                        error(message, `Erro ao atualizar o idioma: ${err}`);
                        embed.setFields({ name: "\u200B", value: await translate("config", "error") });
                        await interaction.update({ embeds: [embed], components: [] });
                    } else {
                        embed.setFields({ name: "\u200B", value: await translate("config", "success", selectedLanguage) });
                        await interaction.update({ embeds: [embed], components: [] });
                        log(message, `Idioma alterado para ${selectedLanguage}`);
                    }
                } catch (err) {
                    if (err.code !== 10062) {
                        error(message, `Erro inesperado na interação: ${err}`);
                    }
                }
                collector.stop();
            }
        );
    });

    collector.on("end", (collected, reason) => {
        if (reason === "time") {
            reply.edit({ components: [] }).catch(err => error(message, err));
        }
    });
}

module.exports = {
    execute,
};