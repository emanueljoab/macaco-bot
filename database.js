const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./jokenpo.db");

// Criação da tabela se não existir
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
            if (err) {
                console.error("Erro ao criar a tabela:", err);
            } else {
                console.log("Tabela criada ou já existente.");
            }
        }
    );
});

module.exports = db;
