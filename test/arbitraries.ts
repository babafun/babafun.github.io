/**
 * Custom fast-check arbitraries for music portfolio testing
 *
 * These generators create realistic test data for Track, Album, SongView, and MusicData types
 * following the constraints and patterns expected by the application.
 */

import * as fc from 'fast-check';
import type { Track, Album, MusicData, SongView } from '../src/types/music';

// ---------------------------------------------------------------------------
// License arbitraries
// ---------------------------------------------------------------------------

export const licenseArbitrary = fc.oneof(
  fc.constant(''),
  fc.constant('CC BY 4.0'),
  fc.constant('CC BY-SA 4.0'),
  fc.constant('CC BY 3.0'),
  fc.constant('CC BY-SA 3.0'),
  fc.constant('CC0 1.0'),
  fc.constant('CC0'),
  fc.constant('BGML-P'),
  fc.constant('All Rights Reserved'),
  fc.constant('Custom License'),
  fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)
);

// ---------------------------------------------------------------------------
// URL arbitraries
// ---------------------------------------------------------------------------

export const streamingLinkArbitrary = fc.oneof(
  fc.string({ minLength: 5, maxLength: 20 }).map(id => `https://push.fm/${id}`),
  fc.string({ minLength: 5, maxLength: 20 }).map(id => `https://spotify.com/track/${id}`),
  fc.string({ minLength: 5, maxLength: 20 }).map(id => `https://soundcloud.com/artist/${id}`),
  fc.string({ minLength: 5, maxLength: 20 }).map(id => `https://youtube.com/watch?v=${id}`),
  fc.string({ minLength: 5, maxLength: 20 }).map(id => `https://bandcamp.com/track/${id}`),
  fc.webUrl()
);

// ---------------------------------------------------------------------------
// Title / name arbitraries
// ---------------------------------------------------------------------------

export const songTitleArbitrary = fc.oneof(
  fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  fc.constantFrom(
    'Midnight Dreams', 'Electric Pulse', 'Neon Lights', 'Digital Horizon',
    'Synthwave Journey', 'Retro Future', 'Cosmic Dance', 'Urban Nights',
    'Crystal Clear', 'Infinite Loop'
  ),
  fc.string({ minLength: 1, maxLength: 30 }).map(s => `${s} (Remix)`),
  fc.string({ minLength: 1, maxLength: 30 }).map(s => `${s} - Extended Mix`)
);

export const albumNameArbitrary = fc.oneof(
  fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  fc.constantFrom(
    'Debut Album', 'Electronic Dreams', 'Synthwave Collection', 'Digital Memories',
    'Neon Nights', 'Retro Vibes', 'Future Bass', 'Ambient Spaces',
    'Dance Floor', 'Midnight Sessions'
  )
);

export const songIdArbitrary = fc.uuid();

// ---------------------------------------------------------------------------
// Track arbitrary
// ---------------------------------------------------------------------------

export const trackArbitrary: fc.Arbitrary<Track> = fc.record({
  id: songIdArbitrary,
  title: songTitleArbitrary,
  license: licenseArbitrary,
  overrideStreamLink: fc.option(streamingLinkArbitrary, { nil: undefined })
});

// ---------------------------------------------------------------------------
// Album arbitrary
// ---------------------------------------------------------------------------

export const albumArbitrary: fc.Arbitrary<Album> = fc.record({
  id: songIdArbitrary,
  title: albumNameArbitrary,
  releaseYear: fc.integer({ min: 2020, max: 2024 }),
  streamLink: streamingLinkArbitrary,
  hasContentId: fc.boolean(),
  releaseLabel: fc.option(albumNameArbitrary, { nil: undefined }),
  albumArtwork: streamingLinkArbitrary,
  tracks: fc.array(trackArbitrary, { minLength: 1, maxLength: 15 })
});

// ---------------------------------------------------------------------------
// MusicData arbitrary (Album[])
// ---------------------------------------------------------------------------

export const musicDataArbitrary: fc.Arbitrary<MusicData> = fc.array(albumArbitrary, {
  minLength: 0,
  maxLength: 10
});

// ---------------------------------------------------------------------------
// SongView arbitrary (flattened track + album context)
// ---------------------------------------------------------------------------

export const songViewArbitrary: fc.Arbitrary<SongView> = fc.record({
  id: songIdArbitrary,
  title: songTitleArbitrary,
  license: licenseArbitrary,
  streamLink: streamingLinkArbitrary,
  albumId: songIdArbitrary,
  albumTitle: albumNameArbitrary,
  releaseYear: fc.integer({ min: 2020, max: 2024 }),
  hasContentId: fc.boolean(),
  releaseLabel: fc.option(albumNameArbitrary, { nil: undefined }),
  albumArtwork: streamingLinkArbitrary
});

// Alias for backwards compatibility in tests that use songArbitrary
export const songArbitrary = songViewArbitrary;

// ---------------------------------------------------------------------------
// Unique SongViews arbitrary
// ---------------------------------------------------------------------------

export const uniqueSongsArbitrary = (
  minLength: number = 0,
  maxLength: number = 50
): fc.Arbitrary<SongView[]> => {
  return fc.array(songViewArbitrary, { minLength, maxLength }).map(songs => {
    const usedIds = new Set<string>();
    return songs.map(song => {
      let uniqueId = song.id;
      let counter = 1;
      while (usedIds.has(uniqueId)) {
        uniqueId = `${song.id}-${counter++}`;
      }
      usedIds.add(uniqueId);
      return { ...song, id: uniqueId };
    });
  });
};

// ---------------------------------------------------------------------------
// Creator-friendly / non-creator-friendly SongView arbitraries
// ---------------------------------------------------------------------------

export const creatorFriendlySongArbitrary: fc.Arbitrary<SongView> = fc.record({
  id: songIdArbitrary,
  title: songTitleArbitrary,
  license: fc.oneof(
    fc.constant('CC BY 4.0'),
    fc.constant('CC BY-SA 4.0'),
    fc.constant('CC BY 3.0'),
    fc.constant('CC BY-SA 3.0'),
    fc.constant('CC0 1.0'),
    fc.constant('CC0'),
    fc.constant('BGML-P')
  ),
  streamLink: streamingLinkArbitrary,
  albumId: songIdArbitrary,
  albumTitle: albumNameArbitrary,
  releaseYear: fc.integer({ min: 2020, max: 2024 }),
  hasContentId: fc.boolean(),
  releaseLabel: fc.option(albumNameArbitrary, { nil: undefined }),
  albumArtwork: streamingLinkArbitrary
});

export const nonCreatorFriendlySongArbitrary: fc.Arbitrary<SongView> = fc.record({
  id: songIdArbitrary,
  title: songTitleArbitrary,
  license: fc.oneof(
    fc.constant('All Rights Reserved'),
    fc.constant('Custom License'),
    fc.constant(''),
    fc.string({ minLength: 1, maxLength: 30 }).filter(s =>
      !s.match(/^CC BY/i) &&
      !s.match(/^CC0/i) &&
      s.toLowerCase().trim() !== 'bgml-p'
    )
  ),
  streamLink: streamingLinkArbitrary,
  albumId: songIdArbitrary,
  albumTitle: albumNameArbitrary,
  releaseYear: fc.integer({ min: 2020, max: 2024 }),
  hasContentId: fc.boolean(),
  releaseLabel: fc.option(albumNameArbitrary, { nil: undefined }),
  albumArtwork: streamingLinkArbitrary
});

// ---------------------------------------------------------------------------
// Color / viewport arbitraries (unchanged)
// ---------------------------------------------------------------------------

export const colorPairArbitrary = fc.record({
  text: fc.oneof(
    fc.constant('#ffffff'),
    fc.constant('#000000'),
    fc.array(
      fc.constantFrom('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'),
      { minLength: 6, maxLength: 6 }
    ).map(chars => `#${chars.join('')}`)
  ),
  background: fc.oneof(
    fc.constant('#000000'),
    fc.constant('#ffffff'),
    fc.array(
      fc.constantFrom('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'),
      { minLength: 6, maxLength: 6 }
    ).map(chars => `#${chars.join('')}`)
  )
});

export const viewportWidthArbitrary = (min = 320, max = 2560): fc.Arbitrary<number> =>
  fc.integer({ min, max });

export const viewStateArbitrary = fc.constantFrom('discography', 'songs', 'creator');

// ---------------------------------------------------------------------------
// Default export
// ---------------------------------------------------------------------------

export const arbitraries = {
  license: licenseArbitrary,
  streamingLink: streamingLinkArbitrary,
  songTitle: songTitleArbitrary,
  albumName: albumNameArbitrary,
  songId: songIdArbitrary,
  track: trackArbitrary,
  album: albumArbitrary,
  musicData: musicDataArbitrary,
  songView: songViewArbitrary,
  song: songViewArbitrary,           // alias
  uniqueSongs: uniqueSongsArbitrary,
  creatorFriendlySong: creatorFriendlySongArbitrary,
  nonCreatorFriendlySong: nonCreatorFriendlySongArbitrary,
  colorPair: colorPairArbitrary,
  viewportWidth: viewportWidthArbitrary,
  viewState: viewStateArbitrary
};

export default arbitraries;
