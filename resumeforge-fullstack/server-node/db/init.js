import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!fs.existsSync(__dirname)) {
  fs.mkdirSync(__dirname, { recursive: true });
}

const dbPath = path.join(__dirname, 'resumeforge.sqlite');
const sqlite = sqlite3.verbose();

export const db = new sqlite.Database(dbPath, (err) => {
  if (err) console.error('Failed to connect to SQLite:', err.message);
  else console.log(`Connected to SQLite database at: ${dbPath}`);
});

export function initDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS shared_resumes (
        id TEXT PRIMARY KEY,
        resume_data TEXT NOT NULL,
        template_id TEXT NOT NULL DEFAULT 'modern',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        views_count INTEGER DEFAULT 0
      );
    `);
    db.run(`CREATE INDEX IF NOT EXISTS idx_shared_created_at ON shared_resumes(created_at);`);
  });
}

export function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}
