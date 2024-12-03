const app = require("../app/app");
const request = require("supertest");
const db = require("../db/connection");
const { seed } = require("../db/seed");
const { propertiesData } = require("../db/data/test/index");

beforeEach(async () => {
  await seed();
});

afterAll(async () => {
  await db.end();
});

describe("GET /api/properties", () => {
  describe("Happy path", () => {
    test("should respond with a server status of 200", async () => {
      const response = await request(app).get("/api/properties");
      expect(response.status).toBe(200);
    });

    test("should return array of objects", async () => {
      const { body } = await request(app).get("/api/properties");
      expect(Array.isArray(body.properties)).toBe(true);
      body.properties.forEach((property) => {
        expect(property).toBeObject();
      });
    });

    test("should return same number of property objects in the array as property objects seeded into database", async () => {
      const numOfProperties = propertiesData.length;
      const { body } = await request(app).get("/api/properties");
      expect(body.properties).toBeArrayOfSize(numOfProperties);
    });

    test("should have property_id, property_name, location and price_per_night properties", async () => {
      const { body } = await request(app).get("/api/properties");
      body.properties.forEach((property) => {
        expect(property).toContainKeys(["property_id", "property_name", "location", "price_per_night"]);
      });
    });

    test("should have host property, with the value of the hosts full name, joined from users table", async () => {
      const { body } = await request(app).get("/api/properties");
      body.properties.forEach((property) => {
        expect(property).toContainKey("host");
      });
    });

    test("should have favourite_count property, with the value of the number of times the property has been favourited, joined from favourites table", async () => {
      const { body } = await request(app).get("/api/properties");
      body.properties.forEach((property) => {
        expect(property).toContainKey("favourite_count");
      });
    });

    test("Returned properties should be ordered by most favourited to least by default", async () => {
      const { body } = await request(app).get("/api/properties");
      expect(body.properties).toBeSortedBy("favourite_count", {
        descending: true,
      });
    });
  });

  describe("Sad Path", () => {
    test("404 - path not found", async () => {
      const response = await request(app).get("/api/priperties");
      expect(response.status).toBe(404);
      expect(response.body.msg).toBe("Path not found");
    });
  });
});

describe("GET /api/properties?maxprice=<price_per_night>", () => {
  describe("Happy path", () => {
    test("should respond with a server status of 200", async () => {
      const response = await request(app).get("/api/properties?maxprice=95");
      expect(response.status).toBe(200);
    });

    test("If maxprice is passed, should return properties of max price_per_night or less", async () => {
      const { body } = await request(app).get("/api/properties?maxprice=100");
      body.properties.forEach((property) => {
        expect(property.price_per_night).toBeWithin(0, 100);
      });
    });

    test("if no maxprice is passed, should return all properties", async () => {
      const numOfProperties = propertiesData.length;
      const { body } = await request(app).get("/api/properties");
      expect(body.properties).toBeArrayOfSize(numOfProperties);
    });
  });

  describe("Sad path", () => {
    test("400 - Bad Request", async () => {
      const response = await request(app).get("/api/properties?maxprice=invalid");
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe("Bad request");
    });
  });
});

// Add the following optional queries to:
// GET /api/properties
// ?maxprice=<max cost per night>
// ?minprice=<min cost per night>
// ?sort=<cost_per_night | popularity>
// ?order=<ascending | descending>
// ?host=<id></id>
