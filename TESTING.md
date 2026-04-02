# Testing Guide for Resivana Backend

Complete guide for writing, running, and maintaining tests in the Resivana Backend project.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Running Tests](#running-tests)
- [Mocking](#mocking)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

```bash
# Install dependencies (already done)
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov
```

## 📁 Test Structure

Tests are organized in `src/__tests__/` following this structure:

```
src/__tests__/
├── setup.ts                    # Jest configuration and setup
├── unit/                       # Unit tests for individual functions
│   ├── user.test.ts
│   ├── property.test.ts
│   ├── booking.test.ts
│   └── ...
├── integration/                # Integration tests for API endpoints
│   ├── api.test.ts
│   ├── auth.test.ts
│   └── ...
├── fixtures/                   # Test data and mocks
│   ├── users.fixture.ts
│   ├── properties.fixture.ts
│   └── ...
└── mocks/                      # Mock implementations
    ├── prisma.mock.ts
    └── ...
```

## ✍️ Writing Tests

### Basic Test Structure

```typescript
describe("Feature Name", () => {
  it("should do something specific", () => {
    // Arrange - set up test data
    const input = "test";

    // Act - execute the function/code
    const result = someFunction(input);

    // Assert - check the result
    expect(result).toBe("expected output");
  });
});
```

### Unit Test Example

Test individual functions in isolation:

```typescript
// src/__tests__/unit/utils.test.ts
describe("Email Validation", () => {
  it("should validate correct email format", () => {
    const email = "user@example.com";
    const result = isValidEmail(email);
    expect(result).toBe(true);
  });

  it("should reject invalid email format", () => {
    const email = "not-an-email";
    const result = isValidEmail(email);
    expect(result).toBe(false);
  });
});
```

### Integration Test Example

Test API endpoints and interactions:

```typescript
// src/__tests__/integration/auth.test.ts
import request from "supertest";
import app from "../../server";

describe("Authentication API", () => {
  describe("POST /api/v1/auth/register", () => {
    it("should register a new user", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          password: "SecurePassword123",
        })
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.email).toBe("john@example.com");
    });

    it("should reject duplicate email", async () => {
      await request(app).post("/api/v1/auth/register").send({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        password: "SecurePassword123",
      });

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          firstName: "Jane",
          lastName: "Smith",
          email: "jane@example.com",
          password: "AnotherPassword123",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });
});
```

### Async Tests

Handle async operations:

```typescript
describe("Async Operations", () => {
  it("should fetch user data", async () => {
    const user = await fetchUser("123");
    expect(user).toHaveProperty("id");
  });

  it("should handle async errors", async () => {
    await expect(fetchUser("invalid-id")).rejects.toThrow();
  });
});
```

## ▶️ Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npm test -- user.test.ts
npm test -- --testPathPattern=unit
```

### Watch Mode

```bash
npm run test:watch
```

Auto-reruns tests when files change.

### Coverage Report

```bash
npm run test:cov
```

Generates HTML report in `coverage/` directory:

```bash
open coverage/index.html  # macOS
start coverage/index.html # Windows
xdg-open coverage/index.html # Linux
```

### Test with Debugging

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 🎭 Mocking

### Mock Prisma Client

```typescript
import { prismaMock } from "../mocks/prisma.mock";

describe("User Service", () => {
  it("should find user by email", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "1",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    });

    const user = await prismaMock.user.findUnique({
      where: { email: "test@example.com" },
    });

    expect(user?.email).toBe("test@example.com");
  });
});
```

### Mock External APIs

```typescript
import axios from "axios";
jest.mock("axios");

describe("External API", () => {
  it("should call external service", async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: { status: "ok" },
    });

    const response = await axios.get("/api/external");
    expect(response.data.status).toBe("ok");
  });
});
```

### Mock Environment Variables

```typescript
describe("Configuration", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  it("should use test JWT secret", () => {
    expect(process.env.JWT_SECRET).toBe("test-secret");
  });
});
```

## 📋 Best Practices

### 1. Test Naming

- Use descriptive, clear names
- Start with "should" for behavior tests
- Avoid redundant descriptions

```typescript
// ✅ Good
it("should return user by ID when user exists", () => {});

// ❌ Bad
it("test user", () => {});
```

### 2. Arrange-Act-Assert Pattern

```typescript
it("should create user with valid data", () => {
  // Arrange
  const userData = {
    firstName: "John",
    email: "john@example.com",
  };

  // Act
  const user = createUser(userData);

  // Assert
  expect(user.id).toBeDefined();
  expect(user.email).toBe("john@example.com");
});
```

### 3. One Assertion Per Test (When Possible)

```typescript
// ✅ Better - focused tests
it("should have id property", () => {
  expect(user).toHaveProperty("id");
});

it("should have email property", () => {
  expect(user).toHaveProperty("email");
});

// ⚠️ Less ideal - multiple assertions
it("should have required properties", () => {
  expect(user).toHaveProperty("id");
  expect(user).toHaveProperty("email");
  expect(user).toHaveProperty("name");
});
```

### 4. Setup and Teardown

```typescript
describe("User Service", () => {
  let testUser: User;

  beforeEach(() => {
    // Runs before each test
    testUser = createTestUser();
  });

  afterEach(() => {
    // Runs after each test
    cleanup();
  });

  beforeAll(() => {
    // Runs once before all tests
    initializeTestDatabase();
  });

  afterAll(() => {
    // Runs once after all tests
    closeTestDatabase();
  });

  it("should update user", () => {
    // testUser is available here
  });
});
```

### 5. Test Edge Cases

```typescript
describe("Input Validation", () => {
  it("should handle null input", () => {
    expect(() => validateEmail(null)).toThrow();
  });

  it("should handle undefined input", () => {
    expect(() => validateEmail(undefined)).toThrow();
  });

  it("should handle empty string", () => {
    expect(() => validateEmail("")).toThrow();
  });

  it("should handle special characters", () => {
    expect(validateEmail("test+alias@domain.com")).toBe(true);
  });
});
```

### 6. Use Test Fixtures

Create reusable test data:

```typescript
// src/__tests__/fixtures/users.ts
export const mockUsers = {
  user: {
    id: "1",
    firstName: "John",
    email: "john@example.com",
    role: "USER",
  },
  agent: {
    id: "2",
    firstName: "Jane",
    email: "jane@example.com",
    role: "AGENT",
  },
  admin: {
    id: "3",
    firstName: "Admin",
    email: "admin@example.com",
    role: "ADMIN",
  },
};

// In your test
import { mockUsers } from "../fixtures/users";

describe("User Service", () => {
  it("should process user role", () => {
    expect(mockUsers.agent.role).toBe("AGENT");
  });
});
```

## 🐛 Troubleshooting

### Tests Not Running

```bash
# Check Jest is installed
npm list jest

# Verify jest.config.ts is correct
cat jest.config.ts

# Run with verbose output
npm test -- --verbose
```

### Module Not Found Errors

```bash
# Clear cache
npm test -- --clearCache

# Rebuild TypeScript
npm run build
```

### Timeout Errors

```typescript
// Increase timeout for specific test
it("should do something slow", async () => {
  // test code
}, 10000); // 10 second timeout

// Or in describe block
describe("Slow Operations", () => {
  jest.setTimeout(10000);

  it("should handle slow operations", async () => {
    // test code
  });
});
```

### Mock Not Working

```typescript
// Make sure to mock BEFORE importing the module
jest.mock("axios");
import axios from "axios"; // Import AFTER mock

// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

### Database Connection in Tests

```typescript
// Mock the database in tests
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      // etc...
    },
  },
}));
```

## 📊 Coverage Targets

Current coverage thresholds in `jest.config.ts`:

```
- Statements: 50%
- Branches: 50%
- Functions: 50%
- Lines: 50%
```

Gradually increase these targets as test coverage improves:

```typescript
// jest.config.ts
coverageThreshold: {
  global: {
    branches: 70,    // Increase from 50
    functions: 75,   // Increase from 50
    lines: 80,       // Increase from 50
    statements: 75,  // Increase from 50
  },
}
```

## 📚 Common Assertions

```typescript
// Equality
expect(value).toBe(expected);
expect(object).toEqual(expected);

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(10);
expect(value).toBeGreaterThanOrEqual(10);
expect(value).toBeLessThan(10);
expect(value).toBeLessThanOrEqual(10);

// Strings
expect(str).toContain("substring");
expect(str).toMatch(/regex/);

// Arrays
expect(arr).toHaveLength(3);
expect(arr).toContain(item);
expect(arr).toEqual(expect.arrayContaining([item]));

// Exceptions
expect(() => fn()).toThrow();
expect(() => fn()).toThrow("Error message");

// Objects
expect(obj).toHaveProperty("prop");
expect(obj).toHaveProperty("prop", value);
expect(obj).toMatchObject({ prop: value });
```

---

**For more information**, visit:

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Library](https://testing-library.com/)
