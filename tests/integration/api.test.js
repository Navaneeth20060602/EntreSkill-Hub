const request = require("supertest");
const app = require("../../server/app");

describe("API health check", () => {
  it("responds on /api/health", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 404 for an unknown route", async () => {
    const res = await request(app).get("/api/this-route-does-not-exist");
    expect(res.status).toBe(404);
  });
});
