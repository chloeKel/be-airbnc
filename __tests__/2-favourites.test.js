const app = require("../app/app");
const request = require("supertest");
const db = require("../db/connection");
const { seed } = require("../db/seed");

beforeEach(async () => {
  mockPayload = { guest_id: 1 };
  mockBadPayload = { invalid_property: "invalid" };
  await seed();
});

afterAll(async () => {
  await db.end();
});

describe("POST /api/properties/:id/favourite happy path", () => {
  test("successful post should respond with a server status of 201", async () => {
    const response = await request(app).post("/api/properties/1/favourite").send(mockPayload);
    expect(response.status).toBe(201);
  });

  test("It should insert a new row into the favourites table", async () => {
    const favourites = await db.query("SELECT * FROM favourites WHERE guest_id = 1;");
    const beforePost = favourites.rows.length;
    await request(app).post("/api/properties/1/favourite").send(mockPayload);
    const afterPost = await db.query("SELECT * FROM favourites WHERE guest_id = 1;");
    expect(afterPost.rows).toBeArrayOfSize(beforePost + 1);
  });

  test("should respond with a success msg and a favourite_id", async () => {
    const { body } = await request(app).post("/api/properties/1/favourite").send(mockPayload);
    expect(body).toContainKeys(["msg", "favourite_id"]);
    expect(body.msg).toBe("Property favourited successfully");
  });
});

describe("POST /api/properties/:id/favourite sad path", () => {
  test("unsuccessful post with an id of the wrong data type should respond with a server status of 400 and a msg of Bad request", async () => {
    const response = await request(app).post("/api/properties/invalid/favourite").send(mockPayload);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Bad request");
  });

  test("unsuccessful post with an id that does not exist should respond with a server status of 404 and a msg of Property does not exist", async () => {
    const response = await request(app).post("/api/properties/100000/favourite").send(mockPayload);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("Does not exist");
  });

  test("attempting to post with incorrect payload should respond with a server status of 400 and a msg of Bad request", async () => {
    const response = await request(app).post("/api/properties/1/favourite").send(mockBadPayload);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Bad request");
  });
});

describe("DELETE /api/favourites/:id happy path", () => {
  test("successful delete should respond with a server status of 204", async () => {
    const { status } = await request(app).delete("/api/favourites/1");
    expect(status).toBe(204);
  });

  test("should remove row of the favourite_id passed", async () => {
    const beforeDelete = await db.query("SELECT * FROM favourites WHERE favourite_id = 1");
    expect(beforeDelete.rows).toBeArrayOfSize(1);
    await request(app).delete("/api/favourites/1");
    const afterDelete = await db.query("SELECT * FROM favourites WHERE favourite_id = 1");
    expect(afterDelete.rows).toBeArrayOfSize(0);
  });
});

describe("DELETE /api/favourites/:id sad path", () => {
  test("unsuccessful delete with an id that does not exist should respond with a server status of 404 and a msg of Favourite does not exist", async () => {
    const response = await request(app).delete("/api/favourites/100000");
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("No favourite properties yet! Head back to explore! 🏡✨");
  });

  test("unsuccessful delete with an id of the wrong data type should respond with a server status of 400 and a msg of Bad request", async () => {
    const response = await request(app).delete("/api/favourites/invalid");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Bad request");
  });
});
