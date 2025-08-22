const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../../memory.db");
const db = new sqlite3.Database(dbPath);

db.run(`CREATE TABLE IF NOT EXISTS memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT,
    content TEXT,
    date TEXT
)`);

// Sauvegarder un message
function saveMemory(role, content) {
    db.run(`INSERT INTO memory (role, content, date) VALUES (?, ?, ?)`, [role, content, new Date().toISOString()]);
}

// Récupérer l'historique
function getMemory(limit = 20) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT role, content, date FROM memory ORDER BY id DESC LIMIT ?`,
            [limit],
            (err, rows) => {
                if (err) return reject(err);
                resolve(rows.reverse());
            }
        );
    });
}

// ✅ Export correct
module.exports = { saveMemory, getMemory };