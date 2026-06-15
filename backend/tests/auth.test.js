import mongoose from "mongoose";
import request from "supertest";
import app from "../src/index.js";

// Use a test user
const testUser = {
  username: "testuser",
  email: "testuser@example.com",
  password: "testpass123",
};

describe("Auth API", () => {
  afterAll(async () => {
    // Clean up test user and close DB connection
    await mongoose.connection.db
      .collection("users")
      .deleteMany({ email: testUser.email });
    await mongoose.connection.close();
  });

  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(testUser.email);
  });

  it("should not register duplicate user", async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.statusCode).toBe(400);
  });

  it("should login with correct credentials", async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(testUser.email);
  });

  it("should not login with wrong password", async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: "wrongpass" });
    expect(res.statusCode).toBe(401);
  });
});
