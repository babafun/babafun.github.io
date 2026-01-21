/**
 * Property-based tests for album grouping functionality
 * 
 * These tests verify that the WASM album grouping functions correctly
 * preserve all songs and group them appropriately by album name.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import { initWasm, groupByAlbum } from '../wasm/bindings';
import { songArbitrary, uniqueSongsArbitrary, releaseTypeArbitrary } from '../../test/arbitraries';
import type { Song, Album } from '../types/music';

describe('Property 2: Album Grouping Preservation', () => {
  beforeAll(async () => {
    // Initialize WASM module before running tests
    await initWasm();
  });

  /**
   * **Validates: Requirements 3.1, 3.2**
   * 
   * For any list of songs, grouping them by album should preserve all songs 
   * without duplication or loss.
   */
  it('should preserve all songs when grouping by album', () => {
    fc.assert(
      fc.property(uniqueSongsArbitrary(0, 50), (songs: Song[]) => {
        // Convert songs to JSON for WASM function
        const songsJson = JSON.stringify(songs);
        
        // Call WASM function to group by album
        const albumsJson = groupByAlbum(songsJson);
        const albums: Album[] = JSON.parse(albumsJson);
        
        // Extract all songs from the grouped albums
        const allSongsInAlbums = albums.flatMap(album => album.songs);
        
        // Test 1: Same number of songs (no loss or duplication)
        const countPreserved = allSongsInAlbums.length === songs.length;
        
        // Test 2: All original songs are present (no loss)
        const allPresent = songs.every(originalSong => 
          allSongsInAlbums.some(albumSong => albumSong.id === originalSong.id)
        );
        
        // Test 3: No duplicate songs (no duplication)
        const songIds = allSongsInAlbums.map(song => song.id);
        const uniqueIds = new Set(songIds);
        const noDuplicates = songIds.length === uniqueIds.size;
        
        // Test 4: All songs in albums exist in original list (no addition)
        const noAdditions = allSongsInAlbums.every(albumSong =>
          songs.some(originalSong => originalSong.id === albumSong.id)
        );
        
        // All conditions must be true for the property to hold
        const result = countPreserved && allPresent && noDuplicates && noAdditions;
        
        // Provide detailed error information if the test fails
        if (!result) {
          console.error('Album grouping preservation failed:', {
            originalCount: songs.length,
            groupedCount: allSongsInAlbums.length,
            countPreserved,
            allPresent,
            noDuplicates,
            noAdditions,
            originalIds: songs.map(s => s.id).sort(),
            groupedIds: allSongsInAlbums.map(s => s.id).sort()
          });
        }
        
        return result;
      }),
      { numRuns: 1000 }
    );
  });

  it('should handle empty song arrays', () => {
    const emptySongs: Song[] = [];
    const songsJson = JSON.stringify(emptySongs);
    const albumsJson = groupByAlbum(songsJson);
    const albums: Album[] = JSON.parse(albumsJson);
    
    // Empty input should produce empty albums array
    expect(albums).toEqual([]);
  });

  it('should handle single song', () => {
    fc.assert(
      fc.property(songArbitrary, (song: Song) => {
        const songs = [song];
        const songsJson = JSON.stringify(songs);
        const albumsJson = groupByAlbum(songsJson);
        const albums: Album[] = JSON.parse(albumsJson);
        
        // Should create exactly one album with one song
        expect(albums).toHaveLength(1);
        expect(albums[0].name).toBe(song.albumName);
        expect(albums[0].songs).toHaveLength(1);
        expect(albums[0].songs[0].id).toBe(song.id);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve song data integrity during grouping', () => {
    fc.assert(
      fc.property(uniqueSongsArbitrary(1, 20), (songs: Song[]) => {
        const songsJson = JSON.stringify(songs);
        const albumsJson = groupByAlbum(songsJson);
        const albums: Album[] = JSON.parse(albumsJson);
        
        // Every song in the albums should be identical to the original
        const allSongsInAlbums = albums.flatMap(album => album.songs);
        
        return songs.every(originalSong => {
          const matchingSong = allSongsInAlbums.find(s => s.id === originalSong.id);
          
          if (!matchingSong) return false;
          
          // Check that all fields are preserved exactly
          return (
            matchingSong.id === originalSong.id &&
            matchingSong.title === originalSong.title &&
            matchingSong.albumName === originalSong.albumName &&
            matchingSong.releaseType === originalSong.releaseType &&
            matchingSong.hasContentId === originalSong.hasContentId &&
            matchingSong.streamingLink === originalSong.streamingLink &&
            matchingSong.license === originalSong.license
          );
        });
      }),
      { numRuns: 500 }
    );
  });

  it('should maintain referential equality for song objects', () => {
    fc.assert(
      fc.property(uniqueSongsArbitrary(1, 10), (songs: Song[]) => {
        const songsJson = JSON.stringify(songs);
        const albumsJson = groupByAlbum(songsJson);
        const albums: Album[] = JSON.parse(albumsJson);
        
        const allSongsInAlbums = albums.flatMap(album => album.songs);
        
        // Each song should appear exactly once in the grouped result
        return songs.every(originalSong => {
          const matchingSongs = allSongsInAlbums.filter(s => s.id === originalSong.id);
          return matchingSongs.length === 1;
        });
      }),
      { numRuns: 300 }
    );
  });

  it('should work with songs that have identical album names', () => {
    // Create multiple songs with the same album name
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }), // album name
        fc.array(songArbitrary, { minLength: 2, maxLength: 10 }), // songs
        (albumName: string, songs: Song[]) => {
          // Force all songs to have the same album name
          const sameAlbumSongs = songs.map((song, index) => ({
            ...song,
            id: `${song.id}-${index}`, // Ensure unique IDs
            albumName: albumName
          }));
          
          const songsJson = JSON.stringify(sameAlbumSongs);
          const albumsJson = groupByAlbum(songsJson);
          const albums: Album[] = JSON.parse(albumsJson);
          
          // Should create exactly one album containing all songs
          expect(albums).toHaveLength(1);
          expect(albums[0].name).toBe(albumName);
          expect(albums[0].songs).toHaveLength(sameAlbumSongs.length);
          
          // All songs should be preserved
          const allSongsInAlbums = albums.flatMap(album => album.songs);
          return allSongsInAlbums.length === sameAlbumSongs.length &&
                 sameAlbumSongs.every(originalSong =>
                   allSongsInAlbums.some(albumSong => albumSong.id === originalSong.id)
                 );
        }
      ),
      { numRuns: 200 }
    );
  });
});

describe('Property 3: Album Grouping Correctness', () => {
  beforeAll(async () => {
    // Initialize WASM module before running tests
    await initWasm();
  });

  /**
   * **Validates: Requirements 3.1, 3.2**
   * 
   * For any list of songs grouped into albums, all songs within an album 
   * should have the same album name.
   */
  it('should ensure all songs in an album share the same album name', () => {
    fc.assert(
      fc.property(uniqueSongsArbitrary(0, 50), (songs: Song[]) => {
        // Convert songs to JSON for WASM function
        const songsJson = JSON.stringify(songs);
        
        // Call WASM function to group by album
        const albumsJson = groupByAlbum(songsJson);
        const albums: Album[] = JSON.parse(albumsJson);
        
        // Test: Every song in each album should have the same album name as the album
        const allAlbumsCorrect = albums.every(album => 
          album.songs.every(song => song.albumName === album.name)
        );
        
        // Provide detailed error information if the test fails
        if (!allAlbumsCorrect) {
          const incorrectAlbums = albums.filter(album =>
            !album.songs.every(song => song.albumName === album.name)
          );
          
          console.error('Album grouping correctness failed:', {
            totalAlbums: albums.length,
            incorrectAlbums: incorrectAlbums.map(album => ({
              albumName: album.name,
              songAlbumNames: album.songs.map(song => song.albumName),
              mismatchedSongs: album.songs.filter(song => song.albumName !== album.name)
            }))
          });
        }
        
        return allAlbumsCorrect;
      }),
      { numRuns: 1000 }
    );
  });

  it('should handle songs with different album names correctly', () => {
    // Create a specific test case with songs from different albums
    const songs: Song[] = [
      {
        id: 'song1',
        title: 'Song One',
        albumName: 'Album A',
        releaseType: 'Independent',
        hasContentId: false,
        streamingLink: 'https://example.com/song1',
        license: ''
      },
      {
        id: 'song2',
        title: 'Song Two',
        albumName: 'Album A',
        releaseType: 'NCS',
        hasContentId: false,
        streamingLink: 'https://example.com/song2',
        license: 'CC BY 4.0'
      },
      {
        id: 'song3',
        title: 'Song Three',
        albumName: 'Album B',
        releaseType: 'Monstercat',
        hasContentId: true,
        streamingLink: 'https://example.com/song3',
        license: 'All Rights Reserved'
      }
    ];

    const songsJson = JSON.stringify(songs);
    const albumsJson = groupByAlbum(songsJson);
    const albums: Album[] = JSON.parse(albumsJson);

    // Should create two albums
    expect(albums).toHaveLength(2);

    // Find Album A and Album B
    const albumA = albums.find(album => album.name === 'Album A');
    const albumB = albums.find(album => album.name === 'Album B');

    expect(albumA).toBeDefined();
    expect(albumB).toBeDefined();

    // Album A should have 2 songs, both with albumName 'Album A'
    expect(albumA!.songs).toHaveLength(2);
    expect(albumA!.songs.every(song => song.albumName === 'Album A')).toBe(true);

    // Album B should have 1 song with albumName 'Album B'
    expect(albumB!.songs).toHaveLength(1);
    expect(albumB!.songs.every(song => song.albumName === 'Album B')).toBe(true);
  });

  it('should maintain album name consistency with special characters', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.uuid(),
          title: fc.string({ minLength: 1, maxLength: 50 }),
          albumName: fc.oneof(
            fc.constant('Album with "Quotes"'),
            fc.constant('Album with (Parentheses)'),
            fc.constant('Album with [Brackets]'),
            fc.constant('Album with & Symbols'),
            fc.constant('Album with émojis 🎵'),
            fc.constant('Album with\nNewlines'),
            fc.constant('Album with\tTabs')
          ),
          releaseType: releaseTypeArbitrary,
          hasContentId: fc.boolean(),
          streamingLink: fc.webUrl(),
          license: fc.string()
        }), { minLength: 1, maxLength: 20 }),
        (songs: Song[]) => {
          // Ensure unique IDs
          const uniqueSongs = songs.map((song, index) => ({
            ...song,
            id: `${song.id}-${index}`
          }));

          const songsJson = JSON.stringify(uniqueSongs);
          const albumsJson = groupByAlbum(songsJson);
          const albums: Album[] = JSON.parse(albumsJson);

          // Every song in each album should have the exact same album name
          return albums.every(album =>
            album.songs.every(song => song.albumName === album.name)
          );
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should handle empty album names correctly', () => {
    const songsWithEmptyAlbum: Song[] = [
      {
        id: 'song1',
        title: 'Song One',
        albumName: '',
        releaseType: 'Independent',
        hasContentId: false,
        streamingLink: 'https://example.com/song1',
        license: ''
      },
      {
        id: 'song2',
        title: 'Song Two',
        albumName: '',
        releaseType: 'NCS',
        hasContentId: false,
        streamingLink: 'https://example.com/song2',
        license: 'CC BY 4.0'
      }
    ];

    const songsJson = JSON.stringify(songsWithEmptyAlbum);
    const albumsJson = groupByAlbum(songsJson);
    const albums: Album[] = JSON.parse(albumsJson);

    // Should create one album with empty name
    expect(albums).toHaveLength(1);
    expect(albums[0].name).toBe('');
    expect(albums[0].songs).toHaveLength(2);
    
    // All songs should have empty album name
    expect(albums[0].songs.every(song => song.albumName === '')).toBe(true);
  });
});