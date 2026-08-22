/**
 * Tests for custom fast-check arbitraries
 * Verifies that the generators produce valid data structures
 * matching the new album-first model.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  licenseArbitrary,
  trackArbitrary,
  albumArbitrary,
  musicDataArbitrary,
  songArbitrary,
  songViewArbitrary,
  uniqueSongsArbitrary,
  creatorFriendlySongArbitrary,
  nonCreatorFriendlySongArbitrary
} from './arbitraries';
import type { Track, Album, MusicData, SongView } from '../src/types/music';

const CREATOR_FRIENDLY_LICENSES = ['CC BY 4.0', 'CC BY-SA 4.0', 'CC BY 3.0', 'CC BY-SA 3.0', 'CC0 1.0', 'CC0', 'BGML-P'];

describe('Arbitraries', () => {
  describe('licenseArbitrary', () => {
    it('should generate string values', () => {
      fc.assert(
        fc.property(licenseArbitrary, (license) => {
          return typeof license === 'string';
        })
      );
    });
  });

  describe('trackArbitrary', () => {
    it('should generate valid Track objects', () => {
      fc.assert(
        fc.property(trackArbitrary, (track: Track) => {
          return (
            typeof track.id === 'string' &&
            track.id.length > 0 &&
            typeof track.title === 'string' &&
            typeof track.license === 'string' &&
            (track.overrideStreamLink === undefined || typeof track.overrideStreamLink === 'string')
          );
        })
      );
    });
  });

  describe('albumArbitrary', () => {
    it('should generate valid Album objects', () => {
      fc.assert(
        fc.property(albumArbitrary, (album: Album) => {
          return (
            typeof album.id === 'string' &&
            album.id.length > 0 &&
            typeof album.title === 'string' &&
            album.title.trim().length > 0 &&
            typeof album.releaseYear === 'number' &&
            album.releaseYear >= 2020 &&
            album.releaseYear <= 2024 &&
            typeof album.streamLink === 'string' &&
            album.streamLink.length > 0 &&
            typeof album.hasContentId === 'boolean' &&
            typeof album.albumArtwork === 'string' &&
            Array.isArray(album.tracks) &&
            album.tracks.length > 0 &&
            (album.releaseLabel === undefined || typeof album.releaseLabel === 'string')
          );
        })
      );
    });

    it('should generate albums with valid tracks', () => {
      fc.assert(
        fc.property(albumArbitrary, (album: Album) => {
          return album.tracks.every(track =>
            typeof track.id === 'string' &&
            typeof track.title === 'string' &&
            typeof track.license === 'string'
          );
        })
      );
    });
  });

  describe('musicDataArbitrary', () => {
    it('should generate an array of Albums (MusicData = Album[])', () => {
      fc.assert(
        fc.property(musicDataArbitrary, (musicData: MusicData) => {
          return Array.isArray(musicData);
        })
      );
    });

    it('should generate albums with required fields', () => {
      fc.assert(
        fc.property(musicDataArbitrary, (musicData: MusicData) => {
          return musicData.every(album =>
            typeof album.id === 'string' &&
            typeof album.title === 'string' &&
            typeof album.releaseYear === 'number' &&
            typeof album.streamLink === 'string' &&
            typeof album.hasContentId === 'boolean' &&
            typeof album.albumArtwork === 'string' &&
            Array.isArray(album.tracks)
          );
        })
      );
    });
  });

  describe('songViewArbitrary / songArbitrary', () => {
    it('should generate valid SongView objects', () => {
      fc.assert(
        fc.property(songViewArbitrary, (song: SongView) => {
          return (
            typeof song.id === 'string' &&
            song.id.length > 0 &&
            typeof song.title === 'string' &&
            typeof song.license === 'string' &&
            typeof song.streamLink === 'string' &&
            song.streamLink.length > 0 &&
            typeof song.albumId === 'string' &&
            song.albumId.length > 0 &&
            typeof song.albumTitle === 'string' &&
            typeof song.releaseYear === 'number' &&
            typeof song.hasContentId === 'boolean' &&
            typeof song.albumArtwork === 'string'
          );
        })
      );
    });

    it('songArbitrary should be an alias for songViewArbitrary', () => {
      fc.assert(
        fc.property(songArbitrary, (song: SongView) => {
          return (
            typeof song.id === 'string' &&
            typeof song.albumId === 'string' &&
            typeof song.albumTitle === 'string' &&
            typeof song.releaseYear === 'number'
          );
        })
      );
    });
  });

  describe('uniqueSongsArbitrary', () => {
    it('should generate songs with unique IDs', () => {
      fc.assert(
        fc.property(uniqueSongsArbitrary(1, 20), (songs: SongView[]) => {
          const ids = songs.map(song => song.id);
          const uniqueIds = new Set(ids);
          return ids.length === uniqueIds.size;
        })
      );
    });

    it('should respect min/max length bounds', () => {
      fc.assert(
        fc.property(uniqueSongsArbitrary(2, 5), (songs: SongView[]) => {
          return songs.length >= 2 && songs.length <= 5;
        })
      );
    });
  });

  describe('creatorFriendlySongArbitrary', () => {
    it('should generate SongView objects with creator-friendly licenses', () => {
      fc.assert(
        fc.property(creatorFriendlySongArbitrary, (song: SongView) => {
          return CREATOR_FRIENDLY_LICENSES.includes(song.license);
        })
      );
    });

    it('should generate valid SongView structure', () => {
      fc.assert(
        fc.property(creatorFriendlySongArbitrary, (song: SongView) => {
          return (
            typeof song.id === 'string' &&
            typeof song.title === 'string' &&
            typeof song.streamLink === 'string' &&
            typeof song.albumId === 'string' &&
            typeof song.albumTitle === 'string' &&
            typeof song.releaseYear === 'number' &&
            typeof song.hasContentId === 'boolean' &&
            typeof song.albumArtwork === 'string'
          );
        })
      );
    });
  });

  describe('nonCreatorFriendlySongArbitrary', () => {
    it('should generate SongView objects with non-creator-friendly licenses', () => {
      fc.assert(
        fc.property(nonCreatorFriendlySongArbitrary, (song: SongView) => {
          return !CREATOR_FRIENDLY_LICENSES.includes(song.license);
        })
      );
    });

    it('should generate valid SongView structure', () => {
      fc.assert(
        fc.property(nonCreatorFriendlySongArbitrary, (song: SongView) => {
          return (
            typeof song.id === 'string' &&
            typeof song.title === 'string' &&
            typeof song.streamLink === 'string' &&
            typeof song.albumId === 'string' &&
            typeof song.albumTitle === 'string' &&
            typeof song.releaseYear === 'number' &&
            typeof song.hasContentId === 'boolean' &&
            typeof song.albumArtwork === 'string'
          );
        })
      );
    });
  });
});
