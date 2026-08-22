/**
 * Unit tests for DiscographyView component (new album-first model)
 * Validates Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiscographyView } from '../../components/DiscographyView';
import type { Album } from '../../types/music';

const createAlbum = (overrides: Partial<Album> = {}): Album => ({
  id: 'album-001',
  title: 'Test Album',
  releaseYear: 2024,
  streamLink: 'https://example.com/album',
  hasContentId: false,
  albumArtwork: 'https://example.com/art.jpg',
  tracks: [
    { id: 'track-001', title: 'Test Track', license: 'CC BY 4.0' }
  ],
  ...overrides
});

describe('DiscographyView', () => {
  it('should render without crashing', () => {
    render(<DiscographyView albums={[createAlbum()]} />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should display album title', () => {
    render(<DiscographyView albums={[createAlbum({ title: 'My Album' })]} />);
    expect(screen.getByText('My Album')).toBeInTheDocument();
  });

  it('should display track title', () => {
    render(<DiscographyView albums={[createAlbum()]} />);
    expect(screen.getByText('Test Track')).toBeInTheDocument();
  });

  it('should show empty state for empty albums array', () => {
    render(<DiscographyView albums={[]} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('No Albums Found')).toBeInTheDocument();
  });

  it('should display track count', () => {
    const album = createAlbum({
      tracks: [
        { id: 't1', title: 'Track 1', license: '' },
        { id: 't2', title: 'Track 2', license: '' }
      ]
    });
    render(<DiscographyView albums={[album]} />);
    expect(screen.getByText('2 tracks')).toBeInTheDocument();
  });

  it('should display creator-friendly badge for CC licensed tracks', () => {
    render(<DiscographyView albums={[createAlbum()]} />);
    expect(screen.getByText('Creator Friendly')).toBeInTheDocument();
  });

  it('should display streaming link', () => {
    render(<DiscographyView albums={[createAlbum()]} />);
    const link = screen.getByRole('link', { name: /Listen to Test Track/i });
    expect(link).toHaveAttribute('href', 'https://example.com/album');
  });

  it('should use overrideStreamLink when present', () => {
    const album = createAlbum({
      tracks: [{ id: 't1', title: 'Override Track', license: '',
                 overrideStreamLink: 'https://override.example.com' }]
    });
    render(<DiscographyView albums={[album]} />);
    const link = screen.getByRole('link', { name: /Listen to Override Track/i });
    expect(link).toHaveAttribute('href', 'https://override.example.com');
  });

  it('should render multiple albums', () => {
    const albums = [
      createAlbum({ id: 'a1', title: 'Album One', tracks: [{ id: 't1', title: 'T1', license: '' }] }),
      createAlbum({ id: 'a2', title: 'Album Two', tracks: [{ id: 't2', title: 'T2', license: '' }] })
    ];
    render(<DiscographyView albums={albums} />);
    expect(screen.getByText('Album One')).toBeInTheDocument();
    expect(screen.getByText('Album Two')).toBeInTheDocument();
  });
});
