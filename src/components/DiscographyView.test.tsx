/**
 * Unit Tests for DiscographyView Component
 * 
 * Tests comprehensive rendering functionality including:
 * - Album display with headers and metadata
 * - Song listing with all required information
 * - Empty state handling
 * - Creator-friendly badge display
 * - Accessibility features (ARIA labels, semantic HTML)
 * - Content ID and license display logic
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiscographyView } from './DiscographyView';
import type { Album, Song } from '../types/music';

// Test data fixtures
const createTestSong = (overrides: Partial<Song> = {}): Song => ({
  id: 'test-song-1',
  title: 'Test Song',
  albumName: 'Test Album',
  releaseType: 'Independent',
  hasContentId: false,
  streamingLink: 'https://example.com/song',
  license: 'CC BY 4.0',
  releaseYear: 2023,
  albumArtwork: 'https://example.com/artwork.jpg',
  ...overrides
});

const createTestAlbum = (overrides: Partial<Album> = {}): Album => ({
  name: 'Test Album',
  songs: [createTestSong()],
  ...overrides
});

describe('DiscographyView', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing with valid album data', () => {
      const albums = [createTestAlbum()];
      
      render(<DiscographyView albums={albums} />);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Test Album')).toBeInTheDocument();
      expect(screen.getByText('Test Song')).toBeInTheDocument();
    });

    it('renders main element with correct role and class', () => {
      const albums = [createTestAlbum()];
      
      render(<DiscographyView albums={albums} />);
      
      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveClass('discography-view');
    });

    it('includes screen reader only heading', () => {
      const albums = [createTestAlbum()];
      
      render(<DiscographyView albums={albums} />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Discography');
      expect(heading).toHaveClass('sr-only');
    });
  });

  describe('Empty State Handling', () => {
    it('displays empty state when no albums provided', () => {
      render(<DiscographyView albums={[]} />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('No Albums Found')).toBeInTheDocument();
      expect(screen.getByText('There are no albums to display in the discography.')).toBeInTheDocument();
    });

    it('displays empty state when albums array is undefined', () => {
      render(<DiscographyView albums={undefined as any} />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('No Albums Found')).toBeInTheDocument();
    });

    it('empty state has proper accessibility attributes', () => {
      render(<DiscographyView albums={[]} />);
      
      const emptyState = screen.getByRole('status');
      expect(emptyState).toHaveAttribute('aria-live', 'polite');
      expect(emptyState).toHaveClass('empty-state', 'text-center');
    });
  });

  describe('Album Display', () => {
    it('displays album name as heading', () => {
      const albums = [createTestAlbum({ name: 'Synthwave Chronicles' })];
      
      render(<DiscographyView albums={albums} />);
      
      const albumHeading = screen.getByRole('heading', { level: 2 });
      expect(albumHeading).toHaveTextContent('Synthwave Chronicles');
      expect(albumHeading).toHaveClass('album-header');
    });

    it('displays correct song count for single song', () => {
      const albums = [createTestAlbum({
        name: 'Single Song Album',
        songs: [createTestSong()]
      })];
      
      render(<DiscographyView albums={albums} />);
      
      expect(screen.getByText('1 song')).toBeInTheDocument();
    });

    it('displays correct song count for multiple songs', () => {
      const albums = [createTestAlbum({
        name: 'Multi Song Album',
        songs: [
          createTestSong({ id: 'song-1', title: 'Song One' }),
          createTestSong({ id: 'song-2', title: 'Song Two' }),
          createTestSong({ id: 'song-3', title: 'Song Three' })
        ]
      })];
      
      render(<DiscographyView albums={albums} />);
      
      expect(screen.getByText('3 songs')).toBeInTheDocument();
    });

    it('creates proper album section with accessibility attributes', () => {
      const albums = [createTestAlbum({ name: 'Test Album Name' })];
      
      render(<DiscographyView albums={albums} />);
      
      const albumSection = screen.getByRole('region');
      expect(albumSection).toHaveClass('album-section');
      expect(albumSection).toHaveAttribute('aria-labelledby', 'album-test-album-name');
      
      const albumHeading = screen.getByRole('heading', { level: 2 });
      expect(albumHeading).toHaveAttribute('id', 'album-test-album-name');
    });

    it('handles album names with special characters in ID generation', () => {
      const albums = [createTestAlbum({ name: 'Album With Spaces & Special!' })];
      
      render(<DiscographyView albums={albums} />);
      
      const albumSection = screen.getByRole('region');
      expect(albumSection).toHaveAttribute('aria-labelledby', 'album-album-with-spaces-&-special!');
    });
  });

  describe('Multiple Albums Display', () => {
    it('displays multiple albums correctly', () => {
      const albums = [
        createTestAlbum({ 
          name: 'First Album',
          songs: [createTestSong({ id: 'song-1', title: 'First Song', albumName: 'First Album' })]
        }),
        createTestAlbum({ 
          name: 'Second Album',
          songs: [createTestSong({ id: 'song-2', title: 'Second Song', albumName: 'Second Album' })]
        })
      ];
      
      render(<DiscographyView albums={albums} />);
      
      expect(screen.getByText('First Album')).toBeInTheDocument();
      expect(screen.getByText('Second Album')).toBeInTheDocument();
      expect(screen.getByText('First Song')).toBeInTheDocument();
      expect(screen.getByText('Second Song')).toBeInTheDocument();
    });

    it('displays correct total counts in header', () => {
      const albums = [
        createTestAlbum({ 
          name: 'Album One',
          songs: [
            createTestSong({ id: 'song-1', title: 'Song 1' }),
            createTestSong({ id: 'song-2', title: 'Song 2' })
          ]
        }),
        createTestAlbum({ 
          name: 'Album Two',
          songs: [createTestSong({ id: 'song-3', title: 'Song 3' })]
        })
      ];
      
      render(<DiscographyView albums={albums} />);
      
      expect(screen.getByText('2 albums • 3 songs')).toBeInTheDocument();
    });

    it('handles singular/plural correctly in totals', () => {
      const singleAlbumSingleSong = [createTestAlbum({
        name: 'Solo Album',
        songs: [createTestSong()]
      })];
      
      render(<DiscographyView albums={singleAlbumSingleSong} />);
      expect(screen.getByText('1 album • 1 song')).toBeInTheDocument();
    });
  });

  describe('Song Item Display', () => {
    it('displays song title as heading', () => {
      const albums = [createTestAlbum({
        songs: [createTestSong({ title: 'Amazing Song Title' })]
      })];
      
      render(<DiscographyView albums={albums} />);
      
      const songHeading = screen.getByRole('heading', { level: 4 });
      expect(songHeading).toHaveTextContent('Amazing Song Title');
    });

    it('displays song as article with proper role', () => {
      const albums = [createTestAlbum()];
      
      render(<DiscographyView albums={albums} />);
      
      const songArticle = screen.getByRole('article');
      expect(songArticle).toHaveClass('song-card');
    });

    it('displays release type badge', () => {
      const albums = [createTestAlbum({
        songs: [createTestSong({ releaseType: 'NCS' })]
      })];
      
      render(<DiscographyView albums={albums} />);
      
      const badges = screen.getAllByText('NCS');
      const badge = badges.find(el => el.classList.contains('badge'));
      expect(badge).toHaveClass('badge', 'ncs');
    });

    it('displays release type in song details', () => {
      const albums = [createTestAlbum({
        songs: [createTestSong({ releaseType: 'Monstercat' })]
      })];
      
      render(<DiscographyView albums={albums} />);
      
      expect(screen.getByText(/Release:/)).toBeInTheDocument();
      const releaseElements = screen.getAllByText('Monstercat');
      const releaseDetail = releaseElements.find(el => 
        el.closest('.song-details') !== null
      );
      expect(releaseDetail).toBeInTheDocument();
    });
  });

  describe('Content ID Display', () => {
    it('displays Content ID badge when enabled', () => {
      const albums = [createTestAlbum({
        songs: [createTestSong({ hasContentId: true })]
      })];
      
      render(<DiscographyView albums={albums} />);
      
      const contentIdBadge = screen.getByText('Content ID');
      expect(contentIdBadge).toHaveClass('badge', 'content-id');
      expect(contentIdBadge).toHaveAttribute('title', 'This song has YouTube Content ID enabled');
    });

    it('does not display Content ID badge when disabled', () => {
      const albums = [createTestAlbum({
        songs: [createTestSong({ hasContentId: false })]
      })];
      
      render(<DiscographyView albums={albums} />);
      
      expect(screen.queryByText('Content ID')).not.toBeInTheDocument();
    });

    it('displays Content ID status in song details when enabled', () => {
      const albums = [createTestAlbum({
        songs: [createTestSong({ hasContentId: true })]
      })];
      
      render(<DiscographyView albums={albums} />);
      
      expect(screen.getByText(/Content ID Enabled/)).toBeInTheDocument();
    });

    it('does not display Content ID status when disabled', () => {
      const albums = [createTestAlbum({
        songs: [createTestSong({ hasContentId: false })]
      })];
      
      render(<DiscographyView albums={albums} />);
      
      expect(screen.queryByText(/Content ID Enabled/)).not.toBeInTheDocument();
    });
  });

  describe('License Display', () => {
    it('displays license when present', () => {
      const albums = [createTestAlbum({
        songs: [createTestSong({ license: 'CC BY 4.0' })]
      })];
      
      render(<DiscographyView albums={albums} />);
      
      expect(screen.getByText(/License:/)).toBeInTheDocument();
      expect(screen.getByText('CC BY 4.0')).toBeInTheDocument();
    });

    it('does not display license section when empty', () => {
      const albums = [createTestAlbum({
        songs: [createTestSong({ license: '' })]
      })];
      
      render(<DiscographyView albums={albums} />);
      
      expect(screen.queryByText(/License:/)).not.toBeInTheDocument();
    });

    it('handles various license types', () => {
      const licenseTypes = ['CC BY 4.0', 'CC BY-SA 4.0', 'CC0 1.0', 'BGML-P', 'All Rights Reserved'];
      
      licenseTypes.forEach(license => {
        const albums = [createTestAlbum({
          songs: [createTestSong({ license, id: `song-${license}` })]
        })];
        
        const { unmount } = render(<DiscographyView albums={albums} />);
        
        expect(screen.getByText(license)).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Creator-Friendly Badge Display', () => {
    it('displays creator-friendly badge for NCS releases', () => {
      const albums = [createTestAlbum({
        songs: [createTestSong({ releaseType: 'NCS', license: '' })]
      })];
      
      render(<DiscographyView albums={albums} />);
      
      const badge = screen.getByText('Creator Friendly');
      expect(badge).toHaveClass('badge', 'creator-friendly');
      expect(badge).toHaveAttribute('title', 'This song is free for creators to use');
    });

    it('displays creator-friendly badge for CC licenses', () => {
      const ccLicenses = ['CC BY 4.0', 'CC BY-SA 4.0', 'CC0 1.0'];
      
      ccLicenses.forEach(license => {
        const albums = [createTestAlbum({
          songs: [createTestSong({ releaseType: 'Independent', license, id: `song-${license}` })]
        })];
        
        const { unmount } = render(<DiscographyView albums={albums} />);
        
        const badge = screen.getByText('Creator Friendly');
        expect(badge).toHaveClass('badge', 'creator-friendly');
        
        unmount();
      });
    });

    it('displays creator-friendly badge for BGML-P license', () => {
      const albums = [createTestAlbum({
        songs: [createTestSong({ releaseType: 'Independent', license: 'BGML-P' })]
      })];
      
      render(<DiscographyView albums={albums} />);
      
      const badge = screen.getByText('Creator Friendly');
      expect(badge).toHaveClass('badge', 'creator-friendly');
    });

    it('does not display creator-friendly badge for restrictive licenses', () => {
      const albums = [createTestAlbum({
        songs: [createTestSong({ 
          releaseType: 'Independent', 
          license: 'All Rights Reserved' 
        })]
      })];
      
      render(<DiscographyView albums={albums} />);
      
      expect(screen.queryByText('Creator Friendly')).not.toBeInTheDocument();
    });

    it('handles case-insensitive license matching', () => {
      const albums = [createTestAlbum({
        songs: [createTestSong({ 
          releaseType: 'Independent', 
          license: 'cc by 4.0' // lowercase
        })]
      })];
      
      render(<DiscographyView albums={albums} />);
      
      expect(screen.getByText('Creator Friendly')).toBeInTheDocument();
    });
  });

  describe('Streaming Links', () => {
    it('displays streaming link with proper attributes', () => {
      const albums = [createTestAlbum({
        songs: [createTestSong({ 
          title: 'Test Song',
          streamingLink: 'https://spotify.com/track/123' 
        })]
      })];
      
      render(<DiscographyView albums={albums} />);
      
      const link = screen.getByRole('link', { name: /Listen to Test Song on streaming platform/ });
      expect(link).toHaveAttribute('href', 'https://spotify.com/track/123');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveClass('streaming-link');
      expect(link).toHaveTextContent('Listen Now');
    });

    it('provides descriptive aria-label for streaming links', () => {
      const albums = [createTestAlbum({
        songs: [createTestSong({ 
          title: 'Amazing Track',
          streamingLink: 'https://example.com/track' 
        })]
      })];
      
      render(<DiscographyView albums={albums} />);
      
      const link = screen.getByLabelText('Listen to Amazing Track on streaming platform');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Complex Scenarios', () => {
    it('handles album with mixed song types', () => {
      const albums = [createTestAlbum({
        name: 'Mixed Album',
        songs: [
          createTestSong({ 
            id: 'song-1', 
            title: 'NCS Song', 
            releaseType: 'NCS',
            license: '',
            hasContentId: false
          }),
          createTestSong({ 
            id: 'song-2', 
            title: 'Licensed Song', 
            releaseType: 'Independent',
            license: 'CC BY 4.0',
            hasContentId: true
          }),
          createTestSong({ 
            id: 'song-3', 
            title: 'Restricted Song', 
            releaseType: 'Monstercat',
            license: 'All Rights Reserved',
            hasContentId: true
          })
        ]
      })];
      
      render(<DiscographyView albums={albums} />);
      
      // Check all songs are displayed
      expect(screen.getByText('NCS Song')).toBeInTheDocument();
      expect(screen.getByText('Licensed Song')).toBeInTheDocument();
      expect(screen.getByText('Restricted Song')).toBeInTheDocument();
      
      // Check creator-friendly badges
      const creatorBadges = screen.getAllByText('Creator Friendly');
      expect(creatorBadges).toHaveLength(2); // NCS and CC BY songs
      
      // Check Content ID badges
      const contentIdBadges = screen.getAllByText('Content ID');
      expect(contentIdBadges).toHaveLength(2); // Licensed and Restricted songs
      
      // Check license display
      expect(screen.getByText('CC BY 4.0')).toBeInTheDocument();
      expect(screen.getByText('All Rights Reserved')).toBeInTheDocument();
      // Empty license should not be displayed
      expect(screen.getAllByText(/License:/).length).toBe(2);
    });

    it('handles large number of albums and songs', () => {
      const albums = Array.from({ length: 5 }, (_, albumIndex) => 
        createTestAlbum({
          name: `Album ${albumIndex + 1}`,
          songs: Array.from({ length: 4 }, (_, songIndex) =>
            createTestSong({
              id: `song-${albumIndex}-${songIndex}`,
              title: `Song ${songIndex + 1}`,
              albumName: `Album ${albumIndex + 1}`
            })
          )
        })
      );
      
      render(<DiscographyView albums={albums} />);
      
      // Check totals
      expect(screen.getByText('5 albums • 20 songs')).toBeInTheDocument();
      
      // Check all albums are displayed
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByText(`Album ${i}`)).toBeInTheDocument();
      }
      
      // Check song counts for each album
      const songCounts = screen.getAllByText('4 songs');
      expect(songCounts).toHaveLength(5);
    });
  });

  describe('Accessibility Features', () => {
    it('uses proper heading hierarchy', () => {
      const albums = [
        createTestAlbum({ name: 'First Album' }),
        createTestAlbum({ name: 'Second Album' })
      ];
      
      render(<DiscographyView albums={albums} />);
      
      // Main heading (h1) - screen reader only
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Discography');
      
      // Album headings (h2)
      const albumHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(albumHeadings).toHaveLength(2);
      expect(albumHeadings[0]).toHaveTextContent('First Album');
      expect(albumHeadings[1]).toHaveTextContent('Second Album');
      
      // Song headings (h4)
      const songHeadings = screen.getAllByRole('heading', { level: 4 });
      expect(songHeadings).toHaveLength(2);
    });

    it('provides proper ARIA labels and roles', () => {
      const albums = [createTestAlbum({ name: 'Accessible Album' })];
      
      render(<DiscographyView albums={albums} />);
      
      // Main element
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      
      // Album region
      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-labelledby', 'album-accessible-album');
      
      // Song article
      const article = screen.getByRole('article');
      expect(article).toBeInTheDocument();
    });

    it('provides meaningful titles for interactive elements', () => {
      const albums = [createTestAlbum({
        songs: [createTestSong({ 
          hasContentId: true,
          releaseType: 'NCS'
        })]
      })];
      
      render(<DiscographyView albums={albums} />);
      
      const contentIdBadge = screen.getByText('Content ID');
      expect(contentIdBadge).toHaveAttribute('title', 'This song has YouTube Content ID enabled');
      
      const creatorBadge = screen.getByText('Creator Friendly');
      expect(creatorBadge).toHaveAttribute('title', 'This song is free for creators to use');
    });
  });

  describe('Edge Cases', () => {
    it('handles album with no songs gracefully', () => {
      const albums = [createTestAlbum({ 
        name: 'Empty Album',
        songs: [] 
      })];
      
      render(<DiscographyView albums={albums} />);
      
      expect(screen.getByText('Empty Album')).toBeInTheDocument();
      expect(screen.getByText('0 songs')).toBeInTheDocument();
    });

    it('handles songs with minimal data', () => {
      const minimalSong: Song = {
        id: 'minimal',
        title: 'Minimal Song',
        albumName: 'Minimal Album',
        releaseType: 'Independent',
        hasContentId: false,
        streamingLink: 'https://example.com',
        license: '',
        releaseYear: 2023
      };
      
      const albums = [{ name: 'Minimal Album', songs: [minimalSong] }];
      
      render(<DiscographyView albums={albums} />);
      
      expect(screen.getByText('Minimal Song')).toBeInTheDocument();
      const independentElements = screen.getAllByText('Independent');
      expect(independentElements.length).toBeGreaterThan(0);
      expect(screen.queryByText(/License:/)).not.toBeInTheDocument();
      expect(screen.queryByText('Content ID')).not.toBeInTheDocument();
    });

    it('handles very long song and album names', () => {
      const longTitle = 'This Is A Very Long Song Title That Might Cause Layout Issues If Not Handled Properly';
      const longAlbumName = 'This Is A Very Long Album Name That Should Still Display Correctly';
      
      const albums = [createTestAlbum({
        name: longAlbumName,
        songs: [createTestSong({ title: longTitle, albumName: longAlbumName })]
      })];
      
      render(<DiscographyView albums={albums} />);
      
      expect(screen.getByText(longTitle)).toBeInTheDocument();
      expect(screen.getByText(longAlbumName)).toBeInTheDocument();
    });

    it('handles special characters in song and album names', () => {
      const specialTitle = 'Song with "Quotes" & Symbols! (Remix) [2024]';
      const specialAlbum = 'Album with émojis 🎵 and ñ characters';
      
      const albums = [createTestAlbum({
        name: specialAlbum,
        songs: [createTestSong({ title: specialTitle, albumName: specialAlbum })]
      })];
      
      render(<DiscographyView albums={albums} />);
      
      expect(screen.getByText(specialTitle)).toBeInTheDocument();
      expect(screen.getByText(specialAlbum)).toBeInTheDocument();
    });
  });
});