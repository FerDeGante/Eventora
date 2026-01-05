import { beforeAll, afterAll, afterEach } from 'vitest';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/bloom_test';
process.env.REDIS_URL = 'redis://localhost:6379';

beforeAll(async () => {
  // Setup code before all tests
});

afterAll(async () => {
  // Cleanup code after all tests
});

afterEach(() => {
  // Reset mocks after each test
});
