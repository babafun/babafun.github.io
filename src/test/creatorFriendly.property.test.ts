/**
 * Property-based tests for creator-friendly filtering functionality
 *
 * **Property 4: Creator-Friendly Filter Correctness**
 * **Property 6: Creator List Subset**
 *
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  filterCreatorFriendly,
  isCommercialCCLicense,
  isBGMLPLicense,
  isCreatorFriendlySong
} from '../utils/filters';
import {
  songViewArbitrary,
  uniqueSongsArbitrary,
  creatorFriendlySongArbitrary,
  nonCreatorFriendlySongArbitrary
} from '../../test/arbitraries';
import type { SongView } from '../types/music';

describe('Property 4: Creator-Friendly Filter Correctness', () => {
  /**
   * **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
   *
   * For any SongView, it should be creator-friendly iff it has a commercial CC
   * license or a BGML-P license.
   */
  it('should include songs that meet creator-friendly criteria', () => {
    fc.assert(
      fc.property(songViewArbitrary, (song: SongView) => {
        const isIncluded = isCreatorFriendlySong(song);
        const hasCommercialCC = isCommercialCCLicense(song.license);
        const isBGMLP = isBGMLPLicense(song.license);
        const shouldBeIncluded = hasCommercialCC || isBGMLP;
        return isIncluded === shouldBeIncluded;
      }),
      { numRuns: 1000 }
    );
  });

  it('should always include commercial CC licensed songs', () => {
    const commercialCCLicenses = [
      'CC BY 4.0', 'CC BY-SA 4.0', 'CC BY 3.0', 'CC BY-SA 3.0', 'CC0 1.0', 'CC0'
    ];

    fc.assert(
      fc.property(
        songViewArbitrary,
        fc.constantFrom(...commercialCCLicenses),
        (song: SongView, ccLicense: string) => {
          const ccSong: SongView = { ...song, license: ccLicense };
          const isIncluded = isCreatorFriendlySong(ccSong);
          expect(isIncluded).toBe(true);
          return true;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should always include BGML-P licensed songs', () => {
    fc.assert(
      fc.property(songViewArbitrary, (song: SongView) => {
        const bgmlpSong: SongView = { ...song, license: 'BGML-P' };
        const isIncluded = isCreatorFriendlySong(bgmlpSong);
        expect(isIncluded).toBe(true);
        return true;
      }),
      { numRuns: 200 }
    );
  });

  it('should exclude songs that meet no creator-friendly criteria', () => {
    const nonCreatorFriendlyLicenses = [
      'All Rights Reserved', 'Custom License', 'Proprietary',
      'CC BY-NC 4.0', 'CC BY-NC-SA 4.0', ''
    ];

    fc.assert(
      fc.property(
        songViewArbitrary,
        fc.constantFrom(...nonCreatorFriendlyLicenses),
        (song: SongView, restrictiveLicense: string) => {
          const restrictiveSong: SongView = { ...song, license: restrictiveLicense };
          const isIncluded = isCreatorFriendlySong(restrictiveSong);
          return !isIncluded;
        }
      ),
      { numRuns: 300 }
    );
  });

  it('should work with generated creator-friendly songs', () => {
    fc.assert(
      fc.property(creatorFriendlySongArbitrary, (song: SongView) => {
        const isIncluded = isCreatorFriendlySong(song);
        const hasCommercialCC = isCommercialCCLicense(song.license);
        const isBGMLP = isBGMLPLicense(song.license);
        const shouldBeIncluded = hasCommercialCC || isBGMLP;
        return isIncluded === shouldBeIncluded;
      }),
      { numRuns: 500 }
    );
  });

  it('should work with generated non-creator-friendly songs', () => {
    fc.assert(
      fc.property(nonCreatorFriendlySongArbitrary, (song: SongView) => {
        const isIncluded = isCreatorFriendlySong(song);
        const hasCommercialCC = isCommercialCCLicense(song.license);
        const isBGMLP = isBGMLPLicense(song.license);
        const shouldBeIncluded = hasCommercialCC || isBGMLP;
        return isIncluded === shouldBeIncluded;
      }),
      { numRuns: 500 }
    );
  });
});

describe('Property 6: Creator List Subset', () => {
  /**
   * **Validates: Requirements 5.1, 5.5**
   *
   * For any list of SongViews, the creator-friendly filtered list should be a
   * subset of the original list.
   */
  it('should return a subset of the original songs', () => {
    fc.assert(
      fc.property(uniqueSongsArbitrary(0, 50), (songs: SongView[]) => {
        const creatorSongs = filterCreatorFriendly(songs);

        const sizeConstraint = creatorSongs.length <= songs.length;
        const allExistInOriginal = creatorSongs.every(cs =>
          songs.some(os => os.id === cs.id)
        );
        const creatorIds = creatorSongs.map(s => s.id);
        const noDuplicates = creatorIds.length === new Set(creatorIds).size;
        const allAreCreatorFriendly = creatorSongs.every(s => isCreatorFriendlySong(s));

        return sizeConstraint && allExistInOriginal && noDuplicates && allAreCreatorFriendly;
      }),
      { numRuns: 1000 }
    );
  });

  it('should preserve song data integrity in filtered results', () => {
    fc.assert(
      fc.property(uniqueSongsArbitrary(1, 30), (songs: SongView[]) => {
        const creatorSongs = filterCreatorFriendly(songs);
        return creatorSongs.every(cs => {
          const original = songs.find(s => s.id === cs.id);
          if (!original) return false;
          return (
            cs.id === original.id &&
            cs.title === original.title &&
            cs.license === original.license &&
            cs.streamLink === original.streamLink &&
            cs.hasContentId === original.hasContentId
          );
        });
      }),
      { numRuns: 500 }
    );
  });

  it('should handle empty song arrays', () => {
    const creatorSongs = filterCreatorFriendly([]);
    expect(creatorSongs).toEqual([]);
  });

  it('should handle arrays with no creator-friendly songs', () => {
    fc.assert(
      fc.property(
        fc.array(nonCreatorFriendlySongArbitrary, { minLength: 1, maxLength: 20 }),
        (nonCreatorSongs: SongView[]) => {
          const uniqueSongs = nonCreatorSongs.map((song, index) => ({
            ...song,
            id: `${song.id}-${index}`,
            license: 'All Rights Reserved'
          }));
          const creatorSongs = filterCreatorFriendly(uniqueSongs);
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
        (creatorFriendlySongs: SongView[]) => {
          const uniqueSongs = creatorFriendlySongs.map((song, index) => ({
            ...song,
            id: `${song.id}-${index}`,
            license: 'CC BY 4.0'
          }));
          const filteredSongs = filterCreatorFriendly(uniqueSongs);
          return filteredSongs.length === uniqueSongs.length &&
            uniqueSongs.every(original =>
              filteredSongs.some(filtered => filtered.id === original.id)
            );
        }
      ),
      { numRuns: 200 }
    );
  });

  it('should work correctly with mixed song types', () => {
    const mixedSongs: SongView[] = [
      {
        id: 'cf-1', title: 'Creator Friendly 1', license: '',
        streamLink: 'https://example.com/cf1', albumId: 'a1', albumTitle: 'Test Album',
        releaseYear: 2024, hasContentId: false, albumArtwork: 'https://example.com/art.jpg'
      },
      {
        id: 'cf-2', title: 'Creator Friendly 2', license: 'CC BY 4.0',
        streamLink: 'https://example.com/cf2', albumId: 'a1', albumTitle: 'Test Album',
        releaseYear: 2024, hasContentId: false, albumArtwork: 'https://example.com/art.jpg'
      },
      {
        id: 'cf-3', title: 'Creator Friendly 3', license: 'BGML-P',
        streamLink: 'https://example.com/cf3', albumId: 'a1', albumTitle: 'Test Album',
        releaseYear: 2024, hasContentId: false, albumArtwork: 'https://example.com/art.jpg'
      },
      {
        id: 'ncf-1', title: 'Not Creator Friendly 1', license: 'All Rights Reserved',
        streamLink: 'https://example.com/ncf1', albumId: 'a1', albumTitle: 'Test Album',
        releaseYear: 2024, hasContentId: true, albumArtwork: 'https://example.com/art.jpg'
      }
    ];

    // cf-1 has empty license — not creator-friendly
    // cf-2 has CC BY 4.0 — creator-friendly
    // cf-3 has BGML-P — creator-friendly
    // ncf-1 has All Rights Reserved — not creator-friendly
    const creatorSongs = filterCreatorFriendly(mixedSongs);

    expect(creatorSongs).toHaveLength(2);
    const creatorIds = creatorSongs.map(s => s.id).sort();
    expect(creatorIds).toEqual(['cf-2', 'cf-3']);
  });
});
