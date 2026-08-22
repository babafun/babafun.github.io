/**
 * Unit Tests for DiscographyView Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiscographyView } from './DiscographyView';
import type { Album } from '../types/music';

const createTestAlbum = (overrides: Partial<Album> = {}): Album => ({
  id: 'test-album-1',
  title: 'Test Album',
  releaseYear: 2024,
  streamLink: 'https://example.com/album',
  hasContentId: false,
  albumArtwork: 'https://example.com/artwork.jpg',
  tracks: [
    { id: 'track-1', title: 'Test Track', license: 'CC BY 4.0' }
  ],
  ...overrides
});

describe('DiscographyView', () => {
  it('renders without crashing with valid album data', () => {
    render(<DiscographyView albums={[createTestAlbum()]} />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText('Test Album')).toBeInTheDocument();
    expect(screen.getByText('Test Track')).toBeInTheDocument();
  });

  it('renders empty state when no albums provided', () => {
    render(<DiscographyView albums={[]} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('No Albums Found')).toBeInTheDocument();
  });

  it('renders empty state when albums is null', () => {
    render(<DiscographyView albums={null as any} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays album title and track count', () => {
    const album = createTestAlbum({
      tracks: [
        { id: 't1', title: 'Track One', license: 'CC BY 4.0' },
        { id: 't2', title: 'Track Two', license: '' }
      ]
    });
    render(<DiscographyView albums={[album]} />);
    expect(screen.getByText('Test Album')).toBeInTheDocument();
    expect(screen.getByText('2 tracks')).toBeInTheDocument();
  });

  it('displays creator-friendly badge for CC licensed tracks', () => {
    render(<DiscographyView albums={[createTestAlbum()]} />);
    expect(screen.getByText('Creator Friendly')).toBeInTheDocument();
  });

  it('does not display creator-friendly badge for restrictive licenses', () => {
    const album = createTestAlbum({
      tracks: [{ id: 't1', title: 'Restricted Track', license: 'All Rights Reserved' }]
    });
    render(<DiscographyView albums={[album]} />);
    expect(screen.queryByText('Creator Friendly')).not.toBeInTheDocument();
  });

  it('displays streaming link for each track', () => {
    render(<DiscographyView albums={[createTestAlbum()]} />);
    const link = screen.getByRole('link', { name: /Listen to Test Track/i });
    expect(link).toHaveAttribute('href', 'https://example.com/album');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('uses overrideStreamLink when present', () => {
    const album = createTestAlbum({
      tracks: [{ id: 't1', title: 'Override Track', license: 'CC BY 4.0',
                 overrideStreamLink: 'https://override.example.com' }]
    });
    render(<DiscographyView albums={[album]} />);
    const link = screen.getByRole('link', { name: /Listen to Override Track/i });
    expect(link).toHaveAttribute('href', 'https://override.example.com');
  });

  it('displays license when present', () => {
    render(<DiscographyView albums={[createTestAlbum()]} />);
    expect(screen.getByText('CC BY 4.0')).toBeInTheDocument();
  });

  it('does not display license section when license is empty', () => {
    const album = createTestAlbum({
      tracks: [{ id: 't1', title: 'No License Track', license: '' }]
    });
    render(<DiscographyView albums={[album]} />);
    expect(screen.queryByText(/License:/)).not.toBeInTheDocument();
  });

  it('renders multiple albums', () => {
    const albums = [
      createTestAlbum({ id: 'a1', title: 'Album One', tracks: [{ id: 't1', title: 'Track 1', license: '' }] }),
      createTestAlbum({ id: 'a2', title: 'Album Two', tracks: [{ id: 't2', title: 'Track 2', license: '' }] })
    ];
    render(<DiscographyView albums={albums} />);
    expect(screen.getByText('Album One')).toBeInTheDocument();
    expect(screen.getByText('Album Two')).toBeInTheDocument();
    expect(screen.getByText('Track 1')).toBeInTheDocument();
    expect(screen.getByText('Track 2')).toBeInTheDocument();
  });
});
