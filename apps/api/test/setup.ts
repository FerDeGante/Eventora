import { beforeAll, afterAll, afterEach } from 'vitest';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/bloom_test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.STRIPE_SECRET_KEY = 'sk_test';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
process.env.MERCADOPAGO_ACCESS_TOKEN = 'mp_test';
process.env.RESEND_API_KEY = 're_test';
process.env.APP_BASE_URL = 'http://localhost:3000';
process.env.APP_URL = 'http://localhost:3000';

beforeAll(async () => {
  // Setup code before all tests
});

afterAll(async () => {
  // Cleanup code after all tests
});

afterEach(() => {
  // Reset mocks after each test
});
