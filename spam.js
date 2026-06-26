const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const { log, error } = require("./utils");

// Map: userId -> [{ content, channelId, timestamp, message }]
const recentMessages = new Map();

const WINDOW_MS = 10_000;       // 10 second window
const THRESHOLD = 3;            // distinct channels threshold
const TIMEOUT_MS = 30 * 60 * 1000; // 30 minute timeout

async function checkSpam(message, translate) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const userId = message.author.id;
    const now = Date.now();
    const content = message.content.trim();

    if (!content) return;

    // Initialize user history if needed
    if (!recentMessages.has(userId)) {
        recentMessages.set(userId, []);
    }

    const history = recentMessages.get(userId);

    // Remove entries outside the time window
    const recent = history.filter(entry => now - entry.timestamp <= WINDOW_MS);

    // Register current message
    recent.push({ content, channelId: message.channelId, timestamp: now, message });

    recentMessages.set(userId, recent);

    // Filter entries with the same content
    const sameContent = recent.filter(entry => entry.content === content);

    // Count distinct channels where this content was sent
    const distinctChannels = new Set(sameContent.map(entry => entry.channelId));

    if (distinctChannels.size < THRESHOLD) return;

    // Spam detected — clear user history immediately
    recentMessages.delete(userId);

    // Check if the bot has permission to timeout members
    const me = message.guild.members.me;
    if (!me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        error(message, `Sem permissão para aplicar timeout`);
        return;
    }

    // Check if the user can be moderated (not an admin or higher role than the bot)
    const member = message.guild.members.cache.get(userId);
    if (!member) return;
    if (!member.moderatable) {
        error(message, `Não foi possível moderar (cargo superior ou admin)`);
        return;
    }

    try {
        // Delete all detected spam messages
        for (const entry of sameContent) {
            await entry.message.delete().catch(() => null);
        }

        // Apply 30 minute timeout
        const reason = await translate("spam", "reason");
        await member.timeout(TIMEOUT_MS, reason);

        log(message, `Usuário silenciado por 30 minutos`);

        // Notify the channel where spam was detected
        const embed = new EmbedBuilder()
            .setTitle(await translate("spam", "setTitle"))
            .setDescription(await translate("spam", "detected", `<@${userId}>`));

        await message.channel.send({ embeds: [embed] });
    } catch (error) {
        error(message, `Erro ao processar spam: ${error.message}`);
    }
}

module.exports = { checkSpam };