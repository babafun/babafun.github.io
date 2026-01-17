/**
 * Custom fast-check arbitraries for music portfolio testing
 * 
 * These generators create realistic test data for Song, Album, and MusicData types
 * following the constraints and patterns expected by the application.
 */

import * as fc from 'fast-check';
import type { Song, Album, MusicData, ReleaseType } from '../src/types/music';

/**
 * Arbitrary for ReleaseType enum
 */
export const releaseTypeArbitrary = fc.constantFrom<ReleaseType>(
  'Independent', 
  'NCS', 
  'Monstercat'
);

/**
 * Arbitrary for license strings
 * Includes common license types that appear in real music data
 */
export const licenseArbitrary = fc.oneof(
  fc.constant(''),                    // Empty license (common)
  fc.constant('CC BY 4.0'),          // Creative Commons Attribution
  fc.constant('CC BY-SA 4.0'),       // Creative Commons Attribution-ShareAlike
  fc.constant('CC BY 3.0'),          // Older CC version
  fc.constant('CC BY-SA 3.0'),       // Older CC ShareAlike version
  fc.constant('CC0 1.0'),            // Public Domain
  fc.constant('CC0'),                // Public Domain (short form)
  fc.constant('BGML-P'),             // Babafun Game Music License - Permissive
  fc.constant('All Rights Reserved'), // Traditional copyright
  fc.constant('Custom License'),      // Generic custom license
  // Generate some random license strings for edge case testing
  fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)
);

/**
 * Arbitrary for streaming URLs
 * Generates realistic streaming platform URLs
 */
export const streamingLinkArbitrary = fc.oneof(
  // Common streaming platforms
  fc.string({ minLength: 5, maxLength: 20 }).map(id => `https://push.fm/${id}`),
  fc.string({ minLength: 5, maxLength: 20 }).map(id => `https://spotify.com/track/${id}`),
  fc.string({ minLength: 5, maxLength: 20 }).map(id => `https://soundcloud.com/artist/${id}`),
  fc.string({ minLength: 5, maxLength: 20 }).map(id => `https://youtube.com/watch?v=${id}`),
  fc.string({ minLength: 5, maxLength: 20 }).map(id => `https://bandcamp.com/track/${id}`),
  // Generic URLs for edge case testing
  fc.webUrl()
);

/**
 * Arbitrary for song titles
 * Generates realistic song titles with various patterns
 */
export const songTitleArbitrary = fc.oneof(
  // Simple titles
  fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  // Common song title patterns
  fc.constantFrom(
    'Midnight Dreams',
    'Electric Pulse',
    'Neon Lights',
    'Digital Horizon',
    'Synthwave Journey',
    'Retro Future',
    'Cosmic Dance',
    'Urban Nights',
    'Crystal Clear',
    'Infinite Loop'
  ),
  // Titles with special characters
  fc.string({ minLength: 1, maxLength: 30 }).map(s => `${s} (Remix)`),
  fc.string({ minLength: 1, maxLength: 30 }).map(s => `${s} - Extended Mix`),
  fc.string({ minLength: 1, maxLength: 30 }).map(s => `${s} [VIP]`)
);

/**
 * Arbitrary for album names
 * Generates realistic album names
 */
export const albumNameArbitrary = fc.oneof(
  // Simple album names
  fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  // Common album name patterns
  fc.constantFrom(
    'Debut Album',
    'Electronic Dreams',
    'Synthwave Collection',
    'Digital Memories',
    'Neon Nights',
    'Retro Vibes',
    'Future Bass',
    'Ambient Spaces',
    'Dance Floor',
    'Midnight Sessions'
  )
);

/**
 * Arbitrary for unique song IDs
 * Generates UUID-like strings for song identification
 */
export const songIdArbitrary = fc.uuid();

/**
 * Arbitrary for Song objects
 * Creates realistic song data with all required fields
 */
export const songArbitrary: fc.Arbitrary<Song> = fc.record({
  id: songIdArbitrary,
  title: songTitleArbitrary,
  albumName: albumNameArbitrary,
  releaseType: releaseTypeArbitrary,
  hasContentId: fc.boolean(),
  streamingLink: streamingLinkArbitrary,
  license: licenseArbitrary
});

/**
 * Arbitrary for Album objects
 * Creates albums with realistic song collections
 */
export const albumArbitrary: fc.Arbitrary<Album> = fc.record({
  name: albumNameArbitrary,
  songs: fc.array(songArbitrary, { minLength: 1, maxLength: 15 })
});

/**
 * Arbitrary for MusicData objects
 * Creates complete music data structures with songs and albums
 * Ensures albums are derived from the songs (maintains consistency)
 */
export const musicDataArbitrary: fc.Arbitrary<MusicData> = fc.array(songArbitrary, { minLength: 0, maxLength: 50 })
  .map(songs => {
    // Group songs by album name to create albums array
    const albumMap = new Map<string, Song[]>();
    
    for (const song of songs) {
      if (!albumMap.has(song.albumName)) {
        albumMap.set(song.albumName, []);
      }
      albumMap.get(song.albumName)!.push(song);
    }
    
    const albums: Album[] = Array.from(albumMap.entries()).map(([name, albumSongs]) => ({
      name,
      songs: albumSongs
    }));
    
    return {
      songs,
      albums
    };
  });

/**
 * Arbitrary for songs with unique IDs
 * Ensures all generated songs have unique identifiers
 */
export const uniqueSongsArbitrary = (minLength: number = 0, maxLength: number = 50): fc.Arbitrary<Song[]> => {
  return fc.array(songArbitrary, { minLength, maxLength })
    .map(songs => {
      // Ensure unique IDs by regenerating duplicates
      const usedIds = new Set<string>();
      const uniqueSongs: Song[] = [];
      
      for (const song of songs) {
        let uniqueId = song.id;
        let counter = 1;
        
        // If ID is already used, append a counter
        while (usedIds.has(uniqueId)) {
          uniqueId = `${song.id}-${counter}`;
          counter++;
        }
        
        usedIds.add(uniqueId);
        uniqueSongs.push({ ...song, id: uniqueId });
      }
      
      return uniqueSongs;
    });
};

/**
 * Arbitrary for creator-friendly songs
 * Generates songs that should pass the creator-friendly filter
 */
export const creatorFriendlySongArbitrary: fc.Arbitrary<Song> = fc.record({
  id: songIdArbitrary,
  title: songTitleArbitrary,
  albumName: albumNameArbitrary,
  releaseType: fc.oneof(
    fc.constant<ReleaseType>('NCS'),  // NCS releases are always creator-friendly
    releaseTypeArbitrary              // Other release types might be creator-friendly based on license
  ),
  hasContentId: fc.boolean(),
  streamingLink: streamingLinkArbitrary,
  license: fc.oneof(
    fc.constant('CC BY 4.0'),        // Commercial CC licenses
    fc.constant('CC BY-SA 4.0'),
    fc.constant('CC BY 3.0'),
    fc.constant('CC BY-SA 3.0'),
    fc.constant('CC0 1.0'),
    fc.constant('CC0'),
    fc.constant('BGML-P'),           // BGML-P license
    licenseArbitrary                 // Mix in other licenses for variety
  )
});

/**
 * Arbitrary for non-creator-friendly songs
 * Generates songs that should NOT pass the creator-friendly filter
 */
export const nonCreatorFriendlySongArbitrary: fc.Arbitrary<Song> = fc.record({
  id: songIdArbitrary,
  title: songTitleArbitrary,
  albumName: albumNameArbitrary,
  releaseType: fc.constantFrom<ReleaseType>('Independent', 'Monstercat'), // Not NCS
  hasContentId: fc.boolean(),
  streamingLink: streamingLinkArbitrary,
  license: fc.oneof(
    fc.constant('All Rights Reserved'),
    fc.constant('Custom License'),
    fc.constant(''),                 // Empty license
    fc.string({ minLength: 1, maxLength: 30 }).filter(s => 
      !s.match(/^CC BY/i) && 
      !s.match(/^CC0/i) && 
      s !== 'BGML-P'
    )
  )
});

/**
 * Arbitrary for color pairs (text and background)
 * Used for testing color contrast requirements
 */
export const colorPairArbitrary = fc.record({
  text: fc.oneof(
    fc.constant('#ffffff'),    // White text
    fc.constant('#000000'),    // Black text
    fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'), { minLength: 6, maxLength: 6 }).map(chars => `#${chars.join('')}`)
  ),
  background: fc.oneof(
    fc.constant('#000000'),    // Black background
    fc.constant('#ffffff'),    // White background
    fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'), { minLength: 6, maxLength: 6 }).map(chars => `#${chars.join('')}`)
  )
});

/**
 * Arbitrary for viewport widths
 * Generates widths within supported responsive design ranges
 */
export const viewportWidthArbitrary = (min: number = 320, max: number = 2560): fc.Arbitrary<number> => {
  return fc.integer({ min, max });
};

/**
 * Arbitrary for view states
 * Generates valid view state strings for navigation testing
 */
export const viewStateArbitrary = fc.constantFrom('discography', 'songs', 'creator');

// Export all arbitraries for easy importing
export const arbitraries = {
  releaseType: releaseTypeArbitrary,
  license: licenseArbitrary,
  streamingLink: streamingLinkArbitrary,
  songTitle: songTitleArbitrary,
  albumName: albumNameArbitrary,
  songId: songIdArbitrary,
  song: songArbitrary,
  album: albumArbitrary,
  musicData: musicDataArbitrary,
  uniqueSongs: uniqueSongsArbitrary,
  creatorFriendlySong: creatorFriendlySongArbitrary,
  nonCreatorFriendlySong: nonCreatorFriendlySongArbitrary,
  colorPair: colorPairArbitrary,
  viewportWidth: viewportWidthArbitrary,
  viewState: viewStateArbitrary
};

export default arbitraries;