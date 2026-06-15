import request from "supertest";

// Import your app (adjust the path if needed)
import app from "../src/index";

describe("API Health Check", () => {
  it("should return 404 for unknown route", async () => {
    const res = await request(app).get("/unknown");
    expect(res.statusCode).toBe(404);
  });
});
