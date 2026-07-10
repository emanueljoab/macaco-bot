const sqlite3 = require("sqlite3").verbose();
const { log, error } = require("./utils");
const db = new sqlite3.Database("./macaco.db");

const DEFAULT_PREFIX = "pls";

// Criar tabelas se não existirem
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
    const existing = new Set(err ? [] : rows.map(r => r.name));
    db.serialize(() => {
    db.run(
        `CREATE TABLE IF NOT EXISTS jokenpo_rank (
        guild_id TEXT,
        user_id TEXT,
        username TEXT,
        wins INTEGER,
        losses INTEGER,
        PRIMARY KEY (guild_id, user_id)
    )`,
        (err) => {
            if (err) error(null, `Erro ao criar tabela jokenpo_rank: ${err.message}`);
            else if (!existing.has("jokenpo_rank")) log(null, `Tabela criada: jokenpo_rank`);
        }
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
    )`,
        (err) => {
            if (err) error(null, `Erro ao criar tabela jokenpo_history: ${err.message}`);
            else if (!existing.has("jokenpo_history")) log(null, `Tabela criada: jokenpo_history`);
        }
    );
    db.run(
        `CREATE TABLE IF NOT EXISTS server_language (
        guild_id TEXT PRIMARY KEY,
        language TEXT
    )`,
        (err) => {
            if (err) error(null, `Erro ao criar tabela server_language: ${err.message}`);
            else if (!existing.has("server_language")) log(null, `Tabela criada: server_language`);
        }
    );

    db.run(
        `CREATE TABLE IF NOT EXISTS server_prefix (
        guild_id TEXT PRIMARY KEY,
        guild_name TEXT,
        prefix TEXT
    )`,
        (err) => {
            if (err) error(null, `Erro ao criar tabela server_prefix: ${err.message}`);
            else if (!existing.has("server_prefix")) log(null, `Tabela criada: server_prefix`);
        }
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
    )`,
        (err) => {
            if (err) error(null, `Erro ao criar tabela user_records: ${err.message}`);
            else if (!existing.has("user_records")) log(null, `Tabela criada: user_records`);
        }
    );
    });
});

// Obter a preferência de idioma
function getLanguagePreference(guildId) {
    return new Promise((resolve, reject) => {
        db.get("SELECT language FROM server_language WHERE guild_id = ?", [guildId], (err, row) => {
            if (err) {
                reject(err);
            } else if (!row) {
                // Definir o idioma padrão como 'portuguese' se não estiver definido
                // OR IGNORE: chamadas concorrentes podem tentar inserir a mesma guild
                db.run("INSERT OR IGNORE INTO server_language (guild_id, language) VALUES (?, ?)", [guildId, "portuguese"], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        log(null, `Idioma padrão definido para guild ${guildId}`);
                        resolve("portuguese");
                    }
                });
            } else {
                resolve(row.language);
            }
        });
    });
}

function getPrefix(guildId) {
    return new Promise((resolve, reject) => {
        db.get("SELECT prefix FROM server_prefix WHERE guild_id = ?", [guildId], (err, row) => {
            if (err) reject(err);
            else resolve(row ? row.prefix : null);
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

    // serialize: garante que o INSERT rode antes do UPDATE
    db.serialize(() => {
        db.run(
            `INSERT OR IGNORE INTO user_records (guild_id, guild_name, user_id, username) VALUES (?, ?, ?, ?)`,
            [guildId, guildName, userId, username],
            (err) => { if (err) error(null, `Erro ao inserir user_records (${userId}): ${err.message}`); }
        );
        db.run(
            `UPDATE user_records SET ${setSql} WHERE guild_id = ? AND user_id = ? AND (${column} IS NULL OR ${column} < ?)`,
            [guildName, username, value, ...extraVals, guildId, userId, value],
            (err) => { if (err) error(null, `Erro ao atualizar user_records ${column} (${userId}): ${err.message}`); }
        );
    });
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
    DEFAULT_PREFIX,
    getLanguagePreference,
    getPrefix,
    updateRecord,
    getUserRecords,
};
