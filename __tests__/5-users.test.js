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

describe("GET /api/users/:id", () => {
  test("successful get should respond with a sever status of 200", async () => {
    const { status } = await request(app).get("/api/users/1");
    expect(status).toBe(200);
  });

  test("unsuccessful get with an id of the wrong data type should respond with a server status of 404 and a msg of Bad request", async () => {
    const response = await request(app).get("/api/users/invalid");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Bad request");
  });

  test("unsuccessful get with a property id that does not exist should respond with a server status of 400 and a msg of Property does not exist", async () => {
    const response = await request(app).get("/api/users/100000");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("User does not exist");
  });

  test("successful get should respond with an object with the key of user and properties of user_id, first_name, surname, email, phone_number, avatar and created_at", async () => {
    const { body } = await request(app).get("/api/users/1");
    expect(body.user).toBeObject();
    expect(body.user).toContainKeys(["user_id", "first_name", "surname", "email", "phone_number", "avatar", "created_at"]);
  });
});
