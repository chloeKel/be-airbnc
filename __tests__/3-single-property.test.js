const app = require("../app/app");
const request = require("supertest");
const db = require("../db/connection");
const { seed } = require("../db/seed");

beforeEach(async () => {
  await seed();
});

afterAll(async () => {
  await db.end();
});

describe("GET /api/properties/:id happy path", () => {
  test("successful get should respond with a sever status of 200", async () => {
    const { status } = await request(app).get("/api/properties/1");
    expect(status).toBe(200);
  });

  test("successful get should respond with property object with the keys of property_id, property_name, location, price_per_night and description from properties table", async () => {
    const { body } = await request(app).get("/api/properties/1");
    expect(body.property).toBeObject();
    expect(body.property).toContainKeys(["property_id", "property_name", "location", "price_per_night", "description"]);
  });

  test("host_avatar, host_id and host keys should be joined from users table", async () => {
    const { body } = await request(app).get("/api/properties/1");
    expect(body.property).toContainKeys(["host_avatar", "host", "host_id"]);
  });

  test("favourite_count should be joined from favourites table", async () => {
    const { body } = await request(app).get("/api/properties/1");
    expect(body.property).toContainKey("favourite_count");
  });

  test("images should be joined from images table with an array of image_urls as the value", async () => {
    const { body } = await request(app).get("/api/properties/1");
    expect(body.property).toContainKey("images");
    expect(body.property["images"]).toBeArray();
  });

  test("average_rating should be joined from reviews table with sum of average rating", async () => {
    const { body } = await request(app).get("/api/properties/1");
    expect(body.property).toContainKey("average_rating");
  });

  test("should not have favourited column without user_id parameter", async () => {
    const { body } = await request(app).get("/api/properties/1");
    expect(body.property).not.toHaveProperty("favourited");
  });
});

describe("GET /api/properties/:id sad path", () => {
  test("unsuccessful get with an id of the wrong data type should respond with a server status of 400 and a msg of Bad request", async () => {
    const response = await request(app).get("/api/properties/invalid");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Bad request");
  });

  test("unsuccessful get with an id that does not exist should respond with a server status of 404 and a msg of Property does not exist", async () => {
    const response = await request(app).get("/api/properties/100000");
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("Oops! This property doesn't exist. Head back to explore more! 🏡✨");
  });
});

describe("GET /api/properties/:id?user_id=<id> happy path", () => {
  test("successful get should respond with a sever status of 200", async () => {
    const { status } = await request(app).get("/api/properties/1?user_id=2");
    expect(status).toBe(200);
  });

  test("should take optional ?user_id=<id> query that should indicate whether the user with the passed id has favourited this property on not, this returns the body with all keys and an additional key of favourited with a boolean value", async () => {
    const { body } = await request(app).get("/api/properties/1?user_id=2");
    expect(body.property).toContainKey("favourited");
    expect(body.property["favourited"]).toBeBoolean();
  });

  test("favourited should be true if the user has favourited the property", async () => {
    const { body } = await request(app).get("/api/properties/1?user_id=2");
    expect(body.property["favourited"]).toBe(true);
  });

  test("favourited should be false if the user has not favourited the property", async () => {
    const { body } = await request(app).get("/api/properties/1?user_id=1");
    expect(body.property["favourited"]).toBe(false);
  });
});

describe("GET /api/properties/:id?user_id=<id> sad path", () => {
  test("unsuccessful get with a user id of the wrong data type should respond with a server status of 404 and a msg of Path not found", async () => {
    const response = await request(app).get("/api/properties/1/user_id=invalid");
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("Path not found");
  });
});
