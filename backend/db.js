import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

sqlite3.verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data.sqlite');

export function getDb() {
  return new sqlite3.Database(dbPath);
}

export function initDb() {
  const db = getDb();
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS scanners (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        status TEXT NOT NULL,
        last_seen TEXT NOT NULL
      )`
    );
  });
  return db;
}
