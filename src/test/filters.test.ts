/**
 * Property-Based Tests for Filter Logic
 *
 * **Property 4: Creator-Friendly Filter Correctness**
 * **Property 6: View Filtering Subset**
 *
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  filterCreatorFriendly,
  isCommercialCCLicense,
  isBGMLPLicense,
  batchCheckCreatorFriendly,
  isCreatorFriendlySong
} from '../utils/filters';
import { uniqueSongsArbitrary } from '../../test/arbitraries';
import type { SongView } from '../types/music';

// Local SongView arbitrary for this test file
const songViewArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  license: fc.oneof(
    fc.constant(''),
    fc.constant('CC BY 4.0'),
    fc.constant('CC BY-SA 4.0'),
    fc.constant('CC0 1.0'),
    fc.constant('BGML-P'),
    fc.constant('All Rights Reserved'),
    fc.string({ minLength: 0, maxLength: 50 })
  ),
  streamLink: fc.webUrl(),
  albumId: fc.string({ minLength: 1, maxLength: 20 }),
  albumTitle: fc.string({ minLength: 1, maxLength: 100 }),
  releaseYear: fc.integer({ min: 2020, max: 2024 }),
  hasContentId: fc.boolean(),
  albumArtwork: fc.webUrl()
});

describe('Filter Logic Property Tests', () => {
  describe('License Recognition', () => {
    it('should correctly identify commercial CC licenses', () => {
      const commercialCCLicenses = [
        'CC BY 4.0', 'CC BY 3.0', 'CC BY', 'cc by 4.0',
        'CC BY-SA 4.0', 'CC BY-SA 3.0', 'CC BY-SA', 'cc by-sa 4.0',
        'CC0 1.0', 'CC0', 'cc0'
      ];

      commercialCCLicenses.forEach(license => {
        expect(isCommercialCCLicense(license),
          `License "${license}" should be recognized as commercial CC`
        ).toBe(true);
      });
    });

    it('should reject non-commercial or restrictive licenses', () => {
      const nonCommercialLicenses = [
        'CC BY-NC 4.0', 'CC BY-NC-SA 4.0', 'All Rights Reserved',
        'Copyright', '', 'Custom License', 'CC BY-ND 4.0'
      ];

      nonCommercialLicenses.forEach(license => {
        expect(isCommercialCCLicense(license),
          `License "${license}" should NOT be recognized as commercial CC`
        ).toBe(false);
      });
    });

    it('should correctly identify BGML-P licenses', () => {
      expect(isBGMLPLicense('BGML-P')).toBe(true);
      expect(isBGMLPLicense('bgml-p')).toBe(true);
      expect(isBGMLPLicense(' BGML-P ')).toBe(true);

      expect(isBGMLPLicense('BGML')).toBe(false);
      expect(isBGMLPLicense('BGML-R')).toBe(false);
      expect(isBGMLPLicense('')).toBe(false);
    });
  });

  describe('Creator-Friendly Song Detection', () => {
    /**
     * **Property 4: Creator-Friendly Filter Correctness**
     * **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
     *
     * For any SongView, it should be creator-friendly iff it has a commercial CC
     * license or a BGML-P license.
     */
    it('Property 4: Creator-friendly filter includes correct songs', () => {
      fc.assert(fc.property(
        songViewArbitrary,
        (song) => {
          const isIncluded = isCreatorFriendlySong(song);
          const hasCommercialCC = isCommercialCCLicense(song.license);
          const isBGMLP = isBGMLPLicense(song.license);
          const shouldBeIncluded = hasCommercialCC || isBGMLP;
          return isIncluded === shouldBeIncluded;
        }
      ));
    });

    it('should identify CC licensed songs as creator-friendly', () => {
      const ccLicenses = ['CC BY 4.0', 'CC BY-SA 4.0', 'CC0 1.0'];

      ccLicenses.forEach(license => {
        fc.assert(fc.property(
          songViewArbitrary,
          (song) => {
            const ccVersion = { ...song, license };
            return isCreatorFriendlySong(ccVersion) === true;
          }
        ));
      });
    });

    it('should identify BGML-P licensed songs as creator-friendly', () => {
      fc.assert(fc.property(
        songViewArbitrary,
        (song) => {
          const bgmlVersion = { ...song, license: 'BGML-P' };
          return isCreatorFriendlySong(bgmlVersion) === true;
        }
      ));
    });

    it('should not identify restrictive songs as creator-friendly', () => {
      const restrictiveLicenses = ['All Rights Reserved', 'Copyright', ''];

      restrictiveLicenses.forEach(license => {
        fc.assert(fc.property(
          songViewArbitrary,
          (song) => {
            const restrictiveVersion = { ...song, license };
            return isCreatorFriendlySong(restrictiveVersion) === false;
          }
        ));
      });
    });
  });

  describe('Filter Array Operations', () => {
    /**
     * **Property 6: View Filtering Subset**
     * **Validates: Requirements 5.1, 5.5**
     *
     * For any list of SongViews, the creator-friendly filtered list should be
     * a subset of the original list.
     */
    it('Property 6: Creator list is subset of all songs', () => {
      fc.assert(fc.property(
        fc.array(songViewArbitrary, { minLength: 1, maxLength: 20 }),
        (songs) => {
          const creatorSongs = filterCreatorFriendly(songs);
          return creatorSongs.every(creatorSong =>
            songs.some(song => song.id === creatorSong.id)
          );
        }
      ));
    });

    it('should preserve song data when filtering', () => {
      fc.assert(fc.property(
        fc.array(songViewArbitrary, { minLength: 1, maxLength: 10 }),
        (songs) => {
          const creatorSongs = filterCreatorFriendly(songs);
          return creatorSongs.every(creatorSong => {
            const originalSong = songs.find(song => song.id === creatorSong.id);
            return originalSong &&
              originalSong.title === creatorSong.title &&
              originalSong.license === creatorSong.license &&
              originalSong.streamLink === creatorSong.streamLink &&
              originalSong.hasContentId === creatorSong.hasContentId;
          });
        }
      ));
    });

    it('should handle empty arrays gracefully', () => {
      const result = filterCreatorFriendly([]);
      expect(result).toEqual([]);
    });

    it('should filter consistently across multiple calls', () => {
      fc.assert(fc.property(
        fc.array(songViewArbitrary, { minLength: 1, maxLength: 10 }),
        (songs) => {
          const result1 = filterCreatorFriendly(songs);
          const result2 = filterCreatorFriendly(songs);
          return result1.length === result2.length &&
            result1.every((song, index) => song.id === result2[index].id);
        }
      ));
    });
  });

  describe('Batch Operations', () => {
    it('should batch check creator-friendly status correctly', () => {
      fc.assert(fc.property(
        uniqueSongsArbitrary(1, 10),
        (songs) => {
          const batchResults = batchCheckCreatorFriendly(songs);
          if (batchResults.length !== songs.length) return false;
          return songs.every((song, index) => {
            const individualResult = isCreatorFriendlySong(song);
            return batchResults[index] === individualResult;
          });
        }
      ));
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing fields gracefully', () => {
      const incompleteSong = {
        id: 'test',
        title: 'Test Song'
        // Missing required fields
      } as any;

      expect(() => isCreatorFriendlySong(incompleteSong)).not.toThrow();
      expect(isCreatorFriendlySong(incompleteSong)).toBe(false);
    });

    it('should handle null/undefined license values', () => {
      const songWithNullLicense = {
        id: 'test',
        title: 'Test Song',
        license: null as any,
        streamLink: 'https://example.com',
        albumId: 'album-1',
        albumTitle: 'Test Album',
        releaseYear: 2024,
        hasContentId: false,
        albumArtwork: 'https://example.com/art.jpg'
      } as SongView;

      expect(() => filterCreatorFriendly([songWithNullLicense])).not.toThrow();
    });

    it('should handle very large arrays efficiently', () => {
      const largeSongArray: SongView[] = Array.from({ length: 1000 }, (_, index) => ({
        id: `song-${index}`,
        title: `Song ${index}`,
        license: index % 4 === 0 ? 'CC BY 4.0' : 'All Rights Reserved',
        streamLink: `https://example.com/song-${index}`,
        albumId: `album-${Math.floor(index / 10)}`,
        albumTitle: `Album ${Math.floor(index / 10)}`,
        releaseYear: 2024,
        hasContentId: index % 2 === 0,
        albumArtwork: 'https://example.com/art.jpg'
      }));

      const startTime = Date.now();
      const result = filterCreatorFriendly(largeSongArray);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(largeSongArray.length);
    });
  });

  describe('Specific Business Logic Tests', () => {
    it('should handle mixed criteria correctly', () => {
      const testSongs: SongView[] = [
        {
          id: 'cc-song',
          title: 'CC Song',
          license: 'CC BY 4.0',
          streamLink: 'https://example.com/cc',
          albumId: 'album-1',
          albumTitle: 'Test Album',
          releaseYear: 2024,
          hasContentId: false,
          albumArtwork: 'https://example.com/art.jpg'
        },
        {
          id: 'bgml-song',
          title: 'BGML-P Song',
          license: 'BGML-P',
          streamLink: 'https://example.com/bgml',
          albumId: 'album-1',
          albumTitle: 'Test Album',
          releaseYear: 2024,
          hasContentId: true,
          albumArtwork: 'https://example.com/art.jpg'
        },
        {
          id: 'restrictive-song',
          title: 'Restrictive Song',
          license: 'All Rights Reserved',
          streamLink: 'https://example.com/restrictive',
          albumId: 'album-1',
          albumTitle: 'Test Album',
          releaseYear: 2024,
          hasContentId: false,
          albumArtwork: 'https://example.com/art.jpg'
        }
      ];

      const creatorFriendly = filterCreatorFriendly(testSongs);

      expect(creatorFriendly).toHaveLength(2);
      expect(creatorFriendly.map(s => s.id)).toContain('cc-song');
      expect(creatorFriendly.map(s => s.id)).toContain('bgml-song');
      expect(creatorFriendly.map(s => s.id)).not.toContain('restrictive-song');
    });

    it('should handle case-insensitive license matching', () => {
      const testSongs: SongView[] = [
        {
          id: 'lowercase-cc',
          title: 'Lowercase CC',
          license: 'cc by 4.0',
          streamLink: 'https://example.com',
          albumId: 'album-1',
          albumTitle: 'Test',
          releaseYear: 2024,
          hasContentId: false,
          albumArtwork: 'https://example.com/art.jpg'
        },
        {
          id: 'mixed-case-cc',
          title: 'Mixed Case CC',
          license: 'Cc By 4.0',
          streamLink: 'https://example.com',
          albumId: 'album-1',
          albumTitle: 'Test',
          releaseYear: 2024,
          hasContentId: false,
          albumArtwork: 'https://example.com/art.jpg'
        }
      ];

      const creatorFriendly = filterCreatorFriendly(testSongs);
      expect(creatorFriendly).toHaveLength(2);
    });
  });
});
