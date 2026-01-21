/**
 * Basic tests for DataLoader that don't require WASM initialization
 * These tests focus on the TypeScript structure and error handling
 */

import { describe, it, expect, vi } from 'vitest';
import { DataLoader, DataLoaderError } from '../utils/dataLoader';

describe('DataLoader Basic Tests', () => {
  it('should be a singleton', () => {
    const instance1 = DataLoader.getInstance();
    const instance2 = DataLoader.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should create DataLoaderError correctly', () => {
    const error = new DataLoaderError('Test error');
    expect(error.name).toBe('DataLoaderError');
    expect(error.message).toBe('Test error');
    expect(error instanceof Error).toBe(true);
    expect(error instanceof DataLoaderError).toBe(true);
  });

  it('should create DataLoaderError with cause', () => {
    const cause = new Error('Original error');
    const error = new DataLoaderError('Test error', cause);
    expect(error.cause).toBe(cause);
  });

  it('should track WASM initialization state', () => {
    const dataLoader = DataLoader.getInstance();
    // Initially should not be ready
    expect(dataLoader.isWasmReady()).toBe(false);
  });

  it('should handle fetch errors gracefully', async () => {
    // Mock fetch to simulate network error
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    
    const dataLoader = DataLoader.getInstance();
    await expect(dataLoader.loadMusicData('/test/path.json'))
      .rejects.toThrow(DataLoaderError);
  });

  it('should handle HTTP errors gracefully', async () => {
    // Mock fetch to return 404
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });
    
    const dataLoader = DataLoader.getInstance();
    await expect(dataLoader.loadMusicData('/test/path.json'))
      .rejects.toThrow(DataLoaderError);
  });

  it('should handle invalid JSON gracefully', async () => {
    // Mock fetch to return invalid JSON
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: () => Promise.resolve('invalid json')
    });
    
    const dataLoader = DataLoader.getInstance();
    await expect(dataLoader.loadMusicData('/test/path.json'))
      .rejects.toThrow(DataLoaderError);
  });

  it('should handle missing songs array gracefully', async () => {
    // Mock fetch to return JSON without songs array
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: () => Promise.resolve('{"albums": []}')
    });
    
    const dataLoader = DataLoader.getInstance();
    await expect(dataLoader.loadMusicData('/test/path.json'))
      .rejects.toThrow(DataLoaderError);
  });
});