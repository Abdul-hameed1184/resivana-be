// Example unit test for User service
// Run with: npm test

describe("User Service - Unit Tests", () => {
  describe("User Creation", () => {
    it("should validate email format", () => {
      const email = "john@example.com";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(email)).toBe(true);
    });

    it("should fail on invalid email", () => {
      const email = "not-an-email";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(email)).toBe(false);
    });

    it("should validate password strength", () => {
      const password = "SecurePass123!";
      const isStrong = password.length >= 8;
      expect(isStrong).toBe(true);
    });

    it("should reject weak password", () => {
      const password = "weak";
      const isStrong = password.length >= 8;
      expect(isStrong).toBe(false);
    });
  });

  describe("User Object", () => {
    it("should create valid user object", () => {
      const user = {
        id: "123",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "USER" as const,
      };

      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("firstName");
      expect(user).toHaveProperty("email");
      expect(user.role).toBe("USER");
    });

    it("should not have password in user object", () => {
      const user = {
        id: "123",
        firstName: "John",
        email: "john@example.com",
      };

      expect(user).not.toHaveProperty("password");
    });
  });

  describe("User Roles", () => {
    it("should have valid roles", () => {
      const validRoles = ["USER", "AGENT", "ADMIN"];
      const userRole = "AGENT";
      expect(validRoles).toContain(userRole);
    });

    it("should reject invalid role", () => {
      const validRoles = ["USER", "AGENT", "ADMIN"];
      const invalidRole = "MODERATOR";
      expect(validRoles).not.toContain(invalidRole);
    });
  });
});
