// Global test setup file
// This file runs before each test suite

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console.log in tests to reduce noise
global.console = {
  ...console,
  // Keep console.error and console.warn for debugging
  log: jest.fn(),
};

// Global test timeout
jest.setTimeout(10000);