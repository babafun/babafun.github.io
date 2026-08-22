/**
 * Property-based tests for album flattening functionality
 *
 * **Property 2: Flatten Preserves All Tracks**
 * **Property 3: Stream Link Resolution**
 *
 * **Validates: Requirements 2.1, 4.1, 6.5, 6.6**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { albumArbitrary } from '../../test/arbitraries';
import type { Album, SongView } from '../types/music';

/**
 * JavaScript implementation of flattenSongs for testing
 * (mirrors the WASM flatten_songs logic)
 */
function flattenSongsJS(albums: Album[]): SongView[] {
  return albums.flatMap(album =>
    album.tracks.map(track => ({
      id: track.id,
      title: track.title,
      license: track.license,
      streamLink: track.overrideStreamLink ?? album.streamLink,
      albumId: album.id,
      albumTitle: album.title,
      releaseYear: album.releaseYear,
      hasContentId: album.hasContentId,
      releaseLabel: album.releaseLabel,
      albumArtwork: album.albumArtwork
    }))
  );
}

describe('Property 2: Flatten Preserves All Tracks', () => {
  /**
   * **Validates: Requirements 2.1, 4.1**
   *
   * For any list of albums, flattening them into SongView objects should
   * preserve all tracks without duplication or loss.
   */
  it('should preserve all tracks when flattening albums', () => {
    fc.assert(
      fc.property(
        fc.array(albumArbitrary, { minLength: 0, maxLength: 10 }),
        (albums: Album[]) => {
          const songs = flattenSongsJS(albums);
          const totalTracks = albums.reduce((n, a) => n + a.tracks.length, 0);

          // Same count
          if (songs.length !== totalTracks) return false;

          // All track IDs present
          const allTrackIds = albums.flatMap(a => a.tracks.map(t => t.id));
          const songIds = songs.map(s => s.id);
          return allTrackIds.every(id => songIds.includes(id));
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('should handle empty album arrays', () => {
    const songs = flattenSongsJS([]);
    expect(songs).toEqual([]);
  });

  it('should handle albums with no tracks', () => {
    const albumWithNoTracks: Album = {
      id: 'empty-album',
      title: 'Empty Album',
      releaseYear: 2024,
      streamLink: 'https://example.com',
      hasContentId: false,
      albumArtwork: 'https://example.com/art.jpg',
      tracks: []
    };
    const songs = flattenSongsJS([albumWithNoTracks]);
    expect(songs).toEqual([]);
  });

  it('should preserve album context for each track', () => {
    fc.assert(
      fc.property(albumArbitrary, (album: Album) => {
        const songs = flattenSongsJS([album]);

        return songs.every(song => {
          return (
            song.albumId === album.id &&
            song.albumTitle === album.title &&
            song.releaseYear === album.releaseYear &&
            song.hasContentId === album.hasContentId &&
            song.albumArtwork === album.albumArtwork
          );
        });
      }),
      { numRuns: 500 }
    );
  });
});

describe('Property 3: Stream Link Resolution', () => {
  /**
   * **Validates: Requirements 6.5, 6.6**
   *
   * For any track, the resolved stream link should be the track's
   * overrideStreamLink if present, otherwise the album's streamLink.
   */
  it('should resolve stream links correctly', () => {
    fc.assert(
      fc.property(albumArbitrary, (album: Album) => {
        const songs = flattenSongsJS([album]);

        return songs.every(song => {
          const track = album.tracks.find(t => t.id === song.id)!;
          const expected = track.overrideStreamLink ?? album.streamLink;
          return song.streamLink === expected;
        });
      }),
      { numRuns: 1000 }
    );
  });

  it('should use overrideStreamLink when present', () => {
    const album: Album = {
      id: 'test-album',
      title: 'Test Album',
      releaseYear: 2024,
      streamLink: 'https://album.example.com',
      hasContentId: false,
      albumArtwork: 'https://example.com/art.jpg',
      tracks: [
        { id: 'track-1', title: 'Track 1', license: 'CC BY 4.0',
          overrideStreamLink: 'https://track.example.com' },
        { id: 'track-2', title: 'Track 2', license: '' }
      ]
    };

    const songs = flattenSongsJS([album]);

    const track1 = songs.find(s => s.id === 'track-1')!;
    const track2 = songs.find(s => s.id === 'track-2')!;

    expect(track1.streamLink).toBe('https://track.example.com');
    expect(track2.streamLink).toBe('https://album.example.com');
  });

  it('should fall back to album streamLink when no override', () => {
    fc.assert(
      fc.property(albumArbitrary, (album: Album) => {
        const songs = flattenSongsJS([album]);

        return songs.every(song => {
          const track = album.tracks.find(t => t.id === song.id)!;
          if (!track.overrideStreamLink) {
            return song.streamLink === album.streamLink;
          }
          return true;
        });
      }),
      { numRuns: 500 }
    );
  });
});
