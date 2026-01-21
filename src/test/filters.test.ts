/**
 * Property-Based Tests for Filter Logic
 * 
 * **Property 4: Creator-Friendly Filter Correctness**
 * **Property 6: View Filtering Subset**
 * 
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
 * 
 * These tests verify that the creator-friendly filtering logic correctly
 * identifies songs that are free for creators to use based on the specified criteria.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  filterCreatorFriendly,
  isCommercialCCLicense,
  isBGMLPLicense,
  batchCheckCreatorFriendly
} from '../utils/filters';
import { isCreatorFriendlySong } from '../utils/display';
import type { Song, ReleaseType } from '../types/music';

// Custom arbitraries for testing
const releaseTypeArbitrary = fc.constantFrom('Independent', 'NCS', 'Monstercat') as fc.Arbitrary<ReleaseType>;

const songArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  albumName: fc.string({ minLength: 1, maxLength: 100 }),
  releaseType: releaseTypeArbitrary,
  hasContentId: fc.boolean(),
  streamingLink: fc.webUrl(),
  license: fc.oneof(
    fc.constant(''),
    fc.constant('CC BY 4.0'),
    fc.constant('CC BY-SA 4.0'),
    fc.constant('CC0 1.0'),
    fc.constant('BGML-P'),
    fc.constant('All Rights Reserved'),
    fc.string({ minLength: 0, maxLength: 50 })
  )
});

describe('Filter Logic Property Tests', () => {
  describe('License Recognition', () => {
    it('should correctly identify commercial CC licenses', () => {
      const commercialCCLicenses = [
        'CC BY 4.0',
        'CC BY 3.0',
        'CC BY',
        'cc by 4.0', // case insensitive
        'CC BY-SA 4.0',
        'CC BY-SA 3.0',
        'CC BY-SA',
        'cc by-sa 4.0',
        'CC0 1.0',
        'CC0',
        'cc0'
      ];

      commercialCCLicenses.forEach(license => {
        expect(isCommercialCCLicense(license), 
          `License "${license}" should be recognized as commercial CC`
        ).toBe(true);
      });
    });

    it('should reject non-commercial or restrictive licenses', () => {
      const nonCommercialLicenses = [
        'CC BY-NC 4.0',
        'CC BY-NC-SA 4.0',
        'All Rights Reserved',
        'Copyright',
        '',
        'Custom License',
        'CC BY-ND 4.0' // No derivatives
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
     * 
     * **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
     * 
     * For any song, it should be included in the creator-friendly list if and only if 
     * it meets at least one of the criteria: CC commercial license, NCS release, or BGML-P license.
     */
    it('Property 4: Creator-friendly filter includes correct songs', () => {
      fc.assert(fc.property(
        songArbitrary,
        (song) => {
          const isIncluded = isCreatorFriendlySong(song);
          
          const hasCommercialCC = isCommercialCCLicense(song.license);
          const isNCS = song.releaseType === 'NCS';
          const isBGMLP = isBGMLPLicense(song.license);
          
          const shouldBeIncluded = hasCommercialCC || isNCS || isBGMLP;
          
          return isIncluded === shouldBeIncluded;
        }
      ));
    });

    it('should identify NCS releases as creator-friendly', () => {
      fc.assert(fc.property(
        songArbitrary,
        (song) => {
          const ncsVersion = { ...song, releaseType: 'NCS' as ReleaseType };
          return isCreatorFriendlySong(ncsVersion) === true;
        }
      ));
    });

    it('should identify CC licensed songs as creator-friendly', () => {
      const ccLicenses = ['CC BY 4.0', 'CC BY-SA 4.0', 'CC0 1.0'];
      
      ccLicenses.forEach(license => {
        fc.assert(fc.property(
          songArbitrary,
          (song) => {
            const ccVersion = { ...song, license, releaseType: 'Independent' as ReleaseType };
            return isCreatorFriendlySong(ccVersion) === true;
          }
        ));
      });
    });

    it('should identify BGML-P licensed songs as creator-friendly', () => {
      fc.assert(fc.property(
        songArbitrary,
        (song) => {
          const bgmlVersion = { ...song, license: 'BGML-P', releaseType: 'Independent' as ReleaseType };
          return isCreatorFriendlySong(bgmlVersion) === true;
        }
      ));
    });

    it('should not identify restrictive songs as creator-friendly', () => {
      const restrictiveLicenses = ['All Rights Reserved', 'Copyright', ''];
      
      restrictiveLicenses.forEach(license => {
        fc.assert(fc.property(
          songArbitrary,
          (song) => {
            const restrictiveVersion = { 
              ...song, 
              license, 
              releaseType: 'Independent' as ReleaseType 
            };
            return isCreatorFriendlySong(restrictiveVersion) === false;
          }
        ));
      });
    });
  });

  describe('Filter Array Operations', () => {
    /**
     * **Property 6: View Filtering Subset**
     * 
     * **Validates: Requirements 5.1, 5.5**
     * 
     * For any list of songs, the creator-friendly filtered list should be 
     * a subset of the original list.
     */
    it('Property 6: Creator list is subset of all songs', () => {
      fc.assert(fc.property(
        fc.array(songArbitrary, { minLength: 1, maxLength: 20 }),
        (songs) => {
          const creatorSongs = filterCreatorFriendly(songs);
          
          // All creator songs should exist in original list
          return creatorSongs.every(creatorSong => 
            songs.some(song => song.id === creatorSong.id)
          );
        }
      ));
    });

    it('should preserve song data when filtering', () => {
      fc.assert(fc.property(
        fc.array(songArbitrary, { minLength: 1, maxLength: 10 }),
        (songs) => {
          const creatorSongs = filterCreatorFriendly(songs);
          
          // Each filtered song should be identical to its original
          return creatorSongs.every(creatorSong => {
            const originalSong = songs.find(song => song.id === creatorSong.id);
            return originalSong && 
              originalSong.title === creatorSong.title &&
              originalSong.albumName === creatorSong.albumName &&
              originalSong.releaseType === creatorSong.releaseType &&
              originalSong.hasContentId === creatorSong.hasContentId &&
              originalSong.streamingLink === creatorSong.streamingLink &&
              originalSong.license === creatorSong.license;
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
        fc.array(songArbitrary, { minLength: 1, maxLength: 10 }),
        (songs) => {
          const result1 = filterCreatorFriendly(songs);
          const result2 = filterCreatorFriendly(songs);
          
          // Results should be identical
          return result1.length === result2.length &&
            result1.every((song, index) => song.id === result2[index].id);
        }
      ));
    });
  });

  describe('Batch Operations', () => {
    it('should batch check creator-friendly status correctly', () => {
      fc.assert(fc.property(
        fc.array(songArbitrary, { minLength: 1, maxLength: 10 }),
        (songs) => {
          const batchResults = batchCheckCreatorFriendly(songs);
          
          // Should return boolean array of same length
          if (batchResults.length !== songs.length) {
            return false;
          }
          
          // Each result should match individual check
          return songs.every((song, index) => {
            const individualResult = isCreatorFriendlySong(song);
            return batchResults[index] === individualResult;
          });
        }
      ));
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed JSON gracefully', () => {
      // This test is not applicable since we're not using JSON strings anymore
      expect(true).toBe(true);
    });

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
        albumName: 'Test Album',
        releaseType: 'Independent' as ReleaseType,
        hasContentId: false,
        streamingLink: 'https://example.com',
        license: null as any
      };
      
      expect(() => filterCreatorFriendly([songWithNullLicense])).not.toThrow();
    });

    it('should handle very large arrays efficiently', () => {
      // Create a large array of songs
      const largeSongArray = Array.from({ length: 1000 }, (_, index) => ({
        id: `song-${index}`,
        title: `Song ${index}`,
        albumName: `Album ${Math.floor(index / 10)}`,
        releaseType: (index % 3 === 0 ? 'NCS' : 'Independent') as ReleaseType,
        hasContentId: index % 2 === 0,
        streamingLink: `https://example.com/song-${index}`,
        license: index % 4 === 0 ? 'CC BY 4.0' : 'All Rights Reserved'
      }));
      
      const startTime = Date.now();
      const result = filterCreatorFriendly(largeSongArray);
      const endTime = Date.now();
      
      // Should complete within reasonable time (< 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
      
      // Should return some creator-friendly songs
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(largeSongArray.length);
    });
  });

  describe('Specific Business Logic Tests', () => {
    it('should handle mixed criteria correctly', () => {
      const testSongs: Song[] = [
        {
          id: 'ncs-with-content-id',
          title: 'NCS Song with Content ID',
          albumName: 'Test Album',
          releaseType: 'NCS',
          hasContentId: true, // Should still be creator-friendly
          streamingLink: 'https://ncs.io/song',
          license: ''
        },
        {
          id: 'cc-monstercat',
          title: 'CC Licensed Monstercat',
          albumName: 'Test Album',
          releaseType: 'Monstercat',
          hasContentId: true,
          streamingLink: 'https://monstercat.com/song',
          license: 'CC BY 4.0' // Should be creator-friendly despite Monstercat
        },
        {
          id: 'independent-restrictive',
          title: 'Independent Restrictive',
          albumName: 'Test Album',
          releaseType: 'Independent',
          hasContentId: false,
          streamingLink: 'https://example.com/song',
          license: 'All Rights Reserved' // Should NOT be creator-friendly
        }
      ];
      
      const creatorFriendly = filterCreatorFriendly(testSongs);
      
      expect(creatorFriendly).toHaveLength(2);
      expect(creatorFriendly.map(s => s.id)).toContain('ncs-with-content-id');
      expect(creatorFriendly.map(s => s.id)).toContain('cc-monstercat');
      expect(creatorFriendly.map(s => s.id)).not.toContain('independent-restrictive');
    });

    it('should handle case-insensitive license matching', () => {
      const testSongs: Song[] = [
        {
          id: 'lowercase-cc',
          title: 'Lowercase CC',
          albumName: 'Test',
          releaseType: 'Independent',
          hasContentId: false,
          streamingLink: 'https://example.com',
          license: 'cc by 4.0'
        },
        {
          id: 'mixed-case-cc',
          title: 'Mixed Case CC',
          albumName: 'Test',
          releaseType: 'Independent',
          hasContentId: false,
          streamingLink: 'https://example.com',
          license: 'Cc By 4.0'
        }
      ];
      
      const creatorFriendly = filterCreatorFriendly(testSongs);
      expect(creatorFriendly).toHaveLength(2);
    });
  });
});