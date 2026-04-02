// Test setup file - runs before all tests
import dotenv from "dotenv";

// Load environment variables from .env.test
dotenv.config({ path: ".env.test" });

// Set test environment
process.env.NODE_ENV = "test";

// Suppress console output during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };
