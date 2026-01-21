/**
 * Property-based tests for DiscographyView component
 * Tests component behavior across a wide range of generated data
 * 
 * Validates Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { DiscographyView } from '../../components/DiscographyView';
import type { Album, Song } from '../../types/music';

// Create simple, fast arbitraries for property testing
const simpleSongArbitrary: fc.Arbitrary<Song> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 10 }),
  title: fc.string({ minLength: 1, maxLength: 20 }),
  albumName: fc.string({ minLength: 1, maxLength: 15 }),
  releaseType: fc.constantFrom('Independent', 'NCS', 'Monstercat'),
  hasContentId: fc.boolean(),
  streamingLink: fc.constant('https://example.com/song'),
  license: fc.oneof(fc.constant(''), fc.constant('CC BY 4.0'), fc.constant('All Rights Reserved')),
  releaseYear: fc.constant(2023)
});

const simpleAlbumArbitrary: fc.Arbitrary<Album> = fc.record({
  name: fc.string({ minLength: 1, maxLength: 15 }),
  songs: fc.array(simpleSongArbitrary, { minLength: 1, maxLength: 3 })
});

describe('DiscographyView Property Tests', () => {
  /**
   * Property 1: Component should always render without crashing
   */
  it('should always render without crashing', () => {
    fc.assert(
      fc.property(fc.array(simpleAlbumArbitrary, { minLength: 0, maxLength: 3 }), (albums) => {
        expect(() => {
          render(<DiscographyView albums={albums} />);
        }).not.toThrow();
        
        expect(screen.getByRole('main')).toBeInTheDocument();
        return true;
      }),
      { numRuns: 20 } // Limit runs for speed
    );
  });

  /**
   * Property 2: Album count should match displayed albums
   */
  it('should display correct number of album sections', () => {
    fc.assert(
      fc.property(fc.array(simpleAlbumArbitrary, { minLength: 1, maxLength: 3 }), (albums) => {
        render(<DiscographyView albums={albums} />);
        
        const albumSections = screen.getAllByRole('region');
        expect(albumSections).toHaveLength(albums.length);
        
        return true;
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 3: All songs should be displayed as articles
   */
  it('should display all songs as articles', () => {
    fc.assert(
      fc.property(fc.array(simpleAlbumArbitrary, { minLength: 1, maxLength: 2 }), (albums) => {
        render(<DiscographyView albums={albums} />);
        
        const totalSongs = albums.reduce((sum, album) => sum + album.songs.length, 0);
        const songArticles = screen.getAllByRole('article');
        expect(songArticles).toHaveLength(totalSongs);
        
        return true;
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 4: Summary should show correct totals
   */
  it('should display correct summary totals', () => {
    fc.assert(
      fc.property(fc.array(simpleAlbumArbitrary, { minLength: 1, maxLength: 3 }), (albums) => {
        render(<DiscographyView albums={albums} />);
        
        const totalSongs = albums.reduce((sum, album) => sum + album.songs.length, 0);
        const albumText = `${albums.length} album${albums.length !== 1 ? 's' : ''}`;
        const songText = `${totalSongs} song${totalSongs !== 1 ? 's' : ''}`;
        const expectedSummary = `${albumText} • ${songText}`;
        
        expect(screen.getByText(expectedSummary)).toBeInTheDocument();
        
        return true;
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 5: Content ID badges should match song data
   */
  it('should display Content ID badges correctly', () => {
    fc.assert(
      fc.property(fc.array(simpleAlbumArbitrary, { minLength: 1, maxLength: 2 }), (albums) => {
        render(<DiscographyView albums={albums} />);
        
        const songsWithContentId = albums.reduce((count, album) => {
          return count + album.songs.filter(song => song.hasContentId).length;
        }, 0);
        
        const contentIdBadges = screen.queryAllByText('Content ID');
        expect(contentIdBadges).toHaveLength(songsWithContentId);
        
        return true;
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property 6: Empty state should be handled correctly
   */
  it('should handle empty state correctly', () => {
    fc.assert(
      fc.property(fc.constant([]), (albums) => {
        render(<DiscographyView albums={albums} />);
        
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'No Albums Found' })).toBeInTheDocument();
        expect(screen.queryAllByRole('region')).toHaveLength(0);
        
        return true;
      }),
      { numRuns: 5 }
    );
  });
});
});