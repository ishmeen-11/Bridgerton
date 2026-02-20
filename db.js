/* ========================================
   Bridgerton App — Database Layer (SQLite)
   ======================================== */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'bridgerton.db');

let db;

function getDb() {
    if (!db) {
        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
        initTables();
    }
    return db;
}

function initTables() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS invitations (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            code        TEXT    NOT NULL UNIQUE,
            email       TEXT    NOT NULL,
            name        TEXT    DEFAULT '',
            used        INTEGER NOT NULL DEFAULT 0,
            created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS messages (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_name TEXT    NOT NULL,
            invite_code TEXT    NOT NULL,
            content     TEXT    NOT NULL,
            created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
        );
    `);
}

// ─── Invitation helpers ──────────────────────────────────

function createInvitation(code, email, name) {
    const stmt = getDb().prepare(
        'INSERT INTO invitations (code, email, name) VALUES (?, ?, ?)'
    );
    return stmt.run(code, email, name || '');
}

function findInvitationByCode(code) {
    return getDb().prepare('SELECT * FROM invitations WHERE code = ?').get(code);
}

function markInvitationUsed(code) {
    getDb().prepare('UPDATE invitations SET used = 1 WHERE code = ?').run(code);
}

function getAllInvitations() {
    return getDb().prepare('SELECT * FROM invitations ORDER BY created_at DESC').all();
}

// ─── Message helpers ─────────────────────────────────────

function saveMessage(senderName, inviteCode, content) {
    const stmt = getDb().prepare(
        'INSERT INTO messages (sender_name, invite_code, content) VALUES (?, ?, ?)'
    );
    return stmt.run(senderName, inviteCode, content);
}

function getRecentMessages(limit = 100) {
    return getDb().prepare(
        'SELECT * FROM messages ORDER BY created_at DESC LIMIT ?'
    ).all(limit).reverse();
}

module.exports = {
    getDb,
    createInvitation,
    findInvitationByCode,
    markInvitationUsed,
    getAllInvitations,
    saveMessage,
    getRecentMessages,
};
