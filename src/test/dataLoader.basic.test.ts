/**
 * Basic tests for DataLoader that don't require WASM initialization.
 * Tests TypeScript structure and error handling with the album-first data model.
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
    expect(dataLoader.isWasmReady()).toBe(false);
  });

  it('should handle fetch errors gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const dataLoader = DataLoader.getInstance();
    await expect(dataLoader.loadMusicData('/test/path.json'))
      .rejects.toThrow(DataLoaderError);
  });

  it('should handle HTTP errors gracefully', async () => {
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

  it('should reject old songs-object format', async () => {
    // Old format: { songs: [...] } — should be rejected
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: () => Promise.resolve('{"songs": []}')
    });

    const dataLoader = DataLoader.getInstance();
    await expect(dataLoader.loadMusicData('/test/path.json'))
      .rejects.toThrow(DataLoaderError);
  });

  it('should accept valid album array', async () => {
    const validAlbums = [
      {
        id: 'test-album',
        title: 'Test Album',
        releaseYear: 2024,
        streamLink: 'https://example.com',
        hasContentId: false,
        albumArtwork: 'https://example.com/art.jpg',
        tracks: [
          { id: 'track-1', title: 'Track One', license: 'CC BY 4.0' }
        ]
      }
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: () => Promise.resolve(JSON.stringify(validAlbums))
    });

    const dataLoader = DataLoader.getInstance();
    const result = await dataLoader.loadMusicData('/test/path.json');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('test-album');
  });
});
