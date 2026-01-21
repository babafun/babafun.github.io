import { expect, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { initWasmSync } from '../utils/filters';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Initialize WASM before running tests
beforeAll(() => {
  try {
    initWasmSync();
  } catch (error) {
    console.warn('WASM initialization failed in test setup, tests will use JavaScript fallbacks:', error);
  }
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});
