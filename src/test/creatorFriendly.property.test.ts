/**
 * Property-based tests for creator-friendly filtering functionality
 * 
 * These tests verify that the creator-friendly filtering logic correctly
 * identifies and filters songs according to the requirements.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import { initWasm } from '../wasm/bindings';
import { 
  filterCreatorFriendly, 
  isCommercialCCLicense, 
  isBGMLPLicense,
  isCreatorFriendlySong 
} from '../utils/filters';
import { 
  songArbitrary, 
  uniqueSongsArbitrary,
  creatorFriendlySongArbitrary,
  nonCreatorFriendlySongArbitrary 
} from '../../test/arbitraries';
import type { Song } from '../types/music';

describe('Property 4: Creator-Friendly Filter Correctness', () => {
  beforeAll(async () => {
    // Initialize WASM module before running tests
    await initWasm();
  });

  /**
   * **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
   * 
   * For any song, it should be included in the creator-friendly list if and only if 
   * it meets at least one of the criteria: CC commercial license, NCS release, or BGML-P license.
   */
  it('should include songs that meet creator-friendly criteria', () => {
    fc.assert(
      fc.property(songArbitrary, (song: Song) => {
        const isIncluded = isCreatorFriendlySong(song);
        
        // Check each criterion
        const hasCommercialCC = isCommercialCCLicense(song.license);
        const isNCS = song.releaseType === 'NCS';
        const isBGMLP = isBGMLPLicense(song.license);
        
        const shouldBeIncluded = hasCommercialCC || isNCS || isBGMLP;
        
        // The result should match our criteria
        const result = isIncluded === shouldBeIncluded;
        
        // Provide detailed error information if the test fails
        if (!result) {
          console.error('Creator-friendly filter correctness failed:', {
            songId: song.id,
            title: song.title,
            license: song.license,
            releaseType: song.releaseType,
            hasCommercialCC,
            isNCS,
            isBGMLP,
            shouldBeIncluded,
            actuallyIncluded: isIncluded
          });
        }
        
        return result;
      }),
      { numRuns: 1000 }
    );
  });

  it('should always include NCS releases', () => {
    fc.assert(
      fc.property(songArbitrary, (song: Song) => {
        // Force song to be NCS release
        const ncsSong: Song = {
          ...song,
          releaseType: 'NCS'
        };
        
        const isIncluded = isCreatorFriendlySong(ncsSong);
        
        // NCS releases should always be creator-friendly
        expect(isIncluded).toBe(true);
        return true;
      }),
      { numRuns: 200 }
    );
  });

  it('should always include commercial CC licensed songs', () => {
    const commercialCCLicenses = [
      'CC BY 4.0',
      'CC BY-SA 4.0', 
      'CC BY 3.0',
      'CC BY-SA 3.0',
      'CC0 1.0',
      'CC0'
    ];

    fc.assert(
      fc.property(
        songArbitrary,
        fc.constantFrom(...commercialCCLicenses),
        (song: Song, ccLicense: string) => {
          const ccSong: Song = {
            ...song,
            license: ccLicense,
            releaseType: 'Independent' // Ensure it's not NCS (to test license specifically)
          };
          
          const isIncluded = isCreatorFriendlySong(ccSong);
          
          // Commercial CC licenses should always be creator-friendly
          expect(isIncluded).toBe(true);
          return true;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should always include BGML-P licensed songs', () => {
    fc.assert(
      fc.property(songArbitrary, (song: Song) => {
        const bgmlpSong: Song = {
          ...song,
          license: 'BGML-P',
          releaseType: 'Independent' // Ensure it's not NCS
        };
        
        const isIncluded = isCreatorFriendlySong(bgmlpSong);
        
        // BGML-P licenses should always be creator-friendly
        expect(isIncluded).toBe(true);
        return true;
      }),
      { numRuns: 200 }
    );
  });

  it('should exclude songs that meet no creator-friendly criteria', () => {
    const nonCreatorFriendlyLicenses = [
      'All Rights Reserved',
      'Custom License',
      'Proprietary',
      'CC BY-NC 4.0', // Non-commercial CC license
      'CC BY-NC-SA 4.0',
      ''
    ];

    fc.assert(
      fc.property(
        songArbitrary,
        fc.constantFrom(...nonCreatorFriendlyLicenses),
        (song: Song, restrictiveLicense: string) => {
          // Create song that should NOT be creator-friendly
          const restrictiveSong: Song = {
            ...song,
            license: restrictiveLicense,
            releaseType: 'Independent' // Not NCS
          };
          
          // Skip if the license happens to be empty string and we want to test non-empty
          if (restrictiveLicense === '' && song.releaseType === 'NCS') {
            return true; // Skip this case
          }
          
          const isIncluded = isCreatorFriendlySong(restrictiveSong);
          
          // Should not be creator-friendly
          const result = !isIncluded;
          
          if (!result) {
            console.error('Non-creator-friendly song was incorrectly included:', {
              songId: restrictiveSong.id,
              license: restrictiveSong.license,
              releaseType: restrictiveSong.releaseType,
              isIncluded
            });
          }
          
          return result;
        }
      ),
      { numRuns: 300 }
    );
  });

  it('should handle edge cases in license strings', () => {
    const edgeCaseLicenses = [
      'cc by 4.0', // lowercase
      'CC BY 4.0 ', // trailing space
      ' CC BY 4.0', // leading space
      'CC BY', // no version
      'CC0', // short form
      'bgml-p', // lowercase BGML-P
      'BGML-p', // mixed case
      'CC BY-SA', // no version
      'cc0 1.0' // lowercase CC0
    ];

    fc.assert(
      fc.property(
        songArbitrary,
        fc.constantFrom(...edgeCaseLicenses),
        (song: Song, edgeLicense: string) => {
          const edgeSong: Song = {
            ...song,
            license: edgeLicense,
            releaseType: 'Independent'
          };
          
          const isIncluded = isCreatorFriendlySong(edgeSong);
          const hasCommercialCC = isCommercialCCLicense(edgeLicense);
          const isBGMLP = isBGMLPLicense(edgeLicense);
          
          // Should be included if it matches CC or BGML-P patterns
          const shouldBeIncluded = hasCommercialCC || isBGMLP;
          
          return isIncluded === shouldBeIncluded;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should work with generated creator-friendly songs', () => {
    fc.assert(
      fc.property(creatorFriendlySongArbitrary, (song: Song) => {
        const isIncluded = isCreatorFriendlySong(song);
        
        // All songs from creatorFriendlySongArbitrary should be creator-friendly
        // (though some might not be due to the arbitrary's mixed generation)
        // We'll check that the logic is consistent
        const hasCommercialCC = isCommercialCCLicense(song.license);
        const isNCS = song.releaseType === 'NCS';
        const isBGMLP = isBGMLPLicense(song.license);
        
        const shouldBeIncluded = hasCommercialCC || isNCS || isBGMLP;
        
        return isIncluded === shouldBeIncluded;
      }),
      { numRuns: 500 }
    );
  });

  it('should work with generated non-creator-friendly songs', () => {
    fc.assert(
      fc.property(nonCreatorFriendlySongArbitrary, (song: Song) => {
        const isIncluded = isCreatorFriendlySong(song);
        
        // Check that the logic is consistent
        const hasCommercialCC = isCommercialCCLicense(song.license);
        const isNCS = song.releaseType === 'NCS';
        const isBGMLP = isBGMLPLicense(song.license);
        
        const shouldBeIncluded = hasCommercialCC || isNCS || isBGMLP;
        
        return isIncluded === shouldBeIncluded;
      }),
      { numRuns: 500 }
    );
  });
});

describe('Property 6: Creator List Subset', () => {
  beforeAll(async () => {
    // Initialize WASM module before running tests
    await initWasm();
  });

  /**
   * **Validates: Requirements 5.1, 5.5**
   * 
   * For any list of songs, the creator-friendly filtered list should be a subset 
   * of the original list.
   */
  it('should return a subset of the original songs', () => {
    fc.assert(
      fc.property(uniqueSongsArbitrary(0, 50), (songs: Song[]) => {
        const creatorSongs = filterCreatorFriendly(songs);
        
        // Test 1: Creator list should not be larger than original
        const sizeConstraint = creatorSongs.length <= songs.length;
        
        // Test 2: All creator songs should exist in original list
        const allExistInOriginal = creatorSongs.every(creatorSong => 
          songs.some(originalSong => originalSong.id === creatorSong.id)
        );
        
        // Test 3: No duplicate songs in creator list
        const creatorIds = creatorSongs.map(song => song.id);
        const uniqueCreatorIds = new Set(creatorIds);
        const noDuplicatesInCreator = creatorIds.length === uniqueCreatorIds.size;
        
        // Test 4: All songs in creator list should actually be creator-friendly
        const allAreCreatorFriendly = creatorSongs.every(song => 
          isCreatorFriendlySong(song)
        );
        
        const result = sizeConstraint && allExistInOriginal && noDuplicatesInCreator && allAreCreatorFriendly;
        
        // Provide detailed error information if the test fails
        if (!result) {
          console.error('Creator list subset property failed:', {
            originalCount: songs.length,
            creatorCount: creatorSongs.length,
            sizeConstraint,
            allExistInOriginal,
            noDuplicatesInCreator,
            allAreCreatorFriendly,
            originalIds: songs.map(s => s.id).sort(),
            creatorIds: creatorSongs.map(s => s.id).sort(),
            missingInOriginal: creatorSongs
              .filter(cs => !songs.some(os => os.id === cs.id))
              .map(s => s.id),
            nonCreatorFriendlyInResult: creatorSongs
              .filter(song => !isCreatorFriendlySong(song))
              .map(s => ({ id: s.id, license: s.license, releaseType: s.releaseType }))
          });
        }
        
        return result;
      }),
      { numRuns: 1000 }
    );
  });

  it('should preserve song data integrity in filtered results', () => {
    fc.assert(
      fc.property(uniqueSongsArbitrary(1, 30), (songs: Song[]) => {
        const creatorSongs = filterCreatorFriendly(songs);
        
        // Every song in the filtered result should be identical to its original
        return creatorSongs.every(creatorSong => {
          const originalSong = songs.find(s => s.id === creatorSong.id);
          
          if (!originalSong) return false;
          
          // Check that all fields are preserved exactly
          return (
            creatorSong.id === originalSong.id &&
            creatorSong.title === originalSong.title &&
            creatorSong.albumName === originalSong.albumName &&
            creatorSong.releaseType === originalSong.releaseType &&
            creatorSong.hasContentId === originalSong.hasContentId &&
            creatorSong.streamingLink === originalSong.streamingLink &&
            creatorSong.license === originalSong.license
          );
        });
      }),
      { numRuns: 500 }
    );
  });

  it('should handle empty song arrays', () => {
    const emptySongs: Song[] = [];
    const creatorSongs = filterCreatorFriendly(emptySongs);
    
    // Empty input should produce empty output
    expect(creatorSongs).toEqual([]);
  });

  it('should handle arrays with no creator-friendly songs', () => {
    fc.assert(
      fc.property(
        fc.array(nonCreatorFriendlySongArbitrary, { minLength: 1, maxLength: 20 }),
        (nonCreatorSongs: Song[]) => {
          // Ensure unique IDs
          const uniqueNonCreatorSongs = nonCreatorSongs.map((song, index) => ({
            ...song,
            id: `${song.id}-${index}`,
            releaseType: 'Independent' as const, // Ensure not NCS
            license: 'All Rights Reserved' // Ensure not creator-friendly
          }));
          
          const creatorSongs = filterCreatorFriendly(uniqueNonCreatorSongs);
          
          // Should return empty array
          return creatorSongs.length === 0;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should handle arrays with all creator-friendly songs', () => {
    fc.assert(
      fc.property(
        fc.array(creatorFriendlySongArbitrary, { minLength: 1, maxLength: 20 }),
        (creatorFriendlySongs: Song[]) => {
          // Ensure unique IDs and force creator-friendly properties
          const uniqueCreatorSongs = creatorFriendlySongs.map((song, index) => ({
            ...song,
            id: `${song.id}-${index}`,
            releaseType: 'NCS' as const // Force NCS to ensure creator-friendly
          }));
          
          const filteredSongs = filterCreatorFriendly(uniqueCreatorSongs);
          
          // Should return all songs (since all are creator-friendly)
          const result = filteredSongs.length === uniqueCreatorSongs.length &&
                        uniqueCreatorSongs.every(original =>
                          filteredSongs.some(filtered => filtered.id === original.id)
                        );
          
          if (!result) {
            console.error('All creator-friendly test failed:', {
              originalCount: uniqueCreatorSongs.length,
              filteredCount: filteredSongs.length,
              originalIds: uniqueCreatorSongs.map(s => s.id).sort(),
              filteredIds: filteredSongs.map(s => s.id).sort()
            });
          }
          
          return result;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should maintain consistent filtering across multiple calls', () => {
    fc.assert(
      fc.property(uniqueSongsArbitrary(5, 25), (songs: Song[]) => {
        // Filter the same songs multiple times
        const result1 = filterCreatorFriendly(songs);
        const result2 = filterCreatorFriendly(songs);
        const result3 = filterCreatorFriendly(songs);
        
        // Results should be identical
        const sameLength = result1.length === result2.length && result2.length === result3.length;
        
        const sameIds = result1.every(song1 => 
          result2.some(song2 => song2.id === song1.id) &&
          result3.some(song3 => song3.id === song1.id)
        );
        
        return sameLength && sameIds;
      }),
      { numRuns: 300 }
    );
  });

  it('should work correctly with mixed song types', () => {
    // Create a specific test case with known creator-friendly and non-creator-friendly songs
    const mixedSongs: Song[] = [
      {
        id: 'cf-1',
        title: 'Creator Friendly 1',
        albumName: 'Test Album',
        releaseType: 'NCS',
        hasContentId: false,
        streamingLink: 'https://example.com/cf1',
        license: ''
      },
      {
        id: 'cf-2',
        title: 'Creator Friendly 2',
        albumName: 'Test Album',
        releaseType: 'Independent',
        hasContentId: false,
        streamingLink: 'https://example.com/cf2',
        license: 'CC BY 4.0'
      },
      {
        id: 'cf-3',
        title: 'Creator Friendly 3',
        albumName: 'Test Album',
        releaseType: 'Independent',
        hasContentId: false,
        streamingLink: 'https://example.com/cf3',
        license: 'BGML-P'
      },
      {
        id: 'ncf-1',
        title: 'Not Creator Friendly 1',
        albumName: 'Test Album',
        releaseType: 'Independent',
        hasContentId: true,
        streamingLink: 'https://example.com/ncf1',
        license: 'All Rights Reserved'
      },
      {
        id: 'ncf-2',
        title: 'Not Creator Friendly 2',
        albumName: 'Test Album',
        releaseType: 'Monstercat',
        hasContentId: true,
        streamingLink: 'https://example.com/ncf2',
        license: 'Proprietary'
      }
    ];

    const creatorSongs = filterCreatorFriendly(mixedSongs);

    // Should include exactly the 3 creator-friendly songs
    expect(creatorSongs).toHaveLength(3);
    
    const creatorIds = creatorSongs.map(s => s.id).sort();
    expect(creatorIds).toEqual(['cf-1', 'cf-2', 'cf-3']);
    
    // All returned songs should be creator-friendly
    creatorSongs.forEach(song => {
      expect(isCreatorFriendlySong(song)).toBe(true);
    });
    
    // All returned songs should exist in original array
    creatorSongs.forEach(creatorSong => {
      const originalSong = mixedSongs.find(s => s.id === creatorSong.id);
      expect(originalSong).toBeDefined();
      expect(originalSong).toEqual(creatorSong);
    });
  });
});