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

describe("GET /api/properties/:id/reviews", () => {
  test("successful get should respond with a sever status of 200", async () => {
    const { status } = await request(app).get("/api/properties/1/reviews");
    expect(status).toBe(200);
  });

  test("unsuccessful get with an id of the wrong data type should respond with a server status of 404 and a msg of Bad request", async () => {
    const response = await request(app).get("/api/properties/invalid/reviews");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Bad request");
  });

  test("unsuccessful get with a property id that does not exist should respond with a server status of 400 and a msg of Property does not exist", async () => {
    const response = await request(app).get("/api/properties/100000/reviews");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Property does not exist");
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
});

//  review_id | property_id | guest_id | rating
// -----------+-------------+----------+--------
//          1 |           3 |        4 |      4
//          2 |           1 |        2 |      2
//          3 |           6 |        6 |      5
//          4 |           4 |        4 |      2
//          5 |           9 |        6 |      3
//          6 |           5 |        2 |      4
//          7 |           7 |        4 |      5
//          8 |           1 |        6 |      3
//          9 |           3 |        4 |      3
//         10 |           9 |        2 |      5
//         11 |           6 |        6 |      1
// (11 rows)
