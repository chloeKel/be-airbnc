const app = require("../app/app");
const request = require("supertest");
const db = require("../db/connection");
const { seed } = require("../db/seed");
const { propertiesData } = require("../db/data/test/index");
require("jest-sorted");

beforeEach(async () => {
  await seed();
});

afterAll(async () => {
  await db.end();
});

describe("GET /api/properties", () => {
  test("should respond with a server status of 200", async () => {
    const response = await request(app).get("/api/properties");
    expect(response.status).toBe(200);
  });

  test("should return array of objects", async () => {
    const { body } = await request(app).get("/api/properties");
    expect(Array.isArray(body.properties)).toBe(true);
    body.properties.forEach((property) => {
      expect(typeof property).toBe("object");
    });
  });

  test("should return same number of property objects in the array as property objects seeded into database", async () => {
    const numOfProperties = propertiesData.length;
    const { body } = await request(app).get("/api/properties");
    expect(body.properties.length).toBe(numOfProperties);
  });

  test("should have property_id, property_name, location and price_per_night properties", async () => {
    const { body } = await request(app).get("/api/properties");
    body.properties.forEach((item) => {
      expect(item).toHaveProperty("property_id");
      expect(item).toHaveProperty("property_name");
      expect(item).toHaveProperty("location");
      expect(item).toHaveProperty("price_per_night");
    });
  });

  test("should have host property, with the value of the hosts full name, joined from users table", async () => {
    const { body } = await request(app).get("/api/properties");
    body.properties.forEach((item) => {
      expect(item).toHaveProperty("host");
    });
  });

  test("Properties should come back ordered by most favourited to least by default", () => {});
});
