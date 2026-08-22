/**
 * Property-based tests for DiscographyView component
 * Validates Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { DiscographyView } from '../../components/DiscographyView';
import type { Album } from '../../types/music';

const simpleAlbumArbitrary: fc.Arbitrary<Album> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 10 }),
  title: fc.string({ minLength: 1, maxLength: 20 }),
  releaseYear: fc.constant(2024),
  streamLink: fc.constant('https://example.com/album'),
  hasContentId: fc.boolean(),
  albumArtwork: fc.constant('https://example.com/art.jpg'),
  tracks: fc.array(
    fc.record({
      id: fc.string({ minLength: 1, maxLength: 10 }),
      title: fc.string({ minLength: 1, maxLength: 20 }),
      license: fc.oneof(fc.constant(''), fc.constant('CC BY 4.0'), fc.constant('All Rights Reserved'))
    }),
    { minLength: 1, maxLength: 3 }
  )
});

describe('DiscographyView Property Tests', () => {
  it('should always render without crashing', () => {
    fc.assert(
      fc.property(fc.array(simpleAlbumArbitrary, { minLength: 0, maxLength: 3 }), (albums) => {
        cleanup();
        expect(() => {
          render(<DiscographyView albums={albums} />);
        }).not.toThrow();
        expect(screen.getByRole('main')).toBeInTheDocument();
        return true;
      }),
      { numRuns: 20 }
    );
  });

  it('should display correct number of album sections', () => {
    fc.assert(
      fc.property(fc.array(simpleAlbumArbitrary, { minLength: 1, maxLength: 3 }), (albums) => {
        cleanup();
        render(<DiscographyView albums={albums} />);
        const albumSections = screen.getAllByRole('region');
        expect(albumSections).toHaveLength(albums.length);
        return true;
      }),
      { numRuns: 20 }
    );
  });

  it('should display all tracks as articles', () => {
    fc.assert(
      fc.property(fc.array(simpleAlbumArbitrary, { minLength: 1, maxLength: 2 }), (albums) => {
        cleanup();
        render(<DiscographyView albums={albums} />);
        const totalTracks = albums.reduce((sum, a) => sum + a.tracks.length, 0);
        const trackArticles = screen.getAllByRole('article');
        expect(trackArticles).toHaveLength(totalTracks);
        return true;
      }),
      { numRuns: 20 }
    );
  });

  it('should handle empty state correctly', () => {
    fc.assert(
      fc.property(fc.constant([]), (albums) => {
        cleanup();
        render(<DiscographyView albums={albums} />);
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.queryAllByRole('region')).toHaveLength(0);
        return true;
      }),
      { numRuns: 5 }
    );
  });
});
