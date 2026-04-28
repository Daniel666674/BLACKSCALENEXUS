#!/usr/bin/env node
/**
 * Post-deploy verification: confirms the database is encrypted by attempting
 * to open it WITHOUT the key. If SQLCipher is active, this must throw.
 *
 * Usage: node scripts/verify-encryption.js
 * Expected exit code: 0 (encryption confirmed)
 */

const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(process.cwd(), "data", "crm.db");

try {
  const db = new Database(DB_PATH);
  // If we can read the schema without a key, encryption is NOT active
  db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.error("FAIL: Database opened without encryption key. SQLCipher is NOT active.");
  console.error("Ensure better-sqlite3 was compiled with SQLCipher and ENCRYPTION_KEY is set.");
  process.exit(1);
} catch (err) {
  if (err.message && err.message.includes("SQLITE_NOTADB")) {
    console.log("OK: Database is encrypted. SQLCipher is active.");
    process.exit(0);
  }
  console.error("FAIL: Unexpected error during encryption check:", err.message);
  process.exit(1);
}
