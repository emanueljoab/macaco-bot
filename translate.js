const fs = require("fs");
const path = require("path");
const { getLanguagePreference } = require("./database");

let translations = {
    english: {},
    portuguese: {},
};

// Carregar traduções dos arquivos JSON
function loadTranslations() {
    translations.english = JSON.parse(fs.readFileSync(path.join(__dirname, "translations", "english.json")));
    translations.portuguese = JSON.parse(fs.readFileSync(path.join(__dirname, "translations", "portuguese.json")));
}

// Carregar a tradução com placeholders
async function translate(guildId, command, key, ...args) {
    const language = await getLanguagePreference(guildId);
    let translation = translations[language][command][key];
    if (!translation) return "Translation not found";

    args.forEach((arg, index) => {
        translation = translation.replace(`{${index}}`, arg);
    });

    return translation;
}

module.exports = {
    loadTranslations,
    translate,
};
