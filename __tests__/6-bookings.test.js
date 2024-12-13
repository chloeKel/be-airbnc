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

describe("POST /api/properties/:id/booking", () => {
  beforeEach(async () => {
    goodPayload = {
      guest_id: 1,
      check_in_date: "2026-12-16",
      check_out_date: "2026-12-19",
    };
    badPayload = {
      guest_id: 1,
      check_in_date: "2025-12-16",
      check_out_date: "2025-12-19",
    };
  });

  test("successful post should respond with a server status of 201", async () => {
    const { status } = await request(app).post("/api/properties/9/booking").send(goodPayload);
    expect(status).toBe(201);
  });

  test("unsuccessful post with an id of the wrong data type or ID that does not exist should respond with a server status of 400 and a msg of Bad request", async () => {
    const invalid = await request(app).post("/api/properties/invalid/booking").send(goodPayload);
    const doesNotExist = await request(app).post("/api/properties/100000/booking").send(goodPayload);
    const response = await Promise.all([invalid, doesNotExist]);
    response.forEach((res) => {
      expect(res.status).toBe(400);
      expect(res.body.msg).toBe("Bad request");
    });
  });

  test("It should insert a new row into the propertys table assuming there is not a clashing booking", async () => {
    const { rows } = await db.query("SELECT * FROM bookings;");
    const beforePost = rows.length;
    await request(app).post("/api/properties/9/booking").send(goodPayload);
    const afterPost = await db.query("SELECT * FROM bookings;");
    expect(afterPost.rows).toBeArrayOfSize(beforePost + 1);
  });

  test("If the property has already been booked over the provided dates, should respond with a status of 409 (conflict) and a msg of Dates unavailable for booking", async () => {
    const response = await request(app).post("/api/properties/9/booking").send(badPayload);
    expect(response.status).toBe(409);
    expect(response.body.msg).toBe("Dates unavailable for booking");
  });

  test("successful booking should respond with a successful booking object with a keys of the booking id and msg, the msg should have the value of Booking successful", async () => {
    const { body } = await request(app).post("/api/properties/9/booking").send(goodPayload);
    expect(body).toBeObject();
    expect(body).toContainKeys(["msg", "booking_id"]);
    expect(body.msg).toBe("Booking Successful");
  });
});

describe("PATCH /api/bookings/:id", () => {
  beforeEach(async () => {
    mockPayload1 = {
      check_in_date: "2026-12-15",
      check_out_date: "2026-12-18",
    };

    mockPayload2 = {
      check_in_date: "2025-12-17",
    };
  });

  test("should respond with a server status of 200", async () => {
    const { status } = await request(app).patch("/api/bookings/1").send(mockPayload1);
    expect(status).toBe(200);
  });

  test("unsuccessful get with an id of the wrong data type should respond with a server status of 400 and a msg of Bad request", async () => {
    const response = await request(app).patch("/api/bookings/invalid").send(mockPayload1);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Bad request");
  });

  test("unsuccessful get with a booking id that does not exist should respond with a server status of 400 and a msg of Booking does not exist", async () => {
    const response = await request(app).patch("/api/bookings/100000").send(mockPayload1);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Booking does not exist");
  });

  test("should respond with all properties of the row", async () => {
    const { body } = await request(app).patch("/api/bookings/1").send(mockPayload1);
    expect(body).toContainKeys(["booking_id", "guest_id", "check_in_date", "check_out_date", "created_at", "guest_id", "property_id"]);
  });

  test("should respond with all updated properties plus any properties that have not been updated", async () => {
    const prevBooking = await db.query("SELECT * FROM bookings WHERE booking_id = 1;");
    const { body } = await request(app).patch("/api/bookings/1").send(mockPayload1);
    expect(body.check_in_date).not.toBe(prevBooking.check_in_date);
    expect(body.check_out_date).not.toBe(prevBooking.check_out_date);
  });

  test("If the user enters a date that has already been booked, should respond with a status of 409 (conflict) and a msg of Dates unavailable for booking", async () => {
    const response = await request(app).patch("/api/bookings/1").send(mockPayload2);
    expect(response.status).toBe(409);
    expect(response.body.msg).toBe("Dates unavailable for booking");
  });
});

describe("DELETE /api/bookings/:id", () => {
  test("successful delete should respond with a server status of 204", async () => {
    const { status } = await request(app).delete("/api/bookings/1");
    expect(status).toBe(204);
  });

  test("unsuccessful delete with an id that does not exist should respond with a server status of 400 and a msg of Booking does not exist", async () => {
    const response = await request(app).delete("/api/bookings/10000");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Booking does not exist");
  });

  test("unsuccessful delete with an id of the wrong data type should respond with a server status of 400 and a msg of Bad request", async () => {
    const response = await request(app).delete("/api/bookings/invalid");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Bad request");
  });

  test("should remove row of the favourite_id passed", async () => {
    const beforeDelete = await db.query("SELECT * FROM bookings WHERE booking_id = 1;");
    expect(beforeDelete.rows).toBeArrayOfSize(1);
    await request(app).delete("/api/bookings/1");
    const afterDelete = await db.query("SELECT * FROM bookings WHERE booking_id = 1;");
    expect(afterDelete.rows).toBeArrayOfSize(0);
  });

  test("should respond with no content", async () => {
    const { body } = await request(app).delete("/api/bookings/1");
    expect(body).toBeEmptyObject();
  });
});
