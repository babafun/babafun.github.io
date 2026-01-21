/**
 * Display Logic Utilities
 * 
 * This module provides utility functions for determining what information
 * should be displayed in the UI based on data content and business rules.
 * 
 * Validates Requirements 4.5, 4.6
 */

import type { Song } from '../types/music';

/**
 * Determines if a license should be displayed
 * 
 * According to Requirements 4.5 and 4.6:
 * - License is displayed only if the license field is non-empty
 * - Empty string licenses should be omitted from display
 * 
 * @param license - License string to check
 * @returns true if license should be displayed, false otherwise
 */
export function shouldDisplayLicense(license: string): boolean {
  return license.trim() !== '';
}

/**
 * Determines if a song is creator-friendly based on its properties
 * 
 * A song is considered creator-friendly if ANY of these conditions are true:
 * 1. Release type is 'NCS'
 * 2. License contains commercial CC patterns (CC BY, CC BY-SA, CC0)
 * 3. License is 'BGML-P'
 * 
 * @param song - Song to evaluate
 * @returns true if song is creator-friendly, false otherwise
 */
export function isCreatorFriendlySong(song: Song): boolean {
  // NCS releases are always creator-friendly
  if (song.releaseType === 'NCS') {
    return true;
  }
  
  // Check for commercial CC licenses (case-insensitive)
  // Handle null/undefined license gracefully
  const license = (song.license || '').toLowerCase().trim();
  if (license.includes('cc by') || license.includes('cc0') || license === 'bgml-p') {
    return true;
  }
  
  return false;
}

/**
 * Gets a human-readable description of why a song is creator-friendly
 * 
 * @param song - Song to analyze
 * @returns Description string or null if not creator-friendly
 */
export function getCreatorFriendlyReason(song: Song): string | null {
  if (song.releaseType === 'NCS') {
    return 'NCS Release - Free for creators';
  }
  
  // Handle null/undefined license gracefully
  const license = (song.license || '').toLowerCase().trim();
  if (license.includes('cc by')) {
    return `Creative Commons License (${song.license || 'CC BY'})`;
  }
  
  if (license.includes('cc0')) {
    return `Public Domain (${song.license || 'CC0'})`;
  }
  
  if (license === 'bgml-p') {
    return 'BGML-P License - Permissive for games';
  }
  
  return null;
}

/**
 * Gets a human-readable description of Content ID status
 * 
 * @param hasContentId - Whether the song has Content ID enabled
 * @returns Description string explaining Content ID implications
 */
export function getContentIdDescription(hasContentId: boolean): string {
  return hasContentId 
    ? 'This song has YouTube Content ID enabled and may claim revenue on videos using it'
    : 'This song does not have YouTube Content ID and is safe for video use';
}

/**
 * Formats a release type for display with proper capitalization
 * 
 * @param releaseType - Release type to format
 * @returns Formatted release type string
 */
export function formatReleaseType(releaseType: string): string {
  // Handle empty or invalid input
  if (!releaseType || releaseType.trim() === '') {
    return 'Unknown Release';
  }
  
  switch (releaseType.trim()) {
    case 'NCS':
      return 'NCS (No Copyright Sounds)';
    case 'Independent':
      return 'Independent Release';
    case 'Monstercat':
      return 'Monstercat Release';
    default:
      return releaseType.trim() || 'Unknown Release';
  }
}

/**
 * Determines the appropriate CSS class for a release type badge
 * 
 * @param releaseType - Release type
 * @returns CSS class name for styling the badge
 */
export function getReleaseTypeBadgeClass(releaseType: string): string {
  return `badge ${releaseType.toLowerCase()}`;
}

/**
 * Determines if a streaming link is valid and should be displayed
 * 
 * @param streamingLink - URL to validate
 * @returns true if link is valid and should be displayed
 */
export function shouldDisplayStreamingLink(streamingLink: string): boolean {
  if (!streamingLink || streamingLink.trim() === '') {
    return false;
  }
  
  try {
    new URL(streamingLink);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the display text for a streaming link based on the URL
 * 
 * @param streamingLink - URL to analyze
 * @returns User-friendly text for the link
 */
export function getStreamingLinkText(streamingLink: string): string {
  try {
    const url = new URL(streamingLink);
    const hostname = url.hostname.toLowerCase();
    
    if (hostname.includes('spotify')) {
      return '🎵 Listen on Spotify';
    } else if (hostname.includes('youtube') || hostname.includes('youtu.be')) {
      return '🎵 Watch on YouTube';
    } else if (hostname.includes('soundcloud')) {
      return '🎵 Listen on SoundCloud';
    } else if (hostname.includes('bandcamp')) {
      return '🎵 Listen on Bandcamp';
    } else if (hostname.includes('push.fm')) {
      return '🎵 Listen on Push.fm';
    } else if (hostname.includes('ncs.io')) {
      return '🎵 Listen on NCS';
    } else if (hostname.includes('monstercat')) {
      return '🎵 Listen on Monstercat';
    } else {
      return '🎵 Listen Now';
    }
  } catch {
    return '🎵 Listen Now';
  }
}

/**
 * Filters songs based on display criteria
 * 
 * @param songs - Array of songs to filter
 * @param showOnlyCreatorFriendly - Whether to show only creator-friendly songs
 * @returns Filtered array of songs
 */
export function filterSongsForDisplay(songs: Song[], showOnlyCreatorFriendly: boolean = false): Song[] {
  if (!showOnlyCreatorFriendly) {
    return songs;
  }
  
  return songs.filter(song => isCreatorFriendlySong(song));
}

/**
 * Sorts songs for optimal display order
 * 
 * @param songs - Array of songs to sort
 * @param sortBy - Sort criteria ('title' | 'album' | 'releaseType')
 * @returns Sorted array of songs
 */
export function sortSongsForDisplay(songs: Song[], sortBy: 'title' | 'album' | 'releaseType' = 'title'): Song[] {
  return [...songs].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'album':
        return a.albumName.localeCompare(b.albumName) || a.title.localeCompare(b.title);
      case 'releaseType':
        return a.releaseType.localeCompare(b.releaseType) || a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
}