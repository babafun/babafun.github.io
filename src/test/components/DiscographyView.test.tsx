/**
 * Unit tests for DiscographyView component
 * Tests album display and song listing functionality
 * 
 * Validates Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { DiscographyView } from '../../components/DiscographyView';
import type { Album, Song } from '../../types/music';

// Test data
const mockSongs: Song[] = [
  {
    id: 'song-001',
    title: 'Digital Dreams',
    albumName: 'Synthwave Chronicles',
    releaseType: 'Independent',
    hasContentId: false,
    streamingLink: 'https://push.fm/digital-dreams',
    license: 'CC BY 4.0',
    releaseYear: 2023,
    albumArtwork: 'https://example.com/artwork1.jpg'
  },
  {
    id: 'song-002',
    title: 'Neon Nights',
    albumName: 'Synthwave Chronicles',
    releaseType: 'Independent',
    hasContentId: true,
    streamingLink: 'https://push.fm/neon-nights',
    license: 'All Rights Reserved',
    releaseYear: 2023,
    albumArtwork: 'https://example.com/artwork1.jpg'
  },
  {
    id: 'song-003',
    title: 'Electric Pulse',
    albumName: 'Electronic Fusion',
    releaseType: 'NCS',
    hasContentId: false,
    streamingLink: 'https://ncs.io/electric-pulse',
    license: '',
    releaseYear: 2024,
    albumArtwork: 'https://example.com/artwork2.jpg'
  },
  {
    id: 'song-004',
    title: 'Bass Drop Revolution',
    albumName: 'Electronic Fusion',
    releaseType: 'NCS',
    hasContentId: false,
    streamingLink: 'https://ncs.io/bass-drop-revolution',
    license: '',
    releaseYear: 2024,
    albumArtwork: 'https://example.com/artwork2.jpg'
  },
  {
    id: 'song-005',
    title: 'Ambient Journey',
    albumName: 'Atmospheric Sounds',
    releaseType: 'Independent',
    hasContentId: false,
    streamingLink: 'https://push.fm/ambient-journey',
    license: 'BGML-P',
    releaseYear: 2022,
    albumArtwork: 'https://example.com/artwork3.jpg'
  }
];

const mockAlbums: Album[] = [
  {
    name: 'Synthwave Chronicles',
    songs: [mockSongs[0], mockSongs[1]]
  },
  {
    name: 'Electronic Fusion',
    songs: [mockSongs[2], mockSongs[3]]
  },
  {
    name: 'Atmospheric Sounds',
    songs: [mockSongs[4]]
  }
];

describe('DiscographyView', () => {
  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(<DiscographyView albums={mockAlbums} />);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should have proper semantic structure', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      // Main container should have role="main"
      expect(screen.getByRole('main')).toHaveClass('discography-view');
      
      // Should have album sections with proper roles
      const albumSections = screen.getAllByRole('region');
      expect(albumSections).toHaveLength(3);
      
      // Each album section should have proper aria-labelledby
      albumSections.forEach((section, index) => {
        const albumName = mockAlbums[index].name;
        const expectedId = `album-${albumName.replace(/\s+/g, '-').toLowerCase()}`;
        expect(section).toHaveAttribute('aria-labelledby', expectedId);
      });
    });

    it('should display summary information in header', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      // Should show album and song counts
      expect(screen.getByText('3 albums • 5 songs')).toBeInTheDocument();
    });

    it('should handle singular vs plural correctly in summary', () => {
      const singleAlbum: Album[] = [{
        name: 'Single Album',
        songs: [mockSongs[0]]
      }];
      
      render(<DiscographyView albums={singleAlbum} />);
      expect(screen.getByText('1 album • 1 song')).toBeInTheDocument();
    });
  });

  describe('Album Display', () => {
    it('should display all albums', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      // Check that all album names are displayed as headings
      expect(screen.getByRole('heading', { name: 'Synthwave Chronicles' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Electronic Fusion' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Atmospheric Sounds' })).toBeInTheDocument();
    });

    it('should display album headers with correct IDs', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      // Check that album headers have correct IDs for accessibility
      expect(screen.getByRole('heading', { name: 'Synthwave Chronicles' }))
        .toHaveAttribute('id', 'album-synthwave-chronicles');
      expect(screen.getByRole('heading', { name: 'Electronic Fusion' }))
        .toHaveAttribute('id', 'album-electronic-fusion');
      expect(screen.getByRole('heading', { name: 'Atmospheric Sounds' }))
        .toHaveAttribute('id', 'album-atmospheric-sounds');
    });

    it('should display song count for each album', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      // Find album sections and check song counts
      const synthwaveSection = screen.getByLabelText('Synthwave Chronicles');
      expect(within(synthwaveSection).getByText('2 songs')).toBeInTheDocument();
      
      const fusionSection = screen.getByLabelText('Electronic Fusion');
      expect(within(fusionSection).getByText('2 songs')).toBeInTheDocument();
      
      const atmosphericSection = screen.getByLabelText('Atmospheric Sounds');
      expect(within(atmosphericSection).getByText('1 song')).toBeInTheDocument();
    });

    it('should handle album names with special characters', () => {
      const specialAlbum: Album[] = [{
        name: 'Test Album: Special & Characters!',
        songs: [mockSongs[0]]
      }];
      
      render(<DiscographyView albums={specialAlbum} />);
      
      // Should display the name correctly
      expect(screen.getByRole('heading', { name: 'Test Album: Special & Characters!' })).toBeInTheDocument();
      
      // Should generate an ID (spaces replaced with dashes, converted to lowercase)
      // The actual implementation only replaces spaces and converts to lowercase
      expect(screen.getByRole('heading', { name: 'Test Album: Special & Characters!' }))
        .toHaveAttribute('id', 'album-test-album:-special-&-characters!');
    });
  });

  describe('Song Listing', () => {
    it('should display all songs within their albums', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      // Check that all song titles are displayed
      expect(screen.getByRole('heading', { name: 'Digital Dreams' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Neon Nights' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Electric Pulse' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Bass Drop Revolution' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Ambient Journey' })).toBeInTheDocument();
    });

    it('should display songs in correct albums', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      // Check that songs appear in the correct album sections
      const synthwaveSection = screen.getByLabelText('Synthwave Chronicles');
      expect(within(synthwaveSection).getByRole('heading', { name: 'Digital Dreams' })).toBeInTheDocument();
      expect(within(synthwaveSection).getByRole('heading', { name: 'Neon Nights' })).toBeInTheDocument();
      
      const fusionSection = screen.getByLabelText('Electronic Fusion');
      expect(within(fusionSection).getByRole('heading', { name: 'Electric Pulse' })).toBeInTheDocument();
      expect(within(fusionSection).getByRole('heading', { name: 'Bass Drop Revolution' })).toBeInTheDocument();
      
      const atmosphericSection = screen.getByLabelText('Atmospheric Sounds');
      expect(within(atmosphericSection).getByRole('heading', { name: 'Ambient Journey' })).toBeInTheDocument();
    });

    it('should display song metadata correctly', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      // Check release type badges - they appear in both badge and details sections
      // So we expect more than just the badge count
      const independentTexts = screen.getAllByText('Independent');
      expect(independentTexts.length).toBeGreaterThanOrEqual(3); // At least 3 Independent songs
      
      const ncsTexts = screen.getAllByText('NCS');
      expect(ncsTexts.length).toBeGreaterThanOrEqual(2); // At least 2 NCS songs
      
      // Check Content ID badges
      const contentIdBadges = screen.getAllByText('Content ID');
      expect(contentIdBadges).toHaveLength(1); // Only "Neon Nights" has Content ID
    });

    it('should display creator-friendly badges correctly', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      // Should show creator-friendly badges for appropriate songs
      const creatorFriendlyBadges = screen.getAllByText('Creator Friendly');
      expect(creatorFriendlyBadges.length).toBeGreaterThan(0);
      
      // Check specific songs that should be creator-friendly
      const digitalDreamsCard = screen.getByRole('heading', { name: 'Digital Dreams' }).closest('article');
      expect(within(digitalDreamsCard!).getByText('Creator Friendly')).toBeInTheDocument();
      
      const electricPulseCard = screen.getByRole('heading', { name: 'Electric Pulse' }).closest('article');
      expect(within(electricPulseCard!).getByText('Creator Friendly')).toBeInTheDocument();
      
      const ambientJourneyCard = screen.getByRole('heading', { name: 'Ambient Journey' }).closest('article');
      expect(within(ambientJourneyCard!).getByText('Creator Friendly')).toBeInTheDocument();
    });

    it('should display license information when present', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      // Check that licenses are displayed for songs that have them
      expect(screen.getByText('CC BY 4.0')).toBeInTheDocument();
      expect(screen.getByText('All Rights Reserved')).toBeInTheDocument();
      expect(screen.getByText('BGML-P')).toBeInTheDocument();
    });

    it('should not display license information when empty', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      // NCS songs have empty licenses - check they don't show license section
      const electricPulseCard = screen.getByRole('heading', { name: 'Electric Pulse' }).closest('article');
      expect(within(electricPulseCard!).queryByText(/License:/)).not.toBeInTheDocument();
      
      const bassDropCard = screen.getByRole('heading', { name: 'Bass Drop Revolution' }).closest('article');
      expect(within(bassDropCard!).queryByText(/License:/)).not.toBeInTheDocument();
    });

    it('should display streaming links correctly', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      // Check that all streaming links are present and properly configured
      const streamingLinks = screen.getAllByText('Listen Now');
      expect(streamingLinks).toHaveLength(5); // One for each song
      
      // Check specific link attributes
      const digitalDreamsLink = screen.getByRole('link', { name: 'Listen to Digital Dreams on streaming platform' });
      expect(digitalDreamsLink).toHaveAttribute('href', 'https://push.fm/digital-dreams');
      expect(digitalDreamsLink).toHaveAttribute('target', '_blank');
      expect(digitalDreamsLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should have proper accessibility attributes for songs', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      // Each song should be an article with role="article"
      const songArticles = screen.getAllByRole('article');
      expect(songArticles).toHaveLength(5);
      
      // Check that streaming links have proper aria-labels
      expect(screen.getByRole('link', { name: 'Listen to Digital Dreams on streaming platform' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Listen to Neon Nights on streaming platform' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Listen to Electric Pulse on streaming platform' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Listen to Bass Drop Revolution on streaming platform' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Listen to Ambient Journey on streaming platform' })).toBeInTheDocument();
    });
  });

  describe('Empty State Handling', () => {
    it('should display empty state when no albums provided', () => {
      render(<DiscographyView albums={[]} />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'No Albums Found' })).toBeInTheDocument();
      expect(screen.getByText('There are no albums to display in the discography.')).toBeInTheDocument();
    });

    it('should display empty state when albums is null/undefined', () => {
      render(<DiscographyView albums={null as any} />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'No Albums Found' })).toBeInTheDocument();
    });

    it('should have proper accessibility for empty state', () => {
      render(<DiscographyView albums={[]} />);
      
      const emptyState = screen.getByRole('status');
      expect(emptyState).toHaveAttribute('aria-live', 'polite');
      expect(emptyState).toHaveClass('empty-state');
    });
  });

  describe('Badge Logic', () => {
    it('should show Content ID badge only for songs with hasContentId: true', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      // Only "Neon Nights" has Content ID enabled
      const neonNightsCard = screen.getByRole('heading', { name: 'Neon Nights' }).closest('article');
      expect(within(neonNightsCard!).getByText('Content ID')).toBeInTheDocument();
      
      // Other songs should not have Content ID badge
      const digitalDreamsCard = screen.getByRole('heading', { name: 'Digital Dreams' }).closest('article');
      expect(within(digitalDreamsCard!).queryByText('Content ID')).not.toBeInTheDocument();
    });

    it('should show creator-friendly badge for NCS releases', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      // NCS songs should have creator-friendly badge
      const electricPulseCard = screen.getByRole('heading', { name: 'Electric Pulse' }).closest('article');
      expect(within(electricPulseCard!).getByText('Creator Friendly')).toBeInTheDocument();
      
      const bassDropCard = screen.getByRole('heading', { name: 'Bass Drop Revolution' }).closest('article');
      expect(within(bassDropCard!).getByText('Creator Friendly')).toBeInTheDocument();
    });

    it('should show creator-friendly badge for CC licenses', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      // Songs with CC licenses should have creator-friendly badge
      const digitalDreamsCard = screen.getByRole('heading', { name: 'Digital Dreams' }).closest('article');
      expect(within(digitalDreamsCard!).getByText('Creator Friendly')).toBeInTheDocument();
    });

    it('should show creator-friendly badge for BGML-P license', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      // Song with BGML-P license should have creator-friendly badge
      const ambientJourneyCard = screen.getByRole('heading', { name: 'Ambient Journey' }).closest('article');
      expect(within(ambientJourneyCard!).getByText('Creator Friendly')).toBeInTheDocument();
    });

    it('should not show creator-friendly badge for All Rights Reserved', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      // "Neon Nights" has "All Rights Reserved" license and is not NCS
      const neonNightsCard = screen.getByRole('heading', { name: 'Neon Nights' }).closest('article');
      expect(within(neonNightsCard!).queryByText('Creator Friendly')).not.toBeInTheDocument();
    });

    it('should have proper tooltips for badges', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      // Check Content ID tooltip
      const contentIdBadge = screen.getByText('Content ID');
      expect(contentIdBadge).toHaveAttribute('title', 'This song has YouTube Content ID enabled');
      
      // Check Creator Friendly tooltip
      const creatorFriendlyBadges = screen.getAllByText('Creator Friendly');
      creatorFriendlyBadges.forEach(badge => {
        expect(badge).toHaveAttribute('title', 'This song is free for creators to use');
      });
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply correct CSS classes to main elements', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      // Main container
      expect(screen.getByRole('main')).toHaveClass('discography-view');
      
      // Album sections
      const albumSections = screen.getAllByRole('region');
      albumSections.forEach(section => {
        expect(section).toHaveClass('album-section');
      });
      
      // Song cards
      const songArticles = screen.getAllByRole('article');
      songArticles.forEach(article => {
        expect(article).toHaveClass('song-card');
      });
    });

    it('should apply correct classes to badges', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      // Find actual badge elements by their class
      const badgeElements = screen.getAllByText((content, element) => {
        return element?.classList.contains('badge') || false;
      });
      
      // Should have badges for release types and special badges
      expect(badgeElements.length).toBeGreaterThan(0);
      
      // Check that badge elements have the badge class
      badgeElements.forEach(badge => {
        expect(badge).toHaveClass('badge');
      });
      
      // Check specific badge types by finding them within the badge elements
      const independentBadges = badgeElements.filter(el => el.textContent === 'Independent');
      independentBadges.forEach(badge => {
        expect(badge).toHaveClass('badge', 'independent');
      });
      
      const ncsBadges = badgeElements.filter(el => el.textContent === 'NCS');
      ncsBadges.forEach(badge => {
        expect(badge).toHaveClass('badge', 'ncs');
      });
      
      // Special badges
      const contentIdBadges = badgeElements.filter(el => el.textContent === 'Content ID');
      contentIdBadges.forEach(badge => {
        expect(badge).toHaveClass('badge', 'content-id');
      });
      
      const creatorFriendlyBadges = badgeElements.filter(el => el.textContent === 'Creator Friendly');
      creatorFriendlyBadges.forEach(badge => {
        expect(badge).toHaveClass('badge', 'creator-friendly');
      });
    });

    it('should apply streaming link class', () => {
      render(<DiscographyView albums={mockAlbums} />);
      
      const streamingLinks = screen.getAllByText('Listen Now');
      streamingLinks.forEach(link => {
        expect(link).toHaveClass('streaming-link');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle albums with no songs', () => {
      const emptyAlbum: Album[] = [{
        name: 'Empty Album',
        songs: []
      }];
      
      render(<DiscographyView albums={emptyAlbum} />);
      
      // Should still display the album
      expect(screen.getByRole('heading', { name: 'Empty Album' })).toBeInTheDocument();
      expect(screen.getByText('0 songs')).toBeInTheDocument();
    });

    it('should handle very long album and song names', () => {
      const longNameAlbum: Album[] = [{
        name: 'This Is A Very Long Album Name That Should Still Display Correctly Without Breaking The Layout',
        songs: [{
          ...mockSongs[0],
          title: 'This Is A Very Long Song Title That Should Also Display Correctly Without Breaking The Layout',
          albumName: 'This Is A Very Long Album Name That Should Still Display Correctly Without Breaking The Layout'
        }]
      }];
      
      render(<DiscographyView albums={longNameAlbum} />);
      
      // Should display long names without crashing
      expect(screen.getByRole('heading', { name: 'This Is A Very Long Album Name That Should Still Display Correctly Without Breaking The Layout' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'This Is A Very Long Song Title That Should Also Display Correctly Without Breaking The Layout' })).toBeInTheDocument();
    });

    it('should handle songs with missing optional fields', () => {
      const minimalSong: Song = {
        id: 'minimal-001',
        title: 'Minimal Song',
        albumName: 'Minimal Album',
        releaseType: 'Independent',
        hasContentId: false,
        streamingLink: 'https://example.com/minimal',
        license: '',
        releaseYear: 2023
        // albumArtwork is optional and missing
      };
      
      const minimalAlbum: Album[] = [{
        name: 'Minimal Album',
        songs: [minimalSong]
      }];
      
      render(<DiscographyView albums={minimalAlbum} />);
      
      // Should render without crashing
      expect(screen.getByRole('heading', { name: 'Minimal Song' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Minimal Album' })).toBeInTheDocument();
    });
  });
});