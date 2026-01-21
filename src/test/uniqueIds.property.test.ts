/**
 * Property-based tests for unique song IDs validation
 * 
 * These tests verify that the WASM validation functions correctly
 * enforce unique song IDs across all songs in music data.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import { initWasm, validateMusicData } from '../wasm/bindings';
import { songArbitrary, uniqueSongsArbitrary, musicDataArbitrary } from '../../test/arbitraries';
import type { Song, MusicData } from '../types/music';

describe('Property 7: Unique Song IDs', () => {
  beforeAll(async () => {
    // Initialize WASM module before running tests
    await initWasm();
  });

  /**
   * **Validates: Requirement 2.7**
   * 
   * For any valid music data, all song IDs should be unique.
   * The validation function should reject music data with duplicate song IDs.
   */
  it('should reject music data with duplicate song IDs', () => {
    fc.assert(
      fc.property(
        uniqueSongsArbitrary(2, 20), // Start with unique songs
        fc.integer({ min: 0, max: 19 }), // Index to duplicate
        (songs: Song[], duplicateIndex: number) => {
          // Skip if we don't have enough songs
          if (songs.length < 2 || duplicateIndex >= songs.length) {
            return true;
          }

          // Create a duplicate by copying the ID from one song to another
          const songsWithDuplicate = [...songs];
          const targetIndex = (duplicateIndex + 1) % songs.length;
          songsWithDuplicate[targetIndex] = {
            ...songsWithDuplicate[targetIndex],
            id: songsWithDuplicate[duplicateIndex].id // Create duplicate ID
          };

          // Create music data with duplicate IDs
          const musicDataWithDuplicates: MusicData = {
            songs: songsWithDuplicate,
            albums: [] // Albums not needed for this test
          };

          const musicDataJson = JSON.stringify(musicDataWithDuplicates);
          const validationResult = validateMusicData(musicDataJson);

          // Should be invalid due to duplicate IDs
          const isInvalid = validationResult !== '';
          const containsDuplicateError = validationResult.toLowerCase().includes('duplicate');

          // Provide detailed error information if the test fails
          if (!isInvalid || !containsDuplicateError) {
            console.error('Unique ID validation failed:', {
              songsCount: songsWithDuplicate.length,
              duplicatedId: songsWithDuplicate[duplicateIndex].id,
              duplicateIndex,
              targetIndex,
              validationResult,
              isInvalid,
              containsDuplicateError
            });
          }

          return isInvalid && containsDuplicateError;
        }
      ),
      { numRuns: 1000 }
    );
  });

  /**
   * **Validates: Requirement 2.7**
   * 
   * For any music data with unique song IDs, the validation should pass.
   */
  it('should accept music data with all unique song IDs', () => {
    fc.assert(
      fc.property(uniqueSongsArbitrary(0, 50), (songs: Song[]) => {
        // Create music data with unique IDs (guaranteed by uniqueSongsArbitrary)
        const musicData: MusicData = {
          songs,
          albums: [] // Albums not needed for this test
        };

        const musicDataJson = JSON.stringify(musicData);
        const validationResult = validateMusicData(musicDataJson);

        // Should be valid since all IDs are unique
        const isValid = validationResult === '';

        // Provide detailed error information if the test fails
        if (!isValid) {
          const songIds = songs.map(song => song.id);
          const uniqueIds = new Set(songIds);
          console.error('Unique ID validation failed for valid data:', {
            songsCount: songs.length,
            uniqueIdsCount: uniqueIds.size,
            hasDuplicates: songIds.length !== uniqueIds.size,
            validationResult,
            songIds: songIds.slice(0, 10) // Show first 10 IDs for debugging
          });
        }

        return isValid;
      }),
      { numRuns: 1000 }
    );
  });

  /**
   * Test specific edge cases for unique ID validation
   */
  it('should handle empty song arrays correctly', () => {
    const emptyMusicData: MusicData = {
      songs: [],
      albums: []
    };

    const musicDataJson = JSON.stringify(emptyMusicData);
    const validationResult = validateMusicData(musicDataJson);

    // Empty song array should be valid (no duplicates possible)
    expect(validationResult).toBe('');
  });

  it('should handle single song correctly', () => {
    fc.assert(
      fc.property(songArbitrary, (song: Song) => {
        const musicData: MusicData = {
          songs: [song],
          albums: []
        };

        const musicDataJson = JSON.stringify(musicData);
        const validationResult = validateMusicData(musicDataJson);

        // Single song should always be valid (no duplicates possible)
        return validationResult === '';
      }),
      { numRuns: 100 }
    );
  });

  it('should detect duplicate IDs regardless of other song properties', () => {
    // Create two songs with same ID but different other properties
    const baseSong: Song = {
      id: 'duplicate-id',
      title: 'Song One',
      albumName: 'Album A',
      releaseType: 'Independent',
      hasContentId: false,
      streamingLink: 'https://example.com/song1',
      license: 'CC BY 4.0'
    };

    const duplicateSong: Song = {
      id: 'duplicate-id', // Same ID
      title: 'Song Two', // Different title
      albumName: 'Album B', // Different album
      releaseType: 'NCS', // Different release type
      hasContentId: true, // Different Content ID
      streamingLink: 'https://example.com/song2', // Different link
      license: '' // Different license
    };

    const musicData: MusicData = {
      songs: [baseSong, duplicateSong],
      albums: []
    };

    const musicDataJson = JSON.stringify(musicData);
    const validationResult = validateMusicData(musicDataJson);

    // Should be invalid due to duplicate IDs
    expect(validationResult).not.toBe('');
    expect(validationResult.toLowerCase()).toContain('duplicate');
    expect(validationResult).toContain('duplicate-id');
  });

  it('should detect multiple duplicate ID pairs', () => {
    const songs: Song[] = [
      {
        id: 'id-1',
        title: 'Song 1A',
        albumName: 'Album A',
        releaseType: 'Independent',
        hasContentId: false,
        streamingLink: 'https://example.com/1a',
        license: ''
      },
      {
        id: 'id-1', // Duplicate of first song
        title: 'Song 1B',
        albumName: 'Album A',
        releaseType: 'NCS',
        hasContentId: false,
        streamingLink: 'https://example.com/1b',
        license: 'CC BY 4.0'
      },
      {
        id: 'id-2',
        title: 'Song 2A',
        albumName: 'Album B',
        releaseType: 'Monstercat',
        hasContentId: true,
        streamingLink: 'https://example.com/2a',
        license: 'All Rights Reserved'
      },
      {
        id: 'id-2', // Duplicate of third song
        title: 'Song 2B',
        albumName: 'Album B',
        releaseType: 'Independent',
        hasContentId: false,
        streamingLink: 'https://example.com/2b',
        license: ''
      }
    ];

    const musicData: MusicData = {
      songs,
      albums: []
    };

    const musicDataJson = JSON.stringify(musicData);
    const validationResult = validateMusicData(musicDataJson);

    // Should be invalid due to duplicate IDs
    expect(validationResult).not.toBe('');
    expect(validationResult.toLowerCase()).toContain('duplicate');
    // Should detect the first duplicate encountered
    expect(validationResult).toMatch(/id-[12]/);
  });

  it('should handle IDs with special characters correctly', () => {
    const specialIds = [
      'song-with-dashes',
      'song_with_underscores',
      'song.with.dots',
      'song with spaces',
      'song-with-émojis-🎵',
      'song-with-"quotes"',
      'song-with-(parentheses)',
      'song-with-[brackets]',
      'song-with-{braces}',
      'song-with-/slashes/',
      'song-with-\\backslashes\\',
      'song-with-numbers-123',
      'SONG-WITH-CAPS',
      'MiXeD-cAsE-SoNg'
    ];

    fc.assert(
      fc.property(
        fc.shuffledSubarray(specialIds, { minLength: 2, maxLength: specialIds.length }),
        (selectedIds: string[]) => {
          // Create songs with unique special IDs
          const songs: Song[] = selectedIds.map((id, index) => ({
            id,
            title: `Song ${index}`,
            albumName: `Album ${index}`,
            releaseType: 'Independent',
            hasContentId: false,
            streamingLink: `https://example.com/${index}`,
            license: ''
          }));

          const musicData: MusicData = {
            songs,
            albums: []
          };

          const musicDataJson = JSON.stringify(musicData);
          const validationResult = validateMusicData(musicDataJson);

          // Should be valid since all IDs are unique
          return validationResult === '';
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should be case-sensitive for song IDs', () => {
    const songs: Song[] = [
      {
        id: 'song-id',
        title: 'Song 1',
        albumName: 'Album A',
        releaseType: 'Independent',
        hasContentId: false,
        streamingLink: 'https://example.com/1',
        license: ''
      },
      {
        id: 'SONG-ID', // Different case
        title: 'Song 2',
        albumName: 'Album A',
        releaseType: 'NCS',
        hasContentId: false,
        streamingLink: 'https://example.com/2',
        license: 'CC BY 4.0'
      },
      {
        id: 'Song-Id', // Mixed case
        title: 'Song 3',
        albumName: 'Album A',
        releaseType: 'Monstercat',
        hasContentId: true,
        streamingLink: 'https://example.com/3',
        license: 'All Rights Reserved'
      }
    ];

    const musicData: MusicData = {
      songs,
      albums: []
    };

    const musicDataJson = JSON.stringify(musicData);
    const validationResult = validateMusicData(musicDataJson);

    // Should be valid since IDs are case-sensitive and therefore unique
    expect(validationResult).toBe('');
  });

  /**
   * Property test that verifies the uniqueness check works with generated music data
   */
  it('should maintain ID uniqueness invariant for generated music data', () => {
    fc.assert(
      fc.property(musicDataArbitrary, (musicData: MusicData) => {
        const musicDataJson = JSON.stringify(musicData);
        const validationResult = validateMusicData(musicDataJson);

        // Check if the music data actually has unique IDs
        const songIds = musicData.songs.map(song => song.id);
        const uniqueIds = new Set(songIds);
        const hasUniqueIds = songIds.length === uniqueIds.size;

        // The validation result should match the actual uniqueness
        const isValid = validationResult === '';

        // If IDs are unique, validation should pass
        // If IDs are not unique, validation should fail
        const result = hasUniqueIds === isValid;

        // Provide detailed error information if the test fails
        if (!result) {
          console.error('ID uniqueness invariant failed:', {
            songsCount: musicData.songs.length,
            uniqueIdsCount: uniqueIds.size,
            hasUniqueIds,
            isValid,
            validationResult,
            duplicateIds: songIds.filter((id, index) => songIds.indexOf(id) !== index)
          });
        }

        return result;
      }),
      { numRuns: 1000 }
    );
  });
});