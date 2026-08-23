/**
 * TypeScript Filter Utilities
 * 
 * Filter functions for music data using pure JavaScript implementation.
 * Operates on SongView objects (flattened album-track views).
 */

import type { SongView } from '../types/music';

/**
 * Filters songs to only creator-friendly ones.
 * A song is creator-friendly if it has a commercial CC license or a BGML-P license.
 */
export function filterCreatorFriendly(songs: SongView[]): SongView[] {
  return songs.filter(isCreatorFriendlySong);
}

/**
 * Checks if a license string represents a commercial Creative Commons license.
 * Recognizes CC BY, CC BY-SA, and CC0 (with optional version numbers).
 */
export function isCommercialCCLicense(license: string): boolean {
  if (!license || typeof license !== 'string') return false;
  const trimmed = license.trim().toLowerCase();
  return (
    /^cc by( \d+\.\d+)?$/.test(trimmed) ||
    /^cc by-sa( \d+\.\d+)?$/.test(trimmed) ||
    /^cc0( \d+\.\d+)?$/.test(trimmed)
  );
}

/**
 * Checks if a license string is BGML-P (Babafun Game Music License - Permissive).
 */
export function isBGMLPLicense(license: string): boolean {
  if (!license || typeof license !== 'string') return false;
  return license.trim().toLowerCase() === 'bgml-p';
}

/**
 * Checks if a single SongView is creator-friendly.
 */
export function isCreatorFriendlySong(song: SongView): boolean {
  return isCommercialCCLicense(song.license) || isBGMLPLicense(song.license);
}

/**
 * Batch check multiple songs for creator-friendliness.
 * Returns a boolean array aligned with the input array.
 */
export function batchCheckCreatorFriendly(songs: SongView[]): boolean[] {
  return songs.map(isCreatorFriendlySong);
}
