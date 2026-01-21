/**
 * Test file for DataLoader functionality
 * This tests the integration between TypeScript and WASM
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { DataLoader, loadMusicData, DataLoaderError } from '../utils/dataLoader';
import { MusicData } from '../types/music';

// Mock fetch for testing
const mockMusicData = {
  songs: [
    {
      id: "song-001",
      title: "Digital Dreams",
      albumName: "Synthwave Chronicles",
      releaseType: "Independent" as const,
      hasContentId: false,
      streamingLink: "https://push.fm/digital-dreams",
      license: "CC BY 4.0"
    },
    {
      id: "song-002",
      title: "Neon Nights",
      albumName: "Synthwave Chronicles",
      releaseType: "Independent" as const,
      hasContentId: true,
      streamingLink: "https://push.fm/neon-nights",
      license: "All Rights Reserved"
    },
    {
      id: "song-003",
      title: "Electric Pulse",
      albumName: "Electronic Fusion",
      releaseType: "NCS" as const,
      hasContentId: false,
      streamingLink: "https://ncs.io/electric-pulse",
      license: ""
    }
  ]
};

// Mock fetch globally
global.fetch = vi.fn();

describe('DataLoader', () => {
  let dataLoader: DataLoader;

  beforeAll(() => {
    dataLoader = DataLoader.getInstance();
    
    // Setup fetch mock
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

  it('should load and validate music data', async () => {
    const musicData: MusicData = await dataLoader.loadMusicData();
    
    // Check structure
    expect(musicData).toHaveProperty('songs');
    expect(musicData).toHaveProperty('albums');
    expect(Array.isArray(musicData.songs)).toBe(true);
    expect(Array.isArray(musicData.albums)).toBe(true);
    
    // Check that we have data
    expect(musicData.songs.length).toBeGreaterThan(0);
    expect(musicData.albums.length).toBeGreaterThan(0);
    
    // Check song structure
    const firstSong = musicData.songs[0];
    expect(firstSong).toHaveProperty('id');
    expect(firstSong).toHaveProperty('title');
    expect(firstSong).toHaveProperty('albumName');
    expect(firstSong).toHaveProperty('releaseType');
    expect(firstSong).toHaveProperty('hasContentId');
    expect(firstSong).toHaveProperty('streamingLink');
    expect(firstSong).toHaveProperty('license');
    
    // Check album structure
    const firstAlbum = musicData.albums[0];
    expect(firstAlbum).toHaveProperty('name');
    expect(firstAlbum).toHaveProperty('songs');
    expect(Array.isArray(firstAlbum.songs)).toBe(true);
  });

  it('should group songs by album correctly', async () => {
    const musicData: MusicData = await dataLoader.loadMusicData();
    
    // Check that all songs in an album have the same album name
    for (const album of musicData.albums) {
      for (const song of album.songs) {
        expect(song.albumName).toBe(album.name);
      }
    }
    
    // Check that all songs are preserved
    const totalSongsInAlbums = musicData.albums.reduce((sum, album) => sum + album.songs.length, 0);
    expect(totalSongsInAlbums).toBe(musicData.songs.length);
  });

  it('should handle invalid JSON path gracefully', async () => {
    // Mock fetch to return 404
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

  it('should validate raw JSON data', async () => {
    const validJson = JSON.stringify({
      songs: [
        {
          id: "test-001",
          title: "Test Song",
          albumName: "Test Album",
          releaseType: "Independent",
          hasContentId: false,
          streamingLink: "https://example.com/test",
          license: "CC BY 4.0"
        }
      ]
    });
    
    const result = await dataLoader.validateRawData(validJson);
    expect(result).toBe(true);
  });

  it('should reject invalid JSON data', async () => {
    const invalidJson = JSON.stringify({
      songs: [
        {
          id: "test-001",
          title: "Test Song",
          // Missing required fields
        }
      ]
    });
    
    await expect(dataLoader.validateRawData(invalidJson))
      .rejects.toThrow(DataLoaderError);
  });

  it('should group songs by album using WASM', async () => {
    const testSongs = [
      {
        id: "song-1",
        title: "Song 1",
        albumName: "Album A",
        releaseType: "Independent" as const,
        hasContentId: false,
        streamingLink: "https://example.com/1",
        license: "CC BY 4.0"
      },
      {
        id: "song-2",
        title: "Song 2",
        albumName: "Album A",
        releaseType: "NCS" as const,
        hasContentId: false,
        streamingLink: "https://example.com/2",
        license: ""
      },
      {
        id: "song-3",
        title: "Song 3",
        albumName: "Album B",
        releaseType: "Monstercat" as const,
        hasContentId: true,
        streamingLink: "https://example.com/3",
        license: "All Rights Reserved"
      }
    ];
    
    const albums = await dataLoader.groupSongsByAlbum(testSongs);
    
    expect(albums).toHaveLength(2);
    
    const albumA = albums.find(a => a.name === "Album A");
    const albumB = albums.find(a => a.name === "Album B");
    
    expect(albumA).toBeDefined();
    expect(albumB).toBeDefined();
    expect(albumA!.songs).toHaveLength(2);
    expect(albumB!.songs).toHaveLength(1);
  });
});

describe('Convenience functions', () => {
  it('should load music data using convenience function', async () => {
    const musicData = await loadMusicData();
    expect(musicData).toHaveProperty('songs');
    expect(musicData).toHaveProperty('albums');
  });
});