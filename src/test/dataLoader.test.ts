/**
 * Test file for DataLoader functionality
 * Tests the integration between TypeScript and WASM with the album-first data model.
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { DataLoader, loadMusicData, DataLoaderError } from '../utils/dataLoader';
import type { MusicData } from '../types/music';

// Mock music data — album-first top-level array
const mockMusicData = [
  {
    id: 'neon-drift',
    title: 'Neon Drift',
    releaseYear: 2024,
    streamLink: 'https://push.fm/fl/babafun-neon-drift',
    hasContentId: false,
    albumArtwork: 'https://images.unsplash.com/photo-1',
    tracks: [
      { id: 'neon-drift-title-track', title: 'Neon Drift', license: 'CC BY 4.0' },
      { id: 'pixel-highway', title: 'Pixel Highway', license: 'CC BY 4.0',
        overrideStreamLink: 'https://push.fm/fl/babafun-pixel-highway' }
    ]
  },
  {
    id: 'dungeon-frequencies',
    title: 'Dungeon Frequencies',
    releaseYear: 2023,
    streamLink: 'https://push.fm/fl/babafun-dungeon-frequencies',
    hasContentId: true,
    releaseLabel: '8-Bit Collective',
    albumArtwork: 'https://images.unsplash.com/photo-2',
    tracks: [
      { id: 'dungeon-entrance', title: 'Dungeon Entrance', license: 'BGML-P' },
      { id: 'boss-encounter', title: 'Boss Encounter', license: 'BGML-P',
        overrideStreamLink: 'https://push.fm/fl/babafun-boss-encounter' }
    ]
  }
];

// Mock fetch globally
global.fetch = vi.fn();

describe('DataLoader', () => {
  let dataLoader: DataLoader;

  beforeAll(() => {
    dataLoader = DataLoader.getInstance();

    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('music.json')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          text: () => Promise.resolve(JSON.stringify(mockMusicData))
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  it('should be a singleton', () => {
    const instance1 = DataLoader.getInstance();
    const instance2 = DataLoader.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should load and validate music data as Album[]', async () => {
    const musicData: MusicData = await dataLoader.loadMusicData();

    // New model: MusicData is Album[]
    expect(Array.isArray(musicData)).toBe(true);
    expect(musicData.length).toBeGreaterThan(0);

    // Check album structure
    const firstAlbum = musicData[0];
    expect(firstAlbum).toHaveProperty('id');
    expect(firstAlbum).toHaveProperty('title');
    expect(firstAlbum).toHaveProperty('releaseYear');
    expect(firstAlbum).toHaveProperty('streamLink');
    expect(firstAlbum).toHaveProperty('hasContentId');
    expect(firstAlbum).toHaveProperty('albumArtwork');
    expect(firstAlbum).toHaveProperty('tracks');
    expect(Array.isArray(firstAlbum.tracks)).toBe(true);

    // Check track structure
    const firstTrack = firstAlbum.tracks[0];
    expect(firstTrack).toHaveProperty('id');
    expect(firstTrack).toHaveProperty('title');
    expect(firstTrack).toHaveProperty('license');
  });

  it('should handle invalid JSON path gracefully', async () => {
    (global.fetch as any).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })
    );

    await expect(dataLoader.loadMusicData('/nonexistent/path.json'))
      .rejects.toThrow(DataLoaderError);
  });

  it('should validate raw JSON data (valid album array)', async () => {
    const validJson = JSON.stringify(mockMusicData);
    const result = await dataLoader.validateRawData(validJson);
    expect(result).toBe(true);
  });

  it('should reject invalid JSON data (old songs-object format)', async () => {
    const invalidJson = JSON.stringify({
      songs: [{ id: 'test', title: 'Test' }]
    });

    await expect(dataLoader.validateRawData(invalidJson))
      .rejects.toThrow(DataLoaderError);
  });

  it('should reject album missing required fields', async () => {
    const invalidJson = JSON.stringify([
      { id: 'bad-album', title: 'Bad Album' /* missing required fields */ }
    ]);

    await expect(dataLoader.validateRawData(invalidJson))
      .rejects.toThrow(DataLoaderError);
  });
});

describe('Convenience functions', () => {
  it('should load music data using convenience function', async () => {
    const musicData = await loadMusicData();
    expect(Array.isArray(musicData)).toBe(true);
    expect(musicData.length).toBeGreaterThan(0);
  });
});
