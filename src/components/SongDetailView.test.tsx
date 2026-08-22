/**
 * Unit Tests for SongDetailView Component
 * Validates Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SongDetailView } from './SongDetailView';
import type { SongView } from '../types/music';

const createSong = (overrides: Partial<SongView> = {}): SongView => ({
  id: 'test-song-001',
  title: 'Test Song',
  license: 'CC BY 4.0',
  streamLink: 'https://example.com/song',
  albumId: 'test-album',
  albumTitle: 'Test Album',
  releaseYear: 2023,
  hasContentId: false,
  albumArtwork: 'https://example.com/artwork.jpg',
  ...overrides
});

describe('SongDetailView', () => {
  it('renders without crashing', () => {
    render(<SongDetailView songs={[createSong()]} />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders empty state when no songs provided', () => {
    render(<SongDetailView songs={[]} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('No Songs Found')).toBeInTheDocument();
  });

  it('displays song title', () => {
    render(<SongDetailView songs={[createSong({ title: 'My Song' })]} />);
    expect(screen.getByText('My Song')).toBeInTheDocument();
  });

  it('displays album title', () => {
    render(<SongDetailView songs={[createSong({ albumTitle: 'My Album' })]} />);
    expect(screen.getByText('My Album')).toBeInTheDocument();
  });

  it('displays license when non-empty', () => {
    render(<SongDetailView songs={[createSong({ license: 'CC BY 4.0' })]} />);
    expect(screen.getByText('CC BY 4.0')).toBeInTheDocument();
  });

  it('does not display license section when license is empty', () => {
    render(<SongDetailView songs={[createSong({ license: '' })]} />);
    expect(screen.queryByText(/License:/)).not.toBeInTheDocument();
  });

  it('displays creator-friendly badge for CC licensed songs', () => {
    render(<SongDetailView songs={[createSong({ license: 'CC BY 4.0' })]} />);
    expect(screen.getByText('✓ Creator Friendly')).toBeInTheDocument();
  });

  it('does not display creator-friendly badge for restrictive licenses', () => {
    render(<SongDetailView songs={[createSong({ license: 'All Rights Reserved' })]} />);
    expect(screen.queryByText('✓ Creator Friendly')).not.toBeInTheDocument();
  });

  it('displays streaming link with correct href', () => {
    render(<SongDetailView songs={[createSong({ streamLink: 'https://push.fm/test' })]} />);
    const link = screen.getByRole('link', { name: /Listen to Test Song/i });
    expect(link).toHaveAttribute('href', 'https://push.fm/test');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('shows Content ID enabled badge', () => {
    render(<SongDetailView songs={[createSong({ hasContentId: true })]} />);
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  it('shows Content ID disabled badge', () => {
    render(<SongDetailView songs={[createSong({ hasContentId: false })]} />);
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('renders multiple songs', () => {
    const songs = [
      createSong({ id: 's1', title: 'Song One' }),
      createSong({ id: 's2', title: 'Song Two' })
    ];
    render(<SongDetailView songs={songs} />);
    expect(screen.getByText('Song One')).toBeInTheDocument();
    expect(screen.getByText('Song Two')).toBeInTheDocument();
  });
});
