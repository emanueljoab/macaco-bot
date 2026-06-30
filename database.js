const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./macaco.db");

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

    db.run(
        `CREATE TABLE IF NOT EXISTS user_records (
        guild_id TEXT,
        guild_name TEXT,
        user_id TEXT,
        username TEXT,
        max_howgay INTEGER,
        max_pp INTEGER,
        max_pp_string TEXT,
        max_simp INTEGER,
        max_stank INTEGER,
        PRIMARY KEY (guild_id, user_id)
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
                // Definir o idioma padrão como 'portuguese' se não estiver definido
                db.run("INSERT INTO server_language (guild_id, language) VALUES (?, ?)", [guildId, "portuguese"], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve("portuguese");
                    }
                });
            } else {
                resolve(row.language);
            }
        });
    });
}

function updateRecord(guildId, guildName, userId, username, column, value, extras = {}) {
    const extraKeys = Object.keys(extras);
    const extraVals = Object.values(extras);
    const extraSets = extraKeys.map((k) => `${k} = ?`).join(", ");
    const setSql = extraKeys.length > 0
        ? `guild_name = ?, username = ?, ${column} = ?, ${extraSets}`
        : `guild_name = ?, username = ?, ${column} = ?`;

    db.run(
        `INSERT OR IGNORE INTO user_records (guild_id, guild_name, user_id, username) VALUES (?, ?, ?, ?)`,
        [guildId, guildName, userId, username]
    );
    db.run(
        `UPDATE user_records SET ${setSql} WHERE guild_id = ? AND user_id = ? AND (${column} IS NULL OR ${column} < ?)`,
        [guildName, username, value, ...extraVals, guildId, userId, value]
    );
}

function getUserRecords(guildId, userId) {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM user_records WHERE guild_id = ? AND user_id = ?",
            [guildId, userId],
            (err, row) => {
                if (err) reject(err);
                else resolve(row || null);
            }
        );
    });
}

module.exports = {
    db,
    getLanguagePreference,
    updateRecord,
    getUserRecords,
};
