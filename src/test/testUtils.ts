/**
 * Test utilities providing validation functions with JavaScript fallbacks.
 * Updated for the album-first data model.
 */

import type { Album, MusicData } from '../types/music';

/**
 * JavaScript fallback for album validation
 */
function validateAlbumJS(albumJson: string): string {
  try {
    const album = JSON.parse(albumJson);
    if (!album || typeof album !== 'object') return 'Album must be an object';

    const required = ['id', 'title', 'releaseYear', 'streamLink', 'hasContentId', 'albumArtwork', 'tracks'];
    for (const field of required) {
      if (!(field in album)) return `Missing required field: ${field}`;
    }

    if (typeof album.id !== 'string') return 'id must be a string';
    if (typeof album.title !== 'string') return 'title must be a string';
    if (typeof album.releaseYear !== 'number') return 'releaseYear must be a number';
    if (typeof album.streamLink !== 'string') return 'streamLink must be a string';
    if (typeof album.hasContentId !== 'boolean') return 'hasContentId must be a boolean';
    if (typeof album.albumArtwork !== 'string') return 'albumArtwork must be a string';
    if (!Array.isArray(album.tracks)) return 'tracks must be an array';

    for (let i = 0; i < album.tracks.length; i++) {
      const track = album.tracks[i];
      if (!track || typeof track !== 'object') return `Track ${i}: must be an object`;
      if (typeof track.id !== 'string') return `Track ${i}: id must be a string`;
      if (typeof track.title !== 'string') return `Track ${i}: title must be a string`;
      if (typeof track.license !== 'string') return `Track ${i}: license must be a string`;
    }

    return '';
  } catch (error) {
    return `Invalid JSON: ${error}`;
  }
}

/**
 * JavaScript fallback for music data validation (album-first model)
 */
function validateMusicDataJS(dataJson: string): string {
  try {
    const data = JSON.parse(dataJson);

    if (!Array.isArray(data)) {
      return 'Music data must be a top-level array of albums';
    }

    for (let i = 0; i < data.length; i++) {
      const albumJson = JSON.stringify(data[i]);
      const albumError = validateAlbumJS(albumJson);
      if (albumError) return `Album ${i}: ${albumError}`;
    }

    const albumIds = data.map((a: any) => a.id);
    if (albumIds.length !== new Set(albumIds).size) return 'Duplicate album IDs found';

    const trackIds = data.flatMap((a: any) =>
      Array.isArray(a.tracks) ? a.tracks.map((t: any) => t.id) : []
    );
    if (trackIds.length !== new Set(trackIds).size) return 'Duplicate track IDs found';

    return '';
  } catch (error) {
    return `Invalid JSON: ${error}`;
  }
}

/**
 * Test-safe album validation function.
 * Uses WASM if available, falls back to JavaScript implementation.
 */
export function validateAlbum(albumJson: string): string {
  try {
    const { validateAlbum: wasmValidateAlbum } = require('../wasm/bindings');
    return wasmValidateAlbum(albumJson);
  } catch {
    return validateAlbumJS(albumJson);
  }
}

/**
 * Test-safe music data validation function.
 * Uses WASM if available, falls back to JavaScript implementation.
 */
export function validateMusicData(dataJson: string): string {
  try {
    const { validateMusicData: wasmValidateMusicData } = require('../wasm/bindings');
    return wasmValidateMusicData(dataJson);
  } catch {
    return validateMusicDataJS(dataJson);
  }
}
