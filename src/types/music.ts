/**
 * TypeScript interfaces for the music portfolio application.
 * These interfaces match the Rust structs and define the data structure
 * for songs, albums, and music data throughout the application.
 */

/**
 * Release type classification for songs
 */
export type ReleaseType = 'Independent' | 'NCS' | 'Monstercat';

/**
 * Song interface representing a single music track
 */
export interface Song {
  /** Unique identifier for the song */
  id: string;
  
  /** Title of the song */
  title: string;
  
  /** Name of the album this song belongs to */
  albumName: string;
  
  /** Type of release (Independent, NCS, or Monstercat) */
  releaseType: ReleaseType;
  
  /** Whether the song has YouTube Content ID enabled */
  hasContentId: boolean;
  
  /** URL to streaming platform for the song */
  streamingLink: string;
  
  /** License information (can be empty string) */
  license: string;
}

/**
 * Album interface representing a collection of songs
 */
export interface Album {
  /** Name of the album */
  name: string;
  
  /** Array of songs in this album */
  songs: Song[];
}

/**
 * Main music data structure containing all songs and albums
 */
export interface MusicData {
  /** Array of all songs in the portfolio */
  songs: Song[];
  
  /** Array of albums (derived from songs grouped by album name) */
  albums: Album[];
}