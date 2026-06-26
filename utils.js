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
    console.log(`[${timestamp()}] [${getGuild(message)}] [${getUser(message)}] [${getFile()}] [${text}]`);
}

function error(message, text) {
    console.error(`[${timestamp()}] [${getGuild(message)}] [${getUser(message)}] [${getFile()}] [${text}]`);
}

module.exports = { log, error };