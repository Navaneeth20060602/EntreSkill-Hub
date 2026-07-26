const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

// Requests are logged to the console in dev, and additionally appended to
// /logs/access.log so the "logs" folder in the repo is actually used.
const logDirectory = path.join(__dirname, "..", "..", "logs");

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, "access.log"),
  { flags: "a" }
);

const consoleLogger = morgan(process.env.NODE_ENV === "development" ? "dev" : "combined");
const fileLogger = morgan("combined", { stream: accessLogStream });

module.exports = { consoleLogger, fileLogger };
