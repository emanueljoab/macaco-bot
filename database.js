const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./jokenpo.db");

// Criação das tabelas se não existirem
db.serialize(() => {
    db.run(
        `CREATE TABLE IF NOT EXISTS jokenpo_rank (
        guild_id TEXT,
        user_id TEXT,
        username TEXT,
        wins INTEGER,
        losses INTEGER,
        PRIMARY KEY (guild_id, user_id)
    )`
    );

    db.run(
        `CREATE TABLE IF NOT EXISTS jokenpo_history (
        player1_id TEXT,
        player2_id TEXT,
        player1_username TEXT,
        player2_username TEXT,
        player1_wins INTEGER,
        player2_wins INTEGER,
        PRIMARY KEY (player1_id, player2_id)
    )`
    );
    db.run(
        `CREATE TABLE IF NOT EXISTS server_language (
        guild_id TEXT PRIMARY KEY,
        language TEXT
    )`
    );
});

// Função para obter a preferência de idioma
function getLanguagePreference(guildId) {
    return new Promise((resolve, reject) => {
        db.get("SELECT language FROM server_language WHERE guild_id = ?", [guildId], (err, row) => {
            if (err) {
                reject(err);
            } else if (!row) {
                // Define o idioma padrão como 'english' se não estiver definido
                db.run("INSERT INTO server_language (guild_id, language) VALUES (?, ?)", [guildId, "english"], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve("english");
                    }
                });
            } else {
                resolve(row.language);
            }
        });
    });
}

module.exports = {
    db,
    getLanguagePreference,
};
