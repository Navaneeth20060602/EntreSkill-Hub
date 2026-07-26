// Dumps the configured PostgreSQL database to database/backup.sql using
// pg_dump. Requires the postgresql-client tools to be installed locally.
//
// Usage: node scripts/backup.js

const path = require("path");
const { execSync } = require("child_process");
require("dotenv").config({ path: path.join(__dirname, "..", "server", ".env.development") });

const outputPath = path.join(__dirname, "..", "database", "backup.sql");

function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. Check server/.env.development.");
    process.exit(1);
  }

  console.log(`Backing up database to ${outputPath} ...`);

  try {
    execSync(`pg_dump "${databaseUrl}" -f "${outputPath}"`, { stdio: "inherit" });
    console.log("Backup complete.");
  } catch (error) {
    console.error("Backup failed. Is pg_dump installed and on your PATH?");
    process.exit(1);
  }
}

main();
