// Prisma generates the actual database client from schema.prisma, so this
// file exposes a thin, named wrapper around the "User" model instead of
// duplicating the schema. Services import this instead of the raw prisma
// client so the model name they work with matches schema.prisma exactly.
const prisma = require("../config/prisma");

module.exports = prisma.user;
