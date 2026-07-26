// Thin convenience wrapper so `node scripts/seed.js` works from the repo
// root - it just delegates to the real seed script in server/prisma/.
//
// Usage: node scripts/seed.js

const path = require("path");
const { execSync } = require("child_process");

const serverDir = path.join(__dirname, "..", "server");

console.log("Seeding database via server/prisma/seed.js ...");

execSync("node prisma/seed.js", { cwd: serverDir, stdio: "inherit" });
