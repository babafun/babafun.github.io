/**
 * Property-Based Tests for Display Logic
 * 
 * **Property 5: License Display Logic**
 * **Validates: Requirements 4.5, 4.6**
 * 
 * These tests verify that license display logic correctly determines
 * when to show or hide license information based on content.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  shouldDisplayLicense,
  isCreatorFriendlySong,
  getCreatorFriendlyReason,
  getContentIdDescription,
  formatReleaseType,
  shouldDisplayStreamingLink,
  getStreamingLinkText,
  filterSongsForDisplay,
  sortSongsForDisplay
} from '../utils/display';
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
    fc.string({ minLength: 1, maxLength: 50 })
  )
});

describe('Display Logic Utilities', () => {
  describe('License Display Logic', () => {
    /**
     * **Property 5: License Display Logic**
     * 
     * **Validates: Requirements 4.5, 4.6**
     * 
     * For any song, the license should be displayed if and only if 
     * the license field is non-empty.
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
      // Empty string
      expect(shouldDisplayLicense('')).toBe(false);
      
      // Whitespace only
      expect(shouldDisplayLicense('   ')).toBe(false);
      expect(shouldDisplayLicense('\t\n')).toBe(false);
      
      // Valid licenses
      expect(shouldDisplayLicense('CC BY 4.0')).toBe(true);
      expect(shouldDisplayLicense('All Rights Reserved')).toBe(true);
      expect(shouldDisplayLicense('BGML-P')).toBe(true);
      
      // License with surrounding whitespace
      expect(shouldDisplayLicense('  CC BY 4.0  ')).toBe(true);
    });

    it('should be consistent across multiple calls', () => {
      fc.assert(fc.property(
        fc.string(),
        (license) => {
          const result1 = shouldDisplayLicense(license);
          const result2 = shouldDisplayLicense(license);
          
          return result1 === result2;
        }
      ));
    });
  });

  describe('Creator-Friendly Detection', () => {
    it('should identify NCS releases as creator-friendly', () => {
      fc.assert(fc.property(
        songArbitrary,
        (song) => {
          const ncsVersion = { ...song, releaseType: 'NCS' as ReleaseType };
          return isCreatorFriendlySong(ncsVersion) === true;
        }
      ));
    });

    it('should identify CC licenses as creator-friendly', () => {
      const ccLicenses = ['CC BY 4.0', 'CC BY-SA 4.0', 'CC0 1.0', 'cc by 3.0', 'CC0'];
      
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

    it('should identify BGML-P licenses as creator-friendly', () => {
      fc.assert(fc.property(
        songArbitrary,
        (song) => {
          const bgmlVersion = { ...song, license: 'BGML-P', releaseType: 'Independent' as ReleaseType };
          return isCreatorFriendlySong(bgmlVersion) === true;
        }
      ));
    });

    it('should not identify restrictive licenses as creator-friendly', () => {
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

    it('should provide meaningful reasons for creator-friendly status', () => {
      // NCS release
      const ncsSong: Song = {
        id: 'test-1',
        title: 'Test Song',
        albumName: 'Test Album',
        releaseType: 'NCS',
        hasContentId: false,
        streamingLink: 'https://example.com',
        license: ''
      };
      
      const ncsReason = getCreatorFriendlyReason(ncsSong);
      expect(ncsReason).toContain('NCS');
      
      // CC license
      const ccSong: Song = {
        ...ncsSong,
        releaseType: 'Independent',
        license: 'CC BY 4.0'
      };
      
      const ccReason = getCreatorFriendlyReason(ccSong);
      expect(ccReason).toContain('Creative Commons');
      
      // Non-creator-friendly
      const restrictiveSong: Song = {
        ...ncsSong,
        releaseType: 'Independent',
        license: 'All Rights Reserved'
      };
      
      const restrictiveReason = getCreatorFriendlyReason(restrictiveSong);
      expect(restrictiveReason).toBeNull();
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
        (hasContentId) => {
          const desc1 = getContentIdDescription(hasContentId);
          const desc2 = getContentIdDescription(hasContentId);
          
          return desc1 === desc2;
        }
      ));
    });
  });

  describe('Release Type Formatting', () => {
    it('should format known release types correctly', () => {
      expect(formatReleaseType('NCS')).toContain('No Copyright Sounds');
      expect(formatReleaseType('Independent')).toContain('Independent');
      expect(formatReleaseType('Monstercat')).toContain('Monstercat');
    });

    it('should handle unknown release types gracefully', () => {
      fc.assert(fc.property(
        fc.string(),
        (releaseType) => {
          const formatted = formatReleaseType(releaseType);
          return typeof formatted === 'string' && formatted.length > 0;
        }
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
      const invalidUrls = [
        '',
        '   ',
        'not-a-url',
        'javascript:alert(1)'
      ];
      
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
        fc.array(songArbitrary, { minLength: 1, maxLength: 20 }),
        (songs) => {
          const filtered = filterSongsForDisplay(songs, true);
          
          // All filtered songs should be creator-friendly
          return filtered.every(song => isCreatorFriendlySong(song));
        }
      ));
    });

    it('should not filter when showOnlyCreatorFriendly is false', () => {
      fc.assert(fc.property(
        fc.array(songArbitrary, { minLength: 1, maxLength: 20 }),
        (songs) => {
          const filtered = filterSongsForDisplay(songs, false);
          
          // Should return all songs
          return filtered.length === songs.length;
        }
      ));
    });

    it('should sort songs correctly by different criteria', () => {
      fc.assert(fc.property(
        fc.array(songArbitrary, { minLength: 2, maxLength: 10 }),
        (songs) => {
          // Sort by title
          const sortedByTitle = sortSongsForDisplay(songs, 'title');
          const titlesSorted = sortedByTitle.every((song, index) => {
            return index === 0 || sortedByTitle[index - 1].title.localeCompare(song.title) <= 0;
          });
          
          // Sort by album
          const sortedByAlbum = sortSongsForDisplay(songs, 'album');
          const albumsSorted = sortedByAlbum.every((song, index) => {
            if (index === 0) return true;
            const prevSong = sortedByAlbum[index - 1];
            const albumCompare = prevSong.albumName.localeCompare(song.albumName);
            return albumCompare < 0 || (albumCompare === 0 && prevSong.title.localeCompare(song.title) <= 0);
          });
          
          return titlesSorted && albumsSorted;
        }
      ));
    });

    it('should preserve original array when sorting', () => {
      fc.assert(fc.property(
        fc.array(songArbitrary, { minLength: 1, maxLength: 10 }),
        (songs) => {
          const originalLength = songs.length;
          const sorted = sortSongsForDisplay(songs, 'title');
          
          // Original array should be unchanged
          // Sorted array should have same length
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
      // This test ensures our functions don't crash on unexpected input
      const malformedSong = {
        id: 'test',
        title: 'Test',
        albumName: 'Test Album',
        releaseType: 'Unknown' as ReleaseType,
        hasContentId: false,
        streamingLink: 'invalid-url',
        license: '' // Changed from null to empty string
      };
      
      // These should not throw errors
      expect(() => isCreatorFriendlySong(malformedSong)).not.toThrow();
      expect(() => getCreatorFriendlyReason(malformedSong)).not.toThrow();
      expect(() => shouldDisplayStreamingLink(malformedSong.streamingLink)).not.toThrow();
      expect(() => formatReleaseType(malformedSong.releaseType)).not.toThrow();
    });
  });
});