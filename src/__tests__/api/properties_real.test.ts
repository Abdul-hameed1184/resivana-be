import request = require("supertest");
import app from "../../server";
import { prisma } from "../../lib/prisma";

describe("Property API Integration Tests", () => {
  let testAgentId: string;

  beforeAll(async () => {
    // Clean up or ensure a user/agent exists
    const user = await prisma.user.findFirst({
      where: { role: "AGENT" },
    });

    if (user) {
      testAgentId = user.id;
    } else {
      // Create a dummy agent if none exists
      const newUser = await prisma.user.create({
        data: {
          firstName: "Test",
          lastName: "Agent",
          email: `testagent_${Date.now()}@example.com`,
          password: "password123",
          role: "AGENT",
          agent: {
            create: {
              fullName: "Test Agent",
              email: `testagent_agent_${Date.now()}@example.com`,
              phone: "1234567890",
              bankCode: "001",
              accountNumber: "1234567890",
              accountName: "Test Agent",
            },
          },
        },
      });
      testAgentId = newUser.id;
    }
  });

  describe("GET /api/v1/properties", () => {
    it("should return a list of properties", async () => {
      const res = await request(app).get("/api/v1/properties");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("POST /api/v1/properties", () => {
    it("should create a new property", async () => {
      const propertyData = {
        title: "Test Property",
        description: "A beautiful test property",
        price: 150000,
        type: "HOUSE",
        status: "AVAILABLE",
        agentId: testAgentId,
        bedrooms: 3,
        bathrooms: 2,
        images: ["image1.jpg"],
        tags: ["test", "integration"],
        amenities: ["wifi", "parking"],
        location: {
          address: "123 Test St",
          city: "Test City",
          state: "TS",
          country: "Test Land",
          latitude: 40.7128,
          longitude: -74.006,
        },
      };

      const res = await request(app)
        .post("/api/v1/properties")
        .send(propertyData);

      expect(res.status).toBe(201);
      expect(res.body.title).toBe("Test Property");
      expect(res.body.location.address).toBe("123 Test St");
    });
  });

  describe("Error Handling", () => {
    it("should return 404 for non-existent property", async () => {
      const res = await request(app).get("/api/v1/properties/non-existent-id");
      expect(res.status).toBe(404);
    });

    it("should return 400 for missing required fields", async () => {
      const res = await request(app)
        .post("/api/v1/properties")
        .send({ title: "Incomplete" });
      expect(res.status).toBe(400);
    });
  });
});
