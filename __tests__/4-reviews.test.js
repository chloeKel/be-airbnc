const app = require("../app/app");
const request = require("supertest");
const db = require("../db/connection");
const { seed } = require("../db/seed");

beforeEach(async () => {
  mockPayload = {
    guest_id: 1,
    rating: 5,
    comment: "test comment",
  };

  mockBadPayload = {
    invalid_property: "invalid",
  };

  await seed();
});

afterAll(async () => {
  await db.end();
});

describe("GET /api/properties/:id/reviews happy path", () => {
  test("successful get should respond with a sever status of 200", async () => {
    const { status } = await request(app).get("/api/properties/1/reviews");
    expect(status).toBe(200);
  });

  test("successful get should respond with an object with the key of review and key of average_rating", async () => {
    const { body } = await request(app).get("/api/properties/1/reviews");
    expect(body).toBeObject();
    expect(body).toContainKeys(["reviews", "average_rating"]);
  });

  test("the review property should contain an array of objects with the keys of review_id, comment, rating and created_at from reviews table", async () => {
    const { body } = await request(app).get("/api/properties/1/reviews");
    expect(body.reviews).toBeArray();
    body.reviews.forEach((review) => {
      expect(review).toBeObject();
      expect(review).toContainKeys(["review_id", "comment", "rating", "created_at"]);
    });
  });

  test("guest and guest_avatar key should be joined from users table", async () => {
    const { body } = await request(app).get("/api/properties/1/reviews");
    body.reviews.forEach((review) => expect(review).toContainKeys(["guest", "guest_avatar"]));
  });

  test("the average rating object should contain the value of the average rating of all the ratings for that property", async () => {
    const { body } = await request(app).get("/api/properties/1/reviews");
    expect(body.average_rating).toBeNumber();
    expect(body.average_rating).toBeWithin(0, 5);
  });

  test("Reviews should come back ordered by latest to oldest by default.", async () => {
    const { body } = await request(app).get("/api/properties/1/reviews");
    expect(body.reviews).toBeSortedBy("created_at", {
      descending: true,
    });
  });

  test("If property has no reviews respond with a server status of 200 and empty array", async () => {
    const { body } = await request(app).get("/api/properties/2/reviews");
    expect(body.reviews).toBeArrayOfSize(0);
  });
});

describe("GET /api/properties/:id/reviews sad path", () => {
  test("unsuccessful get with an id of the wrong data type should respond with a server status of 400 and a msg of Bad request", async () => {
    const response = await request(app).get("/api/properties/invalid/reviews");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Bad request");
  });

  test("unsuccessful get with a property id that does not exist should respond with a server status of 404 and a msg of Property does not exist", async () => {
    const response = await request(app).get("/api/properties/100000/reviews");
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("Oops! This property doesn't exist. Head back to explore more! 🏡✨");
  });
});

describe("POST /api/properties/:id/reviews happy path", () => {
  test("successful post should respond with a server status of 201", async () => {
    const { status } = await request(app).post("/api/properties/1/reviews").send(mockPayload);
    expect(status).toBe(201);
  });

  test("It should insert a new row into the reviews table", async () => {
    const reviews = await db.query("SELECT * FROM reviews");
    const beforePost = reviews.rows.length;
    await request(app).post("/api/properties/1/reviews").send(mockPayload);
    const afterPost = await db.query("SELECT * FROM reviews;");
    expect(afterPost.rows).toBeArrayOfSize(beforePost + 1);
  });

  test("should respond with the new review object which should contain the keys of review_id, property_id, guest_id, rating, comment and created_at", async () => {
    const { body } = await request(app).post("/api/properties/1/reviews").send(mockPayload);
    expect(body).toBeObject();
    expect(body).toContainKeys(["review_id", "property_id", "guest_id", "rating", "comment", "created_at"]);
  });
});

describe("POST /api/properties/:id/reviews sad path", () => {
  test("unsuccessful post with an id of the wrong data type should respond with a server status of 400 and a msg of Bad request", async () => {
    const response = await request(app).post("/api/properties/invalid/reviews").send(mockPayload);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Bad request");
  });

  test("unsuccessful post with an id that does not exist should respond with a server status of 400 and a msg of Bad request", async () => {
    const response = await request(app).post("/api/properties/10000/reviews").send(mockPayload);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("Does not exist");
  });

  test("attempting to post with incorrect payload should respond with a server status of 400 and a msg of Bad request", async () => {
    const response = await request(app).post("/api/properties/1/reviews").send(mockBadPayload);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Bad request");
  });
});

describe("DELETE /api/reviews/:id happy path", () => {
  test("successful delete should respond with a server status of 204", async () => {
    const { status } = await request(app).delete("/api/reviews/1");
    expect(status).toBe(204);
  });

  test("should remove row of the review id passed", async () => {
    const beforeDelete = await db.query("SELECT * FROM reviews WHERE review_id = 1;");
    expect(beforeDelete.rows).toBeArrayOfSize(1);
    await request(app).delete("/api/reviews/1");
    const afterDelete = await db.query("SELECT * FROM reviews WHERE review_id = 1;");
    expect(afterDelete.rows).toBeArrayOfSize(0);
  });
});

describe("DELETE /api/reviews/:id sad path", () => {
  test("unsuccessful delete with an id of the wrong data type should respond with a server status of 400 and a msg of Bad request", async () => {
    const response = await request(app).delete("/api/reviews/invalid");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Bad request");
  });
});
