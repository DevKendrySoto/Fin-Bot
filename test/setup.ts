import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Increase timeout for tests
jest.setTimeout(30000);

// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Clear timers after each test
afterEach(() => {
  jest.clearAllTimers();
});
