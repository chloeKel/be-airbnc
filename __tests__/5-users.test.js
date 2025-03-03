const app = require("../app/app");
const request = require("supertest");
const db = require("../db/connection");
const { seed } = require("../db/seed");

beforeEach(async () => {
  mockPayload1 = {
    first_name: "test name",
    surname: "test surname",
    email: "test@test.com",
    phone_number: "01234567890",
    avatar: "test.jpg",
  };

  mockPayload2 = {
    first_name: "test name",
    surname: "test surname",
    email: "test@test.com",
  };

  await seed();
});

afterAll(async () => {
  await db.end();
});

describe("GET /api/users/:id happy path", () => {
  test("successful get should respond with a sever status of 200", async () => {
    const { status } = await request(app).get("/api/users/1");
    expect(status).toBe(200);
  });

  test("successful get should respond with an object with the key of user and properties of user_id, first_name, surname, email, phone_number, avatar and created_at", async () => {
    const { body } = await request(app).get("/api/users/1");
    expect(body.user).toBeObject();
    expect(body.user).toContainKeys(["user_id", "first_name", "surname", "email", "phone_number", "avatar", "created_at"]);
  });
});

describe("GET /api/users/:id sad path", () => {
  test("unsuccessful get with an id of the wrong data type should respond with a server status of 400 and a msg of Bad request", async () => {
    const response = await request(app).get("/api/users/invalid");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Bad request");
  });

  test("unsuccessful get with a user id that does not exist should respond with a server status of 404 and a msg of User does not exist", async () => {
    const response = await request(app).get("/api/users/100000");
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("Oops! This user doesn't exist. Head back to explore more! 🏡✨");
  });
});

describe("PATCH api/users/:id happy path", () => {
  test("should respond with a server status of 200", async () => {
    const { status } = await request(app).patch("/api/users/1").send(mockPayload1);
    expect(status).toBe(200);
  });

  test("should respond with all updated properties", async () => {
    const { body } = await request(app).patch("/api/users/1").send(mockPayload1);
    expect(body).toContainEntries([
      ["first_name", "test name"],
      ["surname", "test surname"],
      ["email", "test@test.com"],
      ["phone_number", "01234567890"],
      ["avatar", "test.jpg"],
    ]);
  });

  test("should respond with all updated properties plus any properties that have not been updated", async () => {
    const prevUser = await db.query("SELECT * FROM users WHERE user_id = 1;");
    const { body } = await request(app).patch("/api/users/1").send(mockPayload2);
    expect(body.first_name).toBe(mockPayload2.first_name);
    expect(body.surname).toBe(mockPayload2.surname);
    expect(body.email).toBe(mockPayload2.email);
    expect(body.phone_number).toBe(prevUser.rows[0].phone_number);
    expect(body.avatar).toBe(prevUser.rows[0].avatar);
  });
});

describe("PATCH api/users/:id sad path", () => {
  test("unsuccessful get with an id of the wrong data type should respond with a server status of 400 and a msg of Bad request", async () => {
    const response = await request(app).patch("/api/users/invalid").send(mockPayload1);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Bad request");
  });
});
