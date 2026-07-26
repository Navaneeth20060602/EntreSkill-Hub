const request = require("supertest");
const app = require("../../server/app");
const prisma = require("../../server/config/prisma");

let dbAvailable = true;

beforeAll(async () => {
  try {
    await prisma.$connect();
  } catch {
    dbAvailable = false;
  }
});

afterAll(async () => {
  if (dbAvailable) await prisma.$disconnect();
});

describe("Business routes", () => {
  it("lists business ideas", async () => {
    if (!dbAvailable) return;

    const res = await request(app).get("/api/business");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.businesses)).toBe(true);
  });

  it("returns 404 for an unknown business id", async () => {
    if (!dbAvailable) return;

    const res = await request(app).get("/api/business/does-not-exist");
    expect(res.status).toBe(404);
  });
});
