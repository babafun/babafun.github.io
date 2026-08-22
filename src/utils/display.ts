/**
 * Display Logic Utilities
 *
 * Utility functions for determining what information should be displayed
 * in the UI based on data content and business rules.
 *
 * Validates Requirements 4.5, 4.6
 */

import type { SongView } from '../types/music';

/**
 * Determines if a license should be displayed.
 * License is displayed only if the license field is non-empty.
 */
export function shouldDisplayLicense(license: string): boolean {
  return license.trim() !== '';
}

/**
 * Determines if a SongView is creator-friendly.
 * A song is creator-friendly if it has a commercial CC license or BGML-P license.
 */
export function isCreatorFriendlySong(song: SongView): boolean {
  const license = (song.license || '').toLowerCase().trim();
  return (
    /^cc by( \d+\.\d+)?$/.test(license) ||
    /^cc by-sa( \d+\.\d+)?$/.test(license) ||
    /^cc0( \d+\.\d+)?$/.test(license) ||
    license === 'bgml-p'
  );
}

/**
 * Gets a human-readable description of why a song is creator-friendly.
 * Returns null if not creator-friendly.
 */
export function getCreatorFriendlyReason(song: SongView): string | null {
  const license = (song.license || '').toLowerCase().trim();

  if (/^cc by( \d+\.\d+)?$/.test(license) || /^cc by-sa( \d+\.\d+)?$/.test(license)) {
    return `Creative Commons License (${song.license})`;
  }

  if (/^cc0( \d+\.\d+)?$/.test(license)) {
    return `Public Domain (${song.license || 'CC0'})`;
  }

  if (license === 'bgml-p') {
    return 'BGML-P License - Permissive for games';
  }

  return null;
}

/**
 * Gets a human-readable description of Content ID status.
 */
export function getContentIdDescription(hasContentId: boolean): string {
  return hasContentId
    ? 'This song has YouTube Content ID enabled and may claim revenue on videos using it'
    : 'This song does not have YouTube Content ID and is safe for video use';
}

/**
 * Formats a release label for display.
 * Returns 'Self-released' if label is absent or empty.
 */
export function formatReleaseLabel(releaseLabel?: string): string {
  if (!releaseLabel || releaseLabel.trim() === '') return 'Self-released';
  return releaseLabel.trim();
}

/**
 * Formats a release type string for display.
 * Kept for backwards compatibility with existing tests.
 */
export function formatReleaseType(releaseType: string): string {
  if (!releaseType || releaseType.trim() === '') return 'Unknown Release';
  switch (releaseType.trim()) {
    case 'NCS': return 'NCS (No Copyright Sounds)';
    case 'Independent': return 'Independent Release';
    case 'Monstercat': return 'Monstercat Release';
    default: return releaseType.trim() || 'Unknown Release';
  }
}

/**
 * Gets the CSS badge class for a release type.
 */
export function getReleaseTypeBadgeClass(releaseType: string): string {
  return `badge ${releaseType.toLowerCase()}`;
}

/**
 * Determines if a streaming link is valid and should be displayed.
 */
export function shouldDisplayStreamingLink(streamingLink: string): boolean {
  if (!streamingLink || streamingLink.trim() === '') return false;
  try {
    const url = new URL(streamingLink);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Gets the display text for a streaming link based on the URL.
 */
export function getStreamingLinkText(streamingLink: string): string {
  try {
    const url = new URL(streamingLink);
    const hostname = url.hostname.toLowerCase();

    if (hostname.includes('spotify')) return 'Listen on Spotify';
    if (hostname.includes('youtube') || hostname.includes('youtu.be')) return 'Watch on YouTube';
    if (hostname.includes('soundcloud')) return 'Listen on SoundCloud';
    if (hostname.includes('bandcamp')) return 'Listen on Bandcamp';
    if (hostname.includes('push.fm')) return 'Listen on Push.fm';
    if (hostname.includes('ncs.io')) return 'Listen on NCS';
    if (hostname.includes('monstercat')) return 'Listen on Monstercat';
    return 'Listen Now';
  } catch {
    return 'Listen Now';
  }
}

/**
 * Filters SongViews based on display criteria.
 */
export function filterSongsForDisplay(songs: SongView[], showOnlyCreatorFriendly = false): SongView[] {
  if (!showOnlyCreatorFriendly) return songs;
  return songs.filter(song => isCreatorFriendlySong(song));
}

/**
 * Sorts SongViews for optimal display order.
 */
export function sortSongsForDisplay(
  songs: SongView[],
  sortBy: 'title' | 'album' | 'year' = 'title'
): SongView[] {
  return [...songs].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'album':
        return a.albumTitle.localeCompare(b.albumTitle) || a.title.localeCompare(b.title);
      case 'year':
        return b.releaseYear - a.releaseYear || a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
}
