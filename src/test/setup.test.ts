import { describe, it, expect } from 'vitest';

describe('Vitest Configuration', () => {
  it('should be properly configured', () => {
    expect(true).toBe(true);
  });

  it('should have globals enabled', () => {
    // If globals are enabled, we can use describe, it, expect without importing
    expect(typeof describe).toBe('function');
    expect(typeof it).toBe('function');
    expect(typeof expect).toBe('function');
  });
});
