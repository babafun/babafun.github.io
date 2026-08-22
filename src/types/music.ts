/**
 * TypeScript interfaces for the music portfolio application.
 * These interfaces match the Rust structs and define the album-first data structure.
 */

export interface Track {
  id: string;
  title: string;
  license: string;
  overrideStreamLink?: string;
}

export interface Album {
  id: string;
  title: string;
  releaseYear: number;
  streamLink: string;
  hasContentId: boolean;
  releaseLabel?: string;
  albumArtwork: string;
  tracks: Track[];
}

// MusicData is just Album[]
export type MusicData = Album[];

// Flattened view of a track with its parent album context
export interface SongView {
  id: string;
  title: string;
  license: string;
  streamLink: string;       // resolved: overrideStreamLink ?? album.streamLink
  albumId: string;
  albumTitle: string;
  releaseYear: number;
  hasContentId: boolean;
  releaseLabel?: string;
  albumArtwork: string;
}
