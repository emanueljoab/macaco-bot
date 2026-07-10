function timestamp() {
    return new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }).replace(",", "");
}

function dateStamp() {
    return new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function getFile() {
    const lines = new Error().stack.split("\n");
    const line = lines.find(l => l.includes(".js") && !l.includes("utils.js"));
    return line?.match(/\/([^/\\]+)\.js/)?.[1] ?? line?.match(/\\([^/\\]+)\.js/)?.[1] ?? "unknown";
}

// Cores ANSI; desativadas quando a saída não é um terminal (ex.: redirecionada para arquivo)
const COLOR_CODES = { dim: "2", red: "31", green: "32", yellow: "33", magenta: "35", cyan: "36" };

function makePaint(stream) {
    if (!stream.isTTY) return (_color, text) => text;
    return (color, text) => `\x1b[${COLOR_CODES[color]}m${text}\x1b[0m`;
}

function format(message, text, paint) {
    const guild = message?.guild?.name;
    const user = message?.author?.username;
    // Sem guild e sem usuário → log de sistema
    const context = (guild || user)
        ? `[${paint("cyan", guild ?? "DM")}] [${paint("magenta", getFile())}] [${paint("green", user ?? "?")}]`
        : `[${paint("magenta", getFile())}] [${paint("yellow", "SYSTEM")}]`;
    return `${paint("dim", `[${timestamp()}]`)} ${context} [${text}]`;
}

// Imprime uma linha separadora quando o dia muda entre um log e outro
let lastLogDate = null;

function emit(writer, stream, message, text, textColor) {
    const paint = makePaint(stream);
    const today = dateStamp();
    if (today !== lastLogDate) {
        lastLogDate = today;
        writer(paint("dim", `───────────── ${today} ─────────────`));
    }
    writer(format(message, textColor ? paint(textColor, text) : text, paint));
}

function log(message, text) {
    emit(console.log, process.stdout, message, text, null);
}

function error(message, text) {
    emit(console.error, process.stderr, message, text, "red");
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