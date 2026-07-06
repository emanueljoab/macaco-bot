function timestamp() {
    return new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }).replace(",", "");
}

function getFile() {
    const lines = new Error().stack.split("\n");
    const line = lines.find(l => l.includes(".js") && !l.includes("utils.js"));
    return line?.match(/\/([^/\\]+)\.js/)?.[1] ?? line?.match(/\\([^/\\]+)\.js/)?.[1] ?? "unknown";
}

function getGuild(message) {
    return message?.guild?.name ?? "system";
}

function getUser(message) {
    return message?.author?.username ?? "system";
}

function log(message, text) {
    console.log(`[${timestamp()}] [${getGuild(message)}] [${getFile()}] [${getUser(message)}] [${text}]`);
}

function error(message, text) {
    console.error(`[${timestamp()}] [${getGuild(message)}] [${getFile()}] [${getUser(message)}] [${text}]`);
}

function matchPrefix(content, prefix) {
    const lowerPrefix = prefix.toLowerCase();
    if (!content.startsWith(lowerPrefix)) return null;

    const rest = content.slice(lowerPrefix.length);
    const isWordLike = /[a-z0-9]/i.test(lowerPrefix.at(-1));

    if (isWordLike && rest !== "" && !/\s/.test(rest[0])) return null;

    return rest.trim();
}

module.exports = { log, error, matchPrefix };