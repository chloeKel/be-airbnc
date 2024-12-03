const app = require("../app/app");
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seed");
require("jest-sorted");

beforeEach(async () => {
  await seed();
});

afterAll(async () => {
  await db.end();
});

describe("GET /api/properties", () => {
  xtest("should respond with a server status of 200", async () => {
    const response = await request(app).get("/api/properties");
    expect(response.status).toBe(200);
  });
});
