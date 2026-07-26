// Restores the configured PostgreSQL database from database/backup.sql.
// Requires the postgresql-client tools to be installed locally.
//
// Usage: node scripts/restore.js

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
require("dotenv").config({ path: path.join(__dirname, "..", "server", ".env.development") });

const inputPath = path.join(__dirname, "..", "database", "backup.sql");

function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. Check server/.env.development.");
    process.exit(1);
  }

  if (!fs.existsSync(inputPath) || fs.statSync(inputPath).size === 0) {
    console.error(`No backup found at ${inputPath}. Run scripts/backup.js first.`);
    process.exit(1);
  }

  console.log(`Restoring database from ${inputPath} ...`);

  try {
    execSync(`psql "${databaseUrl}" -f "${inputPath}"`, { stdio: "inherit" });
    console.log("Restore complete.");
  } catch (error) {
    console.error("Restore failed. Is psql installed and on your PATH?");
    process.exit(1);
  }
}

main();
