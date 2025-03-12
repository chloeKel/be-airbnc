const app = require("../app/app");
const request = require("supertest");
const db = require("../db/connection");
const { seed } = require("../db/seed");
const { propertiesData, usersData } = require("../db/data/test/index");

beforeEach(async () => {
  await seed();
});

afterAll(async () => {
  await db.end();
});

describe("/api/properties happy paths", () => {
  describe("GET /api/properties", () => {
    test("successful request should respond with a server status of 200", async () => {
      const response = await request(app).get("/api/properties");
      expect(response.status).toBe(200);
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

    test("should have host property, joined from users table", async () => {
      const { body } = await request(app).get("/api/properties");
      body.properties.forEach((property) => {
        expect(property).toContainKey("host");
      });
    });

    test("should have favourite_count property, with the value of the number of times the property has been favourited, and favourited column with the value of null when an optional user_id query is not added to endpoint, joined from favourites table", async () => {
      const { body } = await request(app).get("/api/properties");
      body.properties.forEach((property) => {
        expect(property).toContainKeys(["favourite_count", "favourited"]);
        expect(parseFloat(property["favourite_count"])).toBeNumber();
        expect(property["favourited"]).toBeNil();
      });
    });

    test("should have average_rating property joined from favourites table", async () => {
      const { body } = await request(app).get("/api/properties");
      body.properties.forEach((property) => {
        expect(property).toContainKey("average_rating");
      });
    });

    test("should have image property with image url from images table, if no image has been added for the property and the image key's value is null, the image key should not appear", async () => {
      const { body } = await request(app).get("/api/properties");
      body.properties.forEach((property) => {
        if (property.image) {
          expect(property.image).not.toBe(null);
        }
      });
    });

    test("Returned properties should be ordered by most favourited to least by default", async () => {
      const { body } = await request(app).get("/api/properties");
      expect(body.properties).toBeSortedBy("favourite_count", {
        descending: true,
      });
    });
  });

  describe("GET /api/properties?maxprice=<price_per_night>", () => {
    test("successful request should respond with a server status of 200", async () => {
      const response = await request(app).get("/api/properties?maxprice=100");
      expect(response.status).toBe(200);
    });

    test("If maxprice is passed, should return properties of max price_per_night or less", async () => {
      const { body } = await request(app).get("/api/properties?maxprice=100");
      body.properties.forEach((property) => {
        expect(property.price_per_night).toBeWithin(0, 101);
      });
    });
  });

  describe("GET /api/properties?minprice=<price_per_night>", () => {
    test("successful request should respond with a server status of 200", async () => {
      const response = await request(app).get("/api/properties?minprice=100");
      expect(response.status).toBe(200);
    });

    test("If minprice is passed, should return properties of min price_per_night or more", async () => {
      const { body } = await request(app).get("/api/properties?minprice=100");
      body.properties.forEach((property) => {
        expect(property.price_per_night).toBeWithin(100, 251);
      });
    });
  });

  describe("GET /api/properties?sort=<price_per_night | favourite_count>", () => {
    test("successful request sorted by price per night should respond with a server status of 200", async () => {
      const response = await request(app).get("/api/properties?sort=price_per_night");
      expect(response.status).toBe(200);
    });

    test("successful request sorted by favourite count should respond with a server status of 200", async () => {
      const response = await request(app).get("/api/properties?sort=favourite_count");
      expect(response.status).toBe(200);
    });

    test("when price_per_night sort is specified, it should return properties sorted by price_per_night", async () => {
      const { body } = await request(app).get("/api/properties?sort=price_per_night");
      const formattedBody = body.properties.map((property) => {
        return {
          ...property,
          price_per_night: parseFloat(property.price_per_night),
        };
      });
      expect(formattedBody).toBeSortedBy("price_per_night", {
        descending: true,
      });
    });

    test("when favourite_count sort is specified, it should return properties sorted by favourite_count", async () => {
      const { body } = await request(app).get("/api/properties?sort=favourite_count");
      expect(body.properties).toBeSortedBy("favourite_count", {
        descending: true,
      });
    });
  });

  describe("GET /api/properties?order=<asc | desc>", () => {
    test("successful request ordered by asc should respond with a server status of 200", async () => {
      const response = await request(app).get("/api/properties?order=asc");
      expect(response.status).toBe(200);
    });

    test("successful request ordered by desc should respond with a server status of 200", async () => {
      const response = await request(app).get("/api/properties?order=desc");
      expect(response.status).toBe(200);
    });

    test("when order is specified to asc, it should return properties sorted in asc order", async () => {
      const { body } = await request(app).get("/api/properties?order=asc");
      expect(body.properties).toBeSortedBy("favourite_count");
    });

    test("when order is specified to desc, it should return properties sorted in asc order", async () => {
      const { body } = await request(app).get("/api/properties?order=desc");
      expect(body.properties).toBeSortedBy("favourite_count", { descending: true });
    });
  });

  describe("GET /api/properties?host=<id>", () => {
    test("successful request should respond with a server status of 200", async () => {
      const response = await request(app).get("/api/properties?host_id=5");
      expect(response.status).toBe(200);
    });

    test("when host id is specified should return properties listed under that host id", async () => {
      const { body } = await request(app).get("/api/properties?host_id=5");
      const host = `${usersData[4].first_name} ${usersData[4].surname}`;
      expect(body.properties.every((property) => property.host === host)).toBeTrue();
    });
  });

  describe("GET /api/properties?user=<id>", () => {
    test("successful request should respond with a server status of 200", async () => {
      const response = await request(app).get("/api/properties?user_id=2");
      expect(response.status).toBe(200);
    });

    test("when user id is specified should return properties with a favourited property with the value of a boolean", async () => {
      const { body } = await request(app).get("/api/properties?user_id=2");
      body.properties.forEach((property) => {
        expect(property).toContainKey("favourited");
        expect(property["favourited"]).toBeBoolean();
      });
    });
  });
});

describe("/api/properties sad paths", () => {
  test("unsuccessful get with a host id of the wrong data type should respond with a server status of 400 and a msg of Bad request", async () => {
    const response = await request(app).get("/api/properties?host_id=invalid");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Bad request");
  });
});
