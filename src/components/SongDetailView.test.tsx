/**
 * Unit Tests for SongDetailView Component
 * 
 * Tests song metadata display, license conditional display, and creator-friendly indicators.
 * Validates Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SongDetailView } from './SongDetailView';
import type { Song } from '../types/music';

// Test data fixtures
const createSong = (overrides: Partial<Song> = {}): Song => ({
  id: 'test-song-001',
  title: 'Test Song',
  albumName: 'Test Album',
  releaseType: 'Independent',
  hasContentId: false,
  streamingLink: 'https://example.com/song',
  license: 'CC BY 4.0',
  releaseYear: 2023,
  albumArtwork: 'https://example.com/artwork.jpg',
  ...overrides,
});

const sampleSongs: Song[] = [
  createSong({
    id: 'song-001',
    title: 'Digital Dreams',
    albumName: 'Synthwave Chronicles',
    releaseType: 'Independent',
    hasContentId: false,
    streamingLink: 'https://push.fm/digital-dreams',
    license: 'CC BY 4.0',
    releaseYear: 2023,
  }),
  createSong({
    id: 'song-002',
    title: 'Electric Pulse',
    albumName: 'Electronic Fusion',
    releaseType: 'NCS',
    hasContentId: false,
    streamingLink: 'https://ncs.io/electric-pulse',
    license: '',
    releaseYear: 2024,
  }),
  createSong({
    id: 'song-003',
    title: 'Thunder Strike',
    albumName: 'High Energy',
    releaseType: 'Monstercat',
    hasContentId: true,
    streamingLink: 'https://monstercat.com/thunder-strike',
    license: 'All Rights Reserved',
    releaseYear: 2024,
  }),
];

describe('SongDetailView Component', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing with valid songs', () => {
      render(<SongDetailView songs={sampleSongs} />);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('displays the correct number of songs', () => {
      render(<SongDetailView songs={sampleSongs} />);
      
      // Check that all song titles are displayed
      expect(screen.getByText('Digital Dreams')).toBeInTheDocument();
      expect(screen.getByText('Electric Pulse')).toBeInTheDocument();
      expect(screen.getByText('Thunder Strike')).toBeInTheDocument();
    });

    it('groups songs by release type', () => {
      render(<SongDetailView songs={sampleSongs} />);
      
      // Check that release type headers are displayed
      expect(screen.getByText('Independent Releases')).toBeInTheDocument();
      expect(screen.getByText('NCS Releases')).toBeInTheDocument();
      expect(screen.getByText('Monstercat Releases')).toBeInTheDocument();
    });

    it('displays song count for each release type', () => {
      render(<SongDetailView songs={sampleSongs} />);
      
      // Each release type should show "1 song"
      const songCountElements = screen.getAllByText('1 song');
      expect(songCountElements).toHaveLength(3);
    });
  });

  describe('Empty State Handling', () => {
    it('displays empty state when no songs provided', () => {
      render(<SongDetailView songs={[]} />);
      
      expect(screen.getByText('No Songs Found')).toBeInTheDocument();
      expect(screen.getByText('There are no songs to display.')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('displays empty state when songs array is undefined', () => {
      render(<SongDetailView songs={undefined as any} />);
      
      expect(screen.getByText('No Songs Found')).toBeInTheDocument();
    });
  });

  describe('Song Metadata Display', () => {
    it('displays all required song metadata', () => {
      const song = createSong({
        title: 'Test Song Title',
        albumName: 'Test Album Name',
        releaseType: 'Independent',
        hasContentId: true,
        streamingLink: 'https://example.com/listen',
        license: 'CC BY 4.0',
      });

      render(<SongDetailView songs={[song]} />);

      // Check song title and album
      expect(screen.getByText('Test Song Title')).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'from Test Album Name';
      })).toBeInTheDocument();

      // Check release type badge
      expect(screen.getByText('Independent')).toBeInTheDocument();

      // Check Content ID status
      expect(screen.getByText('Enabled')).toBeInTheDocument();

      // Check streaming link
      const streamingLink = screen.getByRole('link', { name: /Listen to Test Song Title/ });
      expect(streamingLink).toBeInTheDocument();
      expect(streamingLink).toHaveAttribute('href', 'https://example.com/listen');
      expect(streamingLink).toHaveAttribute('target', '_blank');
      expect(streamingLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('displays correct Content ID status for enabled songs', () => {
      const song = createSong({ hasContentId: true });
      render(<SongDetailView songs={[song]} />);

      const contentIdBadge = screen.getByText('Enabled');
      expect(contentIdBadge).toBeInTheDocument();
      expect(contentIdBadge).toHaveClass('content-id');
      expect(contentIdBadge).toHaveAttribute('title', 
        'This song has YouTube Content ID enabled and may claim revenue on videos');
    });

    it('displays correct Content ID status for disabled songs', () => {
      const song = createSong({ hasContentId: false });
      render(<SongDetailView songs={[song]} />);

      const contentIdBadge = screen.getByText('Disabled');
      expect(contentIdBadge).toBeInTheDocument();
      expect(contentIdBadge).toHaveClass('success');
      expect(contentIdBadge).toHaveAttribute('title', 
        'This song does not have YouTube Content ID');
    });

    it('applies correct CSS classes to release type badges', () => {
      const songs = [
        createSong({ releaseType: 'Independent', title: 'Indie Song' }),
        createSong({ releaseType: 'NCS', title: 'NCS Song' }),
        createSong({ releaseType: 'Monstercat', title: 'MC Song' }),
      ];

      render(<SongDetailView songs={songs} />);

      // Check that badges have correct classes
      const independentBadge = screen.getByText('Independent');
      expect(independentBadge).toHaveClass('badge', 'independent');

      const ncsBadge = screen.getByText('NCS');
      expect(ncsBadge).toHaveClass('badge', 'ncs');

      const monstercatBadge = screen.getByText('Monstercat');
      expect(monstercatBadge).toHaveClass('badge', 'monstercat');
    });
  });

  describe('License Conditional Display', () => {
    it('displays license when license field is non-empty', () => {
      const song = createSong({ license: 'CC BY 4.0' });
      render(<SongDetailView songs={[song]} />);

      expect(screen.getByText('License:')).toBeInTheDocument();
      expect(screen.getByText('CC BY 4.0')).toBeInTheDocument();
    });

    it('does not display license when license field is empty string', () => {
      const song = createSong({ license: '' });
      render(<SongDetailView songs={[song]} />);

      expect(screen.queryByText('License:')).not.toBeInTheDocument();
    });

    it('does not display license when license field is only whitespace', () => {
      const song = createSong({ license: '   ' });
      render(<SongDetailView songs={[song]} />);

      expect(screen.queryByText('License:')).not.toBeInTheDocument();
    });

    it('displays various license types correctly', () => {
      const songs = [
        createSong({ id: '1', title: 'Song 1', license: 'CC BY 4.0' }),
        createSong({ id: '2', title: 'Song 2', license: 'CC BY-SA 4.0' }),
        createSong({ id: '3', title: 'Song 3', license: 'CC0 1.0' }),
        createSong({ id: '4', title: 'Song 4', license: 'BGML-P' }),
        createSong({ id: '5', title: 'Song 5', license: 'All Rights Reserved' }),
      ];

      render(<SongDetailView songs={songs} />);

      expect(screen.getByText('CC BY 4.0')).toBeInTheDocument();
      expect(screen.getByText('CC BY-SA 4.0')).toBeInTheDocument();
      expect(screen.getByText('CC0 1.0')).toBeInTheDocument();
      expect(screen.getByText('BGML-P')).toBeInTheDocument();
      expect(screen.getByText('All Rights Reserved')).toBeInTheDocument();
    });
  });

  describe('Creator-Friendly Indicators', () => {
    it('displays creator-friendly badge for NCS releases', () => {
      const song = createSong({ 
        releaseType: 'NCS',
        license: '', // NCS songs typically have empty license
      });
      render(<SongDetailView songs={[song]} />);

      const badge = screen.getByText('✓ Creator Friendly');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('badge', 'creator-friendly');
      expect(badge).toHaveAttribute('title', 'This song is free for creators to use');
    });

    it('displays creator-friendly badge for CC BY licenses', () => {
      const song = createSong({ license: 'CC BY 4.0' });
      render(<SongDetailView songs={[song]} />);

      expect(screen.getByText('✓ Creator Friendly')).toBeInTheDocument();
    });

    it('displays creator-friendly badge for CC BY-SA licenses', () => {
      const song = createSong({ license: 'CC BY-SA 4.0' });
      render(<SongDetailView songs={[song]} />);

      expect(screen.getByText('✓ Creator Friendly')).toBeInTheDocument();
    });

    it('displays creator-friendly badge for CC0 licenses', () => {
      const song = createSong({ license: 'CC0 1.0' });
      render(<SongDetailView songs={[song]} />);

      expect(screen.getByText('✓ Creator Friendly')).toBeInTheDocument();
    });

    it('displays creator-friendly badge for BGML-P licenses', () => {
      const song = createSong({ license: 'BGML-P' });
      render(<SongDetailView songs={[song]} />);

      expect(screen.getByText('✓ Creator Friendly')).toBeInTheDocument();
    });

    it('does not display creator-friendly badge for All Rights Reserved', () => {
      const song = createSong({ 
        releaseType: 'Independent',
        license: 'All Rights Reserved' 
      });
      render(<SongDetailView songs={[song]} />);

      expect(screen.queryByText('✓ Creator Friendly')).not.toBeInTheDocument();
    });

    it('does not display creator-friendly badge for Monstercat with All Rights Reserved', () => {
      const song = createSong({ 
        releaseType: 'Monstercat',
        license: 'All Rights Reserved' 
      });
      render(<SongDetailView songs={[song]} />);

      expect(screen.queryByText('✓ Creator Friendly')).not.toBeInTheDocument();
    });

    it('handles case-insensitive license matching', () => {
      const songs = [
        createSong({ id: '1', title: 'Song 1', license: 'cc by 4.0' }),
        createSong({ id: '2', title: 'Song 2', license: 'CC0' }),
        createSong({ id: '3', title: 'Song 3', license: 'bgml-p' }),
      ];

      render(<SongDetailView songs={songs} />);

      // All should show creator-friendly badge
      const badges = screen.getAllByText('✓ Creator Friendly');
      expect(badges).toHaveLength(3);
    });
  });

  describe('Streaming Links', () => {
    it('renders streaming links with correct attributes', () => {
      const song = createSong({
        title: 'Test Song',
        streamingLink: 'https://spotify.com/track/123',
      });
      render(<SongDetailView songs={[song]} />);

      const link = screen.getByRole('link', { name: /Listen to Test Song/ });
      expect(link).toHaveAttribute('href', 'https://spotify.com/track/123');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('displays streaming link text with music emoji', () => {
      const song = createSong();
      render(<SongDetailView songs={[song]} />);

      expect(screen.getByText('🎵 Listen Now')).toBeInTheDocument();
    });

    it('provides accessible aria-label for streaming links', () => {
      const song = createSong({ title: 'Amazing Song' });
      render(<SongDetailView songs={[song]} />);

      const link = screen.getByLabelText('Listen to Amazing Song by opening streaming platform in new tab');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses semantic HTML structure', () => {
      render(<SongDetailView songs={sampleSongs} />);

      // Check main landmark
      expect(screen.getByRole('main')).toBeInTheDocument();

      // Check article elements for each song
      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(3);

      // Check section elements for release types
      const sections = screen.getAllByRole('region');
      expect(sections).toHaveLength(3);
    });

    it('provides proper heading hierarchy', () => {
      render(<SongDetailView songs={sampleSongs} />);

      // Check h1 (screen reader only)
      expect(screen.getByRole('heading', { level: 1, name: 'Song Details' })).toBeInTheDocument();

      // Check h2 for release types
      expect(screen.getByRole('heading', { level: 2, name: 'Independent Releases' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'NCS Releases' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Monstercat Releases' })).toBeInTheDocument();

      // Check h3 for song titles
      expect(screen.getByRole('heading', { level: 3, name: 'Digital Dreams' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Electric Pulse' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Thunder Strike' })).toBeInTheDocument();
    });

    it('provides aria-labelledby for sections', () => {
      render(<SongDetailView songs={sampleSongs} />);

      const independentSection = screen.getByRole('region', { name: 'Independent Releases' });
      expect(independentSection).toHaveAttribute('aria-labelledby', 'release-independent');

      const ncsSection = screen.getByRole('region', { name: 'NCS Releases' });
      expect(ncsSection).toHaveAttribute('aria-labelledby', 'release-ncs');

      const monstercatSection = screen.getByRole('region', { name: 'Monstercat Releases' });
      expect(monstercatSection).toHaveAttribute('aria-labelledby', 'release-monstercat');
    });

    it('provides live region for empty state', () => {
      render(<SongDetailView songs={[]} />);

      const emptyState = screen.getByRole('status');
      expect(emptyState).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Edge Cases', () => {
    it('handles songs with missing optional fields gracefully', () => {
      const song: Song = {
        id: 'minimal-song',
        title: 'Minimal Song',
        albumName: 'Minimal Album',
        releaseType: 'Independent',
        hasContentId: false,
        streamingLink: 'https://example.com',
        license: '',
        releaseYear: 2023,
        // albumArtwork is optional and missing
      };

      render(<SongDetailView songs={[song]} />);

      expect(screen.getByText('Minimal Song')).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'from Minimal Album';
      })).toBeInTheDocument();
    });

    it('handles very long song titles and album names', () => {
      const song = createSong({
        title: 'This Is A Very Long Song Title That Should Still Display Properly Without Breaking The Layout',
        albumName: 'This Is Also A Very Long Album Name That Tests The Layout Handling',
      });

      render(<SongDetailView songs={[song]} />);

      expect(screen.getByText('This Is A Very Long Song Title That Should Still Display Properly Without Breaking The Layout')).toBeInTheDocument();
      expect(screen.getByText(/This Is Also A Very Long Album Name That Tests The Layout Handling/)).toBeInTheDocument();
    });

    it('handles special characters in song metadata', () => {
      const song = createSong({
        title: 'Song with "Quotes" & Symbols!',
        albumName: 'Album with <HTML> & Special Chars',
        license: 'CC BY 4.0 (Special Edition)',
      });

      render(<SongDetailView songs={[song]} />);

      expect(screen.getByText('Song with "Quotes" & Symbols!')).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'from Album with <HTML> & Special Chars';
      })).toBeInTheDocument();
      expect(screen.getByText('CC BY 4.0 (Special Edition)')).toBeInTheDocument();
    });

    it('handles multiple songs with same release type', () => {
      const songs = [
        createSong({ id: '1', title: 'Song 1', releaseType: 'Independent' }),
        createSong({ id: '2', title: 'Song 2', releaseType: 'Independent' }),
        createSong({ id: '3', title: 'Song 3', releaseType: 'Independent' }),
      ];

      render(<SongDetailView songs={songs} />);

      expect(screen.getByText('Independent Releases')).toBeInTheDocument();
      expect(screen.getByText('3 songs')).toBeInTheDocument();
      expect(screen.getByText('Song 1')).toBeInTheDocument();
      expect(screen.getByText('Song 2')).toBeInTheDocument();
      expect(screen.getByText('Song 3')).toBeInTheDocument();
    });
  });

  describe('CSS Classes and Styling', () => {
    it('applies correct CSS classes to main container', () => {
      render(<SongDetailView songs={sampleSongs} />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('song-detail-view');
    });

    it('applies correct CSS classes to song cards', () => {
      const song = createSong();
      render(<SongDetailView songs={[song]} />);

      const article = screen.getByRole('article');
      expect(article).toHaveClass('song-card', 'song-detail-card');
    });

    it('applies correct CSS classes to badges', () => {
      const song = createSong({
        releaseType: 'NCS',
        hasContentId: false,
        license: 'CC BY 4.0',
      });
      render(<SongDetailView songs={[song]} />);

      // Release type badge
      const releaseTypeBadge = screen.getByText('NCS');
      expect(releaseTypeBadge).toHaveClass('badge', 'ncs');

      // Content ID badge
      const contentIdBadge = screen.getByText('Disabled');
      expect(contentIdBadge).toHaveClass('badge', 'success');

      // Creator friendly badge
      const creatorBadge = screen.getByText('✓ Creator Friendly');
      expect(creatorBadge).toHaveClass('badge', 'creator-friendly');
    });
  });
});