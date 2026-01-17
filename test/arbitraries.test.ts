/**
 * Tests for custom fast-check arbitraries
 * Verifies that the generators produce valid data structures
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  releaseTypeArbitrary,
  licenseArbitrary,
  songArbitrary,
  albumArbitrary,
  musicDataArbitrary,
  uniqueSongsArbitrary,
  creatorFriendlySongArbitrary,
  nonCreatorFriendlySongArbitrary
} from './arbitraries';
import type { Song, Album, MusicData, ReleaseType } from '../src/types/music';

describe('Arbitraries', () => {
  describe('releaseTypeArbitrary', () => {
    it('should generate valid release types', () => {
      fc.assert(
        fc.property(releaseTypeArbitrary, (releaseType) => {
          const validTypes: ReleaseType[] = ['Independent', 'NCS', 'Monstercat'];
          return validTypes.includes(releaseType);
        })
      );
    });
  });

  describe('licenseArbitrary', () => {
    it('should generate string values', () => {
      fc.assert(
        fc.property(licenseArbitrary, (license) => {
          return typeof license === 'string';
        })
      );
    });
  });

  describe('songArbitrary', () => {
    it('should generate valid Song objects', () => {
      fc.assert(
        fc.property(songArbitrary, (song) => {
          // Check all required fields exist and have correct types
          return (
            typeof song.id === 'string' &&
            typeof song.title === 'string' &&
            typeof song.albumName === 'string' &&
            ['Independent', 'NCS', 'Monstercat'].includes(song.releaseType) &&
            typeof song.hasContentId === 'boolean' &&
            typeof song.streamingLink === 'string' &&
            typeof song.license === 'string' &&
            song.id.length > 0 &&
            song.title.trim().length > 0 &&
            song.albumName.trim().length > 0 &&
            song.streamingLink.length > 0
          );
        })
      );
    });
  });

  describe('albumArbitrary', () => {
    it('should generate valid Album objects', () => {
      fc.assert(
        fc.property(albumArbitrary, (album) => {
          return (
            typeof album.name === 'string' &&
            Array.isArray(album.songs) &&
            album.name.trim().length > 0 &&
            album.songs.length > 0 &&
            album.songs.every(song => 
              typeof song.id === 'string' &&
              typeof song.title === 'string' &&
              typeof song.albumName === 'string' &&
              ['Independent', 'NCS', 'Monstercat'].includes(song.releaseType) &&
              typeof song.hasContentId === 'boolean' &&
              typeof song.streamingLink === 'string' &&
              typeof song.license === 'string'
            )
          );
        })
      );
    });
  });

  describe('musicDataArbitrary', () => {
    it('should generate valid MusicData objects', () => {
      fc.assert(
        fc.property(musicDataArbitrary, (musicData) => {
          return (
            Array.isArray(musicData.songs) &&
            Array.isArray(musicData.albums) &&
            // All songs in albums should exist in the main songs array
            musicData.albums.every(album =>
              album.songs.every(albumSong =>
                musicData.songs.some(song => song.id === albumSong.id)
              )
            )
          );
        })
      );
    });

    it('should maintain album consistency', () => {
      fc.assert(
        fc.property(musicDataArbitrary, (musicData) => {
          // All songs in an album should have the same album name
          return musicData.albums.every(album =>
            album.songs.every(song => song.albumName === album.name)
          );
        })
      );
    });
  });

  describe('uniqueSongsArbitrary', () => {
    it('should generate songs with unique IDs', () => {
      fc.assert(
        fc.property(uniqueSongsArbitrary(1, 20), (songs) => {
          const ids = songs.map(song => song.id);
          const uniqueIds = new Set(ids);
          return ids.length === uniqueIds.size;
        })
      );
    });
  });

  describe('creatorFriendlySongArbitrary', () => {
    it('should generate songs that could be creator-friendly', () => {
      fc.assert(
        fc.property(creatorFriendlySongArbitrary, (song) => {
          // This is a basic structure test - the actual creator-friendly logic
          // will be tested in the business logic tests
          return (
            typeof song.id === 'string' &&
            typeof song.title === 'string' &&
            typeof song.albumName === 'string' &&
            ['Independent', 'NCS', 'Monstercat'].includes(song.releaseType) &&
            typeof song.hasContentId === 'boolean' &&
            typeof song.streamingLink === 'string' &&
            typeof song.license === 'string'
          );
        })
      );
    });
  });

  describe('nonCreatorFriendlySongArbitrary', () => {
    it('should generate valid Song objects', () => {
      fc.assert(
        fc.property(nonCreatorFriendlySongArbitrary, (song) => {
          return (
            typeof song.id === 'string' &&
            typeof song.title === 'string' &&
            typeof song.albumName === 'string' &&
            ['Independent', 'NCS', 'Monstercat'].includes(song.releaseType) &&
            typeof song.hasContentId === 'boolean' &&
            typeof song.streamingLink === 'string' &&
            typeof song.license === 'string' &&
            // Should not be NCS (since NCS is always creator-friendly)
            song.releaseType !== 'NCS'
          );
        })
      );
    });
  });
});