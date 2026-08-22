/**
 * Property-based tests for album/track validation
 *
 * **Property 1: Album Data Validation**
 * **Validates: Requirements 2.2, 2.3, 2.4, 2.5**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { albumArbitrary } from '../../test/arbitraries';
import type { Album } from '../types/music';

/**
 * JavaScript fallback for album validation
 */
function validateAlbumJS(obj: any): string {
  if (!obj || typeof obj !== 'object') return 'Album must be an object';

  const required = ['id', 'title', 'releaseYear', 'streamLink', 'hasContentId', 'albumArtwork', 'tracks'];
  for (const field of required) {
    if (!(field in obj)) return `Missing required field: ${field}`;
  }

  if (typeof obj.id !== 'string') return 'id must be a string';
  if (typeof obj.title !== 'string') return 'title must be a string';
  if (typeof obj.releaseYear !== 'number') return 'releaseYear must be a number';
  if (typeof obj.streamLink !== 'string') return 'streamLink must be a string';
  if (typeof obj.hasContentId !== 'boolean') return 'hasContentId must be a boolean';
  if (typeof obj.albumArtwork !== 'string') return 'albumArtwork must be a string';
  if (!Array.isArray(obj.tracks)) return 'tracks must be an array';

  for (let i = 0; i < obj.tracks.length; i++) {
    const track = obj.tracks[i];
    if (!track || typeof track !== 'object') return `Track ${i}: must be an object`;
    if (typeof track.id !== 'string') return `Track ${i}: id must be a string`;
    if (typeof track.title !== 'string') return `Track ${i}: title must be a string`;
    if (typeof track.license !== 'string') return `Track ${i}: license must be a string`;
  }

  return '';
}

describe('Property 1: Album Data Validation', () => {
  /**
   * **Validates: Requirements 2.2, 2.3, 2.4, 2.5**
   *
   * For any object claiming to be an Album, the validation function should accept
   * it if and only if it contains all required fields with correct types.
   */
  it('should accept valid albums and reject invalid ones', () => {
    fc.assert(
      fc.property(fc.anything(), (obj: any) => {
        const validationResult = validateAlbumJS(obj);
        const isValid = validationResult === '';

        const hasAllFields =
          typeof obj === 'object' &&
          obj !== null &&
          typeof obj.id === 'string' &&
          typeof obj.title === 'string' &&
          typeof obj.releaseYear === 'number' &&
          typeof obj.streamLink === 'string' &&
          typeof obj.hasContentId === 'boolean' &&
          typeof obj.albumArtwork === 'string' &&
          Array.isArray(obj.tracks);

        return isValid === hasAllFields;
      }),
      { numRuns: 1000 }
    );
  });

  it('should always accept properly generated albums', () => {
    fc.assert(
      fc.property(albumArbitrary, (album: Album) => {
        const validationResult = validateAlbumJS(album);
        expect(validationResult).toBe('');
        return true;
      }),
      { numRuns: 500 }
    );
  });

  it('should reject albums with missing required fields', () => {
    fc.assert(
      fc.property(albumArbitrary, (album: Album) => {
        const requiredFields = ['id', 'title', 'releaseYear', 'streamLink', 'hasContentId', 'albumArtwork', 'tracks'];

        for (const fieldToRemove of requiredFields) {
          const incompleteObj = { ...album };
          delete (incompleteObj as any)[fieldToRemove];

          const validationResult = validateAlbumJS(incompleteObj);
          expect(validationResult).not.toBe('');
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should reject albums with incorrect field types', () => {
    fc.assert(
      fc.property(albumArbitrary, (album: Album) => {
        const wrongTypes = [
          { ...album, id: 123 },
          { ...album, title: null },
          { ...album, releaseYear: '2024' },
          { ...album, streamLink: 42 },
          { ...album, hasContentId: 'true' },
          { ...album, albumArtwork: [] },
          { ...album, tracks: 'not-an-array' }
        ];

        for (const wrongObj of wrongTypes) {
          const validationResult = validateAlbumJS(wrongObj);
          expect(validationResult).not.toBe('');
        }

        return true;
      }),
      { numRuns: 50 }
    );
  });

  it('should reject invalid JSON strings', () => {
    const invalidInputs = [null, undefined, 'string', 42, true, []];

    for (const input of invalidInputs) {
      const validationResult = validateAlbumJS(input);
      expect(validationResult).not.toBe('');
    }
  });

  it('should validate track fields within albums', () => {
    const albumWithBadTrack: any = {
      id: 'test-album',
      title: 'Test Album',
      releaseYear: 2024,
      streamLink: 'https://example.com',
      hasContentId: false,
      albumArtwork: 'https://example.com/art.jpg',
      tracks: [
        { id: 123, title: 'Bad Track', license: '' } // id should be string
      ]
    };

    const result = validateAlbumJS(albumWithBadTrack);
    expect(result).not.toBe('');
    expect(result).toContain('Track 0');
  });
});
