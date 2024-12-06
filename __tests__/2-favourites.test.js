const app = require("../app/app");
const request = require("supertest");
const db = require("../db/connection");
const { seed } = require("../db/seed");

beforeEach(async () => {
  mockPayload = { guest_id: 1 };
  await seed();
});

afterAll(async () => {
  await db.end();
});

describe("POST /api/properties/:id/favourite", () => {
  test("successful post should respond with a server status of 201", async () => {
    const response = await request(app).post("/api/properties/1/favourite").send(mockPayload);
    expect(response.status).toBe(201);
  });

  test("unsuccessful post with an id of the wrong data type or ID that does not exist should respond with a server status of 400 and a msg of Bad request", async () => {
    const invalid = request(app).post("/api/properties/invalid/favourite").send(mockPayload);
    const doesNotExist = request(app).post("/api/properties/100000/favourite").send(mockPayload);
    const response = await Promise.all([invalid, doesNotExist]);
    response.forEach((res) => {
      expect(res.status).toBe(400);
      expect(res.body.msg).toBe("Bad request");
    });
  });

  test("It should insert a new row into the favourites table", async () => {
    const favourites = await db.query("SELECT * FROM favourites WHERE guest_id = 1;");
    const beforePostFavCount = favourites.rows.length;
    await request(app).post("/api/properties/1/favourite").send(mockPayload);
    const favouritesAfter = await db.query("SELECT * FROM favourites WHERE guest_id = 1;");
    expect(favouritesAfter.rows).toBeArrayOfSize(beforePostFavCount + 1);
  });

  test("should response with a success msg and a favourite_id", async () => {
    const { body } = await request(app).post("/api/properties/1/favourite").send(mockPayload);
    expect(body).toContainKeys(["msg", "favourite_id"]);
    expect(body.msg).toBe("Property favourited successfully");
  });
});
