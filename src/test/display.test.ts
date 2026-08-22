/**
 * Property-Based Tests for Display Logic
 *
 * **Property 5: License Display Logic**
 * **Validates: Requirements 4.5, 4.6**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  shouldDisplayLicense,
  isCreatorFriendlySong,
  getCreatorFriendlyReason,
  getContentIdDescription,
  shouldDisplayStreamingLink,
  getStreamingLinkText,
  filterSongsForDisplay,
  sortSongsForDisplay
} from '../utils/display';
import type { SongView } from '../types/music';

// Local SongView arbitrary
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
    fc.string({ minLength: 1, maxLength: 50 })
  ),
  streamLink: fc.webUrl(),
  albumId: fc.string({ minLength: 1, maxLength: 20 }),
  albumTitle: fc.string({ minLength: 1, maxLength: 100 }),
  releaseYear: fc.integer({ min: 2020, max: 2024 }),
  hasContentId: fc.boolean(),
  albumArtwork: fc.webUrl()
});

describe('Display Logic Utilities', () => {
  describe('License Display Logic', () => {
    /**
     * **Property 5: License Display Logic**
     * **Validates: Requirements 4.5, 4.6**
     *
     * For any song, the license should be displayed iff the license field is non-empty.
     */
    it('Property 5: License displayed only when non-empty', () => {
      fc.assert(fc.property(
        fc.string(),
        (license) => {
          const shouldDisplay = shouldDisplayLicense(license);
          const hasLicense = license.trim() !== '';
          return shouldDisplay === hasLicense;
        }
      ));
    });

    it('should handle edge cases in license strings', () => {
      expect(shouldDisplayLicense('')).toBe(false);
      expect(shouldDisplayLicense('   ')).toBe(false);
      expect(shouldDisplayLicense('\t\n')).toBe(false);
      expect(shouldDisplayLicense('CC BY 4.0')).toBe(true);
      expect(shouldDisplayLicense('All Rights Reserved')).toBe(true);
      expect(shouldDisplayLicense('BGML-P')).toBe(true);
      expect(shouldDisplayLicense('  CC BY 4.0  ')).toBe(true);
    });

    it('should be consistent across multiple calls', () => {
      fc.assert(fc.property(
        fc.string(),
        (license) => shouldDisplayLicense(license) === shouldDisplayLicense(license)
      ));
    });
  });

  describe('Creator-Friendly Detection', () => {
    it('should identify CC licenses as creator-friendly', () => {
      const ccLicenses = ['CC BY 4.0', 'CC BY-SA 4.0', 'CC0 1.0', 'cc by 3.0', 'CC0'];

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

    it('should identify BGML-P licenses as creator-friendly', () => {
      fc.assert(fc.property(
        songViewArbitrary,
        (song) => {
          const bgmlVersion = { ...song, license: 'BGML-P' };
          return isCreatorFriendlySong(bgmlVersion) === true;
        }
      ));
    });

    it('should not identify restrictive licenses as creator-friendly', () => {
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

    it('should provide meaningful reasons for creator-friendly status', () => {
      const ccSong: SongView = {
        id: 'test-1', title: 'Test Song', license: 'CC BY 4.0',
        streamLink: 'https://example.com', albumId: 'a1', albumTitle: 'Test Album',
        releaseYear: 2024, hasContentId: false, albumArtwork: 'https://example.com/art.jpg'
      };

      const ccReason = getCreatorFriendlyReason(ccSong);
      expect(ccReason).toContain('Creative Commons');

      const restrictiveSong: SongView = {
        ...ccSong, license: 'All Rights Reserved'
      };
      expect(getCreatorFriendlyReason(restrictiveSong)).toBeNull();
    });
  });

  describe('Content ID Description', () => {
    it('should provide appropriate descriptions for Content ID status', () => {
      const enabledDescription = getContentIdDescription(true);
      expect(enabledDescription).toContain('Content ID enabled');
      expect(enabledDescription).toContain('claim revenue');

      const disabledDescription = getContentIdDescription(false);
      expect(disabledDescription).toContain('does not have');
      expect(disabledDescription).toContain('safe');
    });

    it('should be consistent for same input', () => {
      fc.assert(fc.property(
        fc.boolean(),
        (hasContentId) => getContentIdDescription(hasContentId) === getContentIdDescription(hasContentId)
      ));
    });
  });

  describe('Streaming Link Validation', () => {
    it('should validate proper URLs', () => {
      const validUrls = [
        'https://example.com',
        'https://spotify.com/track/123',
        'https://youtube.com/watch?v=123',
        'https://soundcloud.com/artist/track'
      ];

      validUrls.forEach(url => {
        expect(shouldDisplayStreamingLink(url)).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = ['', '   ', 'not-a-url', 'javascript:alert(1)'];

      invalidUrls.forEach(url => {
        expect(shouldDisplayStreamingLink(url)).toBe(false);
      });
    });

    it('should provide platform-specific link text', () => {
      const platformTests = [
        { url: 'https://spotify.com/track/123', expected: 'Spotify' },
        { url: 'https://youtube.com/watch?v=123', expected: 'YouTube' },
        { url: 'https://soundcloud.com/artist/track', expected: 'SoundCloud' },
        { url: 'https://ncs.io/track', expected: 'NCS' },
        { url: 'https://monstercat.com/release/123', expected: 'Monstercat' },
        { url: 'https://unknown-platform.com', expected: 'Listen Now' }
      ];

      platformTests.forEach(({ url, expected }) => {
        const linkText = getStreamingLinkText(url);
        expect(linkText).toContain(expected);
      });
    });
  });

  describe('Song Filtering and Sorting', () => {
    it('should filter creator-friendly songs correctly', () => {
      fc.assert(fc.property(
        fc.array(songViewArbitrary, { minLength: 1, maxLength: 20 }),
        (songs) => {
          const filtered = filterSongsForDisplay(songs, true);
          return filtered.every(song => isCreatorFriendlySong(song));
        }
      ));
    });

    it('should not filter when showOnlyCreatorFriendly is false', () => {
      fc.assert(fc.property(
        fc.array(songViewArbitrary, { minLength: 1, maxLength: 20 }),
        (songs) => filterSongsForDisplay(songs, false).length === songs.length
      ));
    });

    it('should sort songs correctly by title', () => {
      fc.assert(fc.property(
        fc.array(songViewArbitrary, { minLength: 2, maxLength: 10 }),
        (songs) => {
          const sortedByTitle = sortSongsForDisplay(songs, 'title');
          return sortedByTitle.every((song, index) =>
            index === 0 || sortedByTitle[index - 1].title.localeCompare(song.title) <= 0
          );
        }
      ));
    });

    it('should preserve original array when sorting', () => {
      fc.assert(fc.property(
        fc.array(songViewArbitrary, { minLength: 1, maxLength: 10 }),
        (songs) => {
          const originalLength = songs.length;
          const sorted = sortSongsForDisplay(songs, 'title');
          return songs.length === originalLength && sorted.length === originalLength;
        }
      ));
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty arrays gracefully', () => {
      expect(filterSongsForDisplay([], true)).toEqual([]);
      expect(filterSongsForDisplay([], false)).toEqual([]);
      expect(sortSongsForDisplay([], 'title')).toEqual([]);
    });

    it('should handle malformed song objects gracefully', () => {
      const malformedSong = {
        id: 'test', title: 'Test', license: '',
        streamLink: 'invalid-url', albumId: 'a1', albumTitle: 'Test Album',
        releaseYear: 2024, hasContentId: false, albumArtwork: 'https://example.com/art.jpg'
      } as SongView;

      expect(() => isCreatorFriendlySong(malformedSong)).not.toThrow();
      expect(() => getCreatorFriendlyReason(malformedSong)).not.toThrow();
      expect(() => shouldDisplayStreamingLink(malformedSong.streamLink)).not.toThrow();
    });
  });
});
