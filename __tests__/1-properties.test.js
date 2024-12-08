const app = require("../app/app");
const request = require("supertest");
const db = require("../db/connection");
const { seed } = require("../db/seed");
const { propertiesData, usersData } = require("../db/data/test/index");

beforeEach(async () => {
  await seed();
  getHappyPaths = [
    "/api/properties",
    "/api/properties?maxprice=100",
    "/api/properties?minprice=100",
    "/api/properties?sort=price_per_night",
    "/api/properties?sort=favourite_count",
    "/api/properties?host_id=5",
  ];
  pathsNotFound = ["/api/priperties"];
  badRequests = ["/api/properties?maxprice=invalid", "/api/properties?minprice=invalid", "/api/properties?sort=invalid", "/api/properties?order=invalid"];
});

afterAll(async () => {
  await db.end();
});

describe("GET /api/properties... 200 server status", () => {
  test("all happy path end points should response with a server status of 200", async () => {
    const response = await Promise.all(getHappyPaths.map((endpoint) => request(app).get(endpoint)));
    response.forEach((response) => expect(response.status).toBe(200));
  });
});

describe("GET /api/properties... response data types", () => {
  test("All happy path endpoints should respond with an array of objects", async () => {
    const response = await Promise.all(getHappyPaths.map((endpoint) => request(app).get(endpoint)));
    response.forEach(({ body }) => {
      expect(body.properties).toBeArray();
      body.properties.forEach((property) => expect(property).toBeObject());
    });
  });
});

describe("GET /api/properties", () => {
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

  test("should have favourite_count property, with the value of the number of times the property has been favourited, joined from favourites table", async () => {
    const { body } = await request(app).get("/api/properties");
    body.properties.forEach((property) => {
      expect(property).toContainKey("favourite_count");
      expect(parseFloat(property["favourite_count"])).toBeNumber();
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
  test("If maxprice is passed, should return properties of max price_per_night or less", async () => {
    const { body } = await request(app).get("/api/properties?maxprice=100");
    body.properties.forEach((property) => {
      expect(property.price_per_night).toBeWithin(0, 101);
    });
  });

  test("if no maxprice is passed, should return all properties", async () => {
    const numOfProperties = propertiesData.length;
    const { body } = await request(app).get("/api/properties");
    expect(body.properties).toBeArrayOfSize(numOfProperties);
  });
});

describe("GET /api/properties?minprice=<price_per_night>", () => {
  test("If minprice is passed, should return properties of min price_per_night or more", async () => {
    const { body } = await request(app).get("/api/properties?minprice=100");
    body.properties.forEach((property) => {
      expect(property.price_per_night).toBeWithin(100, 251);
    });
  });

  test("if no minprice is passed, should return all properties", async () => {
    const numOfProperties = propertiesData.length;
    const { body } = await request(app).get("/api/properties");
    expect(body.properties).toBeArrayOfSize(numOfProperties);
  });
});

describe("GET /api/properties?sort=<price_per_night | favourite_count>", () => {
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
  test("when host id is specified should return properties listed under that host id", async () => {
    const { body } = await request(app).get("/api/properties?host_id=5");
    const host = `${usersData[4].first_name} ${usersData[4].surname}`;
    expect(body.properties.every((property) => property.host === host)).toBeTrue();
  });
});

describe("GET error handling all paths", () => {
  test("Path not found end points should respond with a server status of 404", async () => {
    const response = await Promise.all(pathsNotFound.map((endpoint) => request(app).get(endpoint)));
    response.forEach((response) => {
      expect(response.status).toBe(404);
      expect(response.body.msg).toBe("Path not found");
    });
  });

  test("Bad request end points should respond with a server status of 400", async () => {
    const response = await Promise.all(badRequests.map((endpoint) => request(app).get(endpoint)));
    response.forEach((response) => {
      expect(response.status).toBe(400);
      expect(response.body.msg).toMatch(/Bad request|Invalid sorting criteria/);
    });
  });
});
