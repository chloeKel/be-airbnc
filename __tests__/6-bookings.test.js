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

describe("GET /api/properties/:id/bookings", () => {
  test("successful get should respond with a sever status of 200", async () => {
    const { status } = await request(app).get("/api/properties/1/bookings");
    expect(status).toBe(200);
  });

  test("unsuccessful get with an id of the wrong data type should respond with a server status of 400 and a msg of Bad request", async () => {
    const response = await request(app).get("/api/properties/invalid/bookings");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Bad request");
  });

  test("unsuccessful get with an id that does not exist should respond with a server status of 404 and a msg of Property does not exist", async () => {
    const response = await request(app).get("/api/properties/100000/bookings");
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("Property does not exist");
  });

  test("If property has no bookings respond with a server status of 200 and a msg of No bookings for this property", async () => {
    const response = await request(app).get("/api/properties/10/bookings");
    expect(response.status).toBe(200);
    expect(response.body.bookings).toBeArrayOfSize(0);
    expect(response.body.msg).toBe("No bookings for this property");
  });

  test("successful get should respond with a body object with the keys of bookings and property_id", async () => {
    const { body } = await request(app).get("/api/properties/1/bookings");
    expect(body).toBeObject();
    expect(body).toContainKeys(["bookings", "property_id"]);
  });

  test("bookings key should respond with an array of objects with the keys of booking_id, check_in_date, check_out_date, created_at from bookings table", async () => {
    const { body } = await request(app).get("/api/properties/1/bookings");
    expect(body.bookings).toBeArray();
    body.bookings.forEach((booking) => {
      expect(booking).toContainKeys(["booking_id", "check_in_date", "check_out_date", "created_at"]);
    });
  });

  test("bookings should come back from latest checkout_date to earliest", async () => {
    const { body } = await request(app).get("/api/properties/6/bookings");
    expect(body.bookings).toBeSortedBy("check_out_date", { descending: true });
  });
});
