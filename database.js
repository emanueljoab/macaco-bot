const sqlite3 = require("sqlite3").verbose();
const { log, error } = require("./utils");
const db = new sqlite3.Database("./macaco.db");

const DEFAULT_PREFIX = "pls";

// Valor máximo possível de cada recorde; atingi-lo incrementa o contador
// usado como critério de desempate no rank
const RECORD_MAX = {
    max_pp: 20,
    max_howgay: 100,
    max_simp: 100,
    max_stank: 100,
};

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
        max_howgay_at INTEGER,
        max_howgay_count INTEGER,
        max_pp INTEGER,
        max_pp_at INTEGER,
        max_pp_count INTEGER,
        max_simp INTEGER,
        max_simp_at INTEGER,
        max_simp_count INTEGER,
        max_stank INTEGER,
        max_stank_at INTEGER,
        max_stank_count INTEGER,
        PRIMARY KEY (guild_id, user_id)
    )`,
        (err) => {
            if (err) error(null, `Erro ao criar tabela user_records: ${err.message}`);
            else if (!existing.has("user_records")) log(null, `Tabela criada: user_records`);
        }
    );

    // Migração: colunas de contagem de quantas vezes o valor máximo foi atingido
    for (const col of ["max_howgay_count", "max_pp_count", "max_simp_count", "max_stank_count"]) {
        db.run(`ALTER TABLE user_records ADD COLUMN ${col} INTEGER`, (err) => {
            if (err && !/duplicate column/i.test(err.message)) error(null, `Erro ao adicionar coluna ${col}: ${err.message}`);
            else if (!err) log(null, `Coluna criada: user_records.${col}`);
        });
    }

    // Migração: colunas de timestamp (ms) de quando cada recorde foi atingido
    for (const col of ["max_howgay_at", "max_pp_at", "max_simp_at", "max_stank_at"]) {
        db.run(`ALTER TABLE user_records ADD COLUMN ${col} INTEGER`, (err) => {
            if (err && !/duplicate column/i.test(err.message)) error(null, `Erro ao adicionar coluna ${col}: ${err.message}`);
            else if (!err) log(null, `Coluna criada: user_records.${col}`);
        });
    }

    // Migração: max_pp_string era write-only e derivável de max_pp
    db.run(`ALTER TABLE user_records DROP COLUMN max_pp_string`, (err) => {
        if (err && !/no such column/i.test(err.message)) error(null, `Erro ao remover coluna max_pp_string: ${err.message}`);
        else if (!err) log(null, `Coluna removida: user_records.max_pp_string`);
    });
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

function updateRecord(guildId, guildName, userId, username, column, value) {
    // serialize: garante que o INSERT rode antes do UPDATE
    db.serialize(() => {
        db.run(
            `INSERT OR IGNORE INTO user_records (guild_id, guild_name, user_id, username) VALUES (?, ?, ?, ?)`,
            [guildId, guildName, userId, username],
            (err) => { if (err) error(null, `Erro ao inserir user_records (${userId}): ${err.message}`); }
        );
        // Empatar com o próprio recorde só grava quando ainda não há timestamp
        // (recordes anteriores à migração podem "carimbar" a data repetindo o valor)
        db.run(
            `UPDATE user_records SET guild_name = ?, username = ?, ${column} = ?, ${column}_at = ?
             WHERE guild_id = ? AND user_id = ?
             AND (${column} IS NULL OR ${column} < ? OR (${column} = ? AND ${column}_at IS NULL))`,
            [guildName, username, value, Date.now(), guildId, userId, value, value],
            (err) => { if (err) error(null, `Erro ao atualizar user_records ${column} (${userId}): ${err.message}`); }
        );
        // Atingir o valor máximo conta mesmo quando o recorde não muda
        if (value === RECORD_MAX[column]) {
            db.run(
                `UPDATE user_records SET ${column}_count = COALESCE(${column}_count, 0) + 1
                 WHERE guild_id = ? AND user_id = ?`,
                [guildId, userId],
                (err) => { if (err) error(null, `Erro ao incrementar user_records ${column}_count (${userId}): ${err.message}`); }
            );
        }
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
    RECORD_MAX,
    getLanguagePreference,
    getPrefix,
    updateRecord,
    getUserRecords,
};
