// Validation happens in middleware/validateMiddleware.js before the
// controller runs, so it can be tested without a database connection.

const request = require("supertest");
const app = require("../../server/app");

describe("Auth validation", () => {
  it("rejects registration with an invalid email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullName: "Test User",
      email: "not-an-email",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects registration with a short password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullName: "Test User",
      email: "valid@example.com",
      password: "123",
    });

    expect(res.status).toBe(400);
  });

  it("rejects login with missing fields", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });
});
