/**
 * Property-based tests for unique IDs validation
 *
 * **Property 7: Unique IDs**
 * **Validates: Requirement 2.7**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { albumArbitrary } from '../../test/arbitraries';
import type { Album, MusicData } from '../types/music';

/**
 * JavaScript fallback for music data validation (album-first model)
 */
function validateMusicDataJS(albums: Album[]): string {
  if (!Array.isArray(albums)) return 'Music data must be a top-level array of albums';

  const albumIds = albums.map(a => a.id);
  if (albumIds.length !== new Set(albumIds).size) return 'Duplicate album IDs found';

  const trackIds = albums.flatMap(a => a.tracks.map(t => t.id));
  if (trackIds.length !== new Set(trackIds).size) return 'Duplicate track IDs found';

  return '';
}

describe('Property 7: Unique IDs', () => {
  /**
   * **Validates: Requirement 2.7**
   *
   * For any valid music data, all album IDs and all track IDs should be unique.
   */
  it('should reject music data with duplicate album IDs', () => {
    fc.assert(
      fc.property(
        fc.array(albumArbitrary, { minLength: 2, maxLength: 10 }),
        fc.integer({ min: 0, max: 9 }),
        (albums: Album[], duplicateIndex: number) => {
          if (albums.length < 2 || duplicateIndex >= albums.length) return true;

          const albumsWithDuplicate = [...albums];
          const targetIndex = (duplicateIndex + 1) % albums.length;
          albumsWithDuplicate[targetIndex] = {
            ...albumsWithDuplicate[targetIndex],
            id: albumsWithDuplicate[duplicateIndex].id
          };

          const validationResult = validateMusicDataJS(albumsWithDuplicate);
          return validationResult !== '' && validationResult.toLowerCase().includes('duplicate');
        }
      ),
      { numRuns: 500 }
    );
  });

  it('should reject music data with duplicate track IDs', () => {
    const album1: Album = {
      id: 'album-1',
      title: 'Album 1',
      releaseYear: 2024,
      streamLink: 'https://example.com/1',
      hasContentId: false,
      albumArtwork: 'https://example.com/art.jpg',
      tracks: [
        { id: 'shared-track-id', title: 'Track A', license: 'CC BY 4.0' }
      ]
    };
    const album2: Album = {
      id: 'album-2',
      title: 'Album 2',
      releaseYear: 2023,
      streamLink: 'https://example.com/2',
      hasContentId: false,
      albumArtwork: 'https://example.com/art.jpg',
      tracks: [
        { id: 'shared-track-id', title: 'Track B', license: '' } // duplicate track ID
      ]
    };

    const result = validateMusicDataJS([album1, album2]);
    expect(result).not.toBe('');
    expect(result.toLowerCase()).toContain('duplicate');
  });

  it('should accept music data with all unique IDs', () => {
    fc.assert(
      fc.property(
        fc.array(albumArbitrary, { minLength: 0, maxLength: 10 }),
        (albums: Album[]) => {
          // Ensure unique album IDs
          const uniqueAlbums = albums.map((album, i) => ({
            ...album,
            id: `album-${i}`,
            tracks: album.tracks.map((track, j) => ({
              ...track,
              id: `album-${i}-track-${j}`
            }))
          }));

          const result = validateMusicDataJS(uniqueAlbums);
          return result === '';
        }
      ),
      { numRuns: 500 }
    );
  });

  it('should handle empty album arrays correctly', () => {
    const result = validateMusicDataJS([]);
    expect(result).toBe('');
  });

  it('should handle single album correctly', () => {
    fc.assert(
      fc.property(albumArbitrary, (album: Album) => {
        // Ensure unique track IDs within the album
        const uniqueAlbum = {
          ...album,
          tracks: album.tracks.map((track, i) => ({ ...track, id: `track-${i}` }))
        };
        const result = validateMusicDataJS([uniqueAlbum]);
        return result === '';
      }),
      { numRuns: 100 }
    );
  });

  it('should be case-sensitive for IDs', () => {
    const albums: Album[] = [
      {
        id: 'album-id',
        title: 'Album 1',
        releaseYear: 2024,
        streamLink: 'https://example.com/1',
        hasContentId: false,
        albumArtwork: 'https://example.com/art.jpg',
        tracks: [{ id: 'track-id', title: 'Track 1', license: '' }]
      },
      {
        id: 'ALBUM-ID', // Different case — should be treated as unique
        title: 'Album 2',
        releaseYear: 2023,
        streamLink: 'https://example.com/2',
        hasContentId: false,
        albumArtwork: 'https://example.com/art.jpg',
        tracks: [{ id: 'TRACK-ID', title: 'Track 2', license: '' }]
      }
    ];

    const result = validateMusicDataJS(albums);
    expect(result).toBe('');
  });
});
