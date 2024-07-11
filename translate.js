const fs = require('fs');
const path = require('path');
const { getLanguagePreference } = require('./database'); // Ajuste conforme a localização do seu banco de dados

let translations = {
  english: {},
  portuguese: {}
};

const context = {
  guildid: null,
};

// Carrega traduções dos arquivos JSON
function loadTranslations() {
  translations.english = JSON.parse(fs.readFileSync(path.join(__dirname, 'translations', 'english.json')));
  translations.portuguese = JSON.parse(fs.readFileSync(path.join(__dirname, 'translations', 'portuguese.json')));
}

// Carrega a tradução com placeholders
async function translate(command, key, ...args) {
  const guildid = context.guildid;
  const language = await getLanguagePreference(guildid);
  let translation = translations[language][command][key] || translations['english'][command][key];
  if (!translation) return 'Translation not found';
  
  args.forEach((arg, index) => {
    translation = translation.replace(`{${index}}`, arg);
  });

  return translation;
}

function setContext(guildid) {
  context.guildid = guildid;
}

module.exports = {
  loadTranslations,
  translate,
  setContext
};
