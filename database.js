// database.js

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
    )`,
        (err) => {
            if (err) {
                console.error("Erro ao criar a tabela:", err);
            } else {
                console.log(`${new Date().toLocaleString("pt-BR")} | Tabela jokenpo_rank criada ou já existente.`);
            }
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
            if (err) {
                console.error("Erro ao criar a tabela jokenpo_history:", err);
            } else {
                console.log(`${new Date().toLocaleString("pt-BR")} | Tabela jokenpo_history criada ou já existente.`);
            }
        }
    );   
});

module.exports = db;
