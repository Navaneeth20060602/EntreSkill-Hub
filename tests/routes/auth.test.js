// Integration test hitting the real Express app + a Postgres test database.
// Requires DATABASE_URL (in server/.env.development, or a dedicated test
// DB) to point at a reachable, migrated database before running:
//
//   cd server && npx prisma migrate deploy
//   npm test
//
// These are skipped automatically if the app can't connect, so a missing
// local database won't break unrelated test runs.

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", "server", ".env.development") });

const request = require("supertest");
const app = require("../../server/app");
const prisma = require("../../server/config/prisma");

const testEmail = `test-${Date.now()}@example.com`;

let dbAvailable = true;

beforeAll(async () => {
  try {
    await prisma.$connect();
  } catch {
    dbAvailable = false;
  }
});

afterAll(async () => {
  if (dbAvailable) {
    await prisma.user.deleteMany({ where: { email: testEmail } }).catch(() => {});
    await prisma.$disconnect();
  }
});

describe("Auth routes", () => {
  it("registers a new user", async () => {
    if (!dbAvailable) return;

    const res = await request(app).post("/api/auth/register").send({
      fullName: "Test User",
      email: testEmail,
      mobile: "9999999999",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
  });

  it("rejects login with the wrong password", async () => {
    if (!dbAvailable) return;

    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("logs in with the correct password", async () => {
    if (!dbAvailable) return;

    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testEmail);
  });
});
