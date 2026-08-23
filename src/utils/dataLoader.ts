/**
 * TypeScript Data Loader
 *
 * Loads and validates music data using pure JavaScript.
 * The data format is an album-first top-level array (Album[]).
 */

import type { Album, MusicData } from '../types/music';

/**
 * Error thrown when data loading or validation fails.
 */
export class DataLoaderError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'DataLoaderError';
  }
}

/**
 * Validates that data is an array of albums.
 * Returns an error string if invalid, empty string if valid.
 */
function validateMusicDataJS(data: unknown): string {
  try {
    if (!Array.isArray(data)) {
      return 'Music data must be a top-level array of albums';
    }

    for (let i = 0; i < data.length; i++) {
      const album = data[i];
      const err = validateAlbumJS(album);
      if (err) {
        return `Album ${i}: ${err}`;
      }
    }

    // Check for duplicate album IDs
    const albumIds = data.map((a: any) => a.id);
    if (albumIds.length !== new Set(albumIds).size) {
      return 'Duplicate album IDs found';
    }

    // Check for duplicate track IDs across all albums
    const trackIds = data.flatMap((a: any) =>
      Array.isArray(a.tracks) ? a.tracks.map((t: any) => t.id) : []
    );
    if (trackIds.length !== new Set(trackIds).size) {
      return 'Duplicate track IDs found';
    }

    return '';
  } catch (error) {
    return `Validation error: ${error}`;
  }
}

/**
 * Validates a single album object.
 */
function validateAlbumJS(album: any): string {
  if (!album || typeof album !== 'object') {
    return 'Album must be an object';
  }

  const requiredFields = ['id', 'title', 'releaseYear', 'streamLink', 'hasContentId', 'albumArtwork', 'tracks'];
  for (const field of requiredFields) {
    if (!(field in album)) {
      return `Missing required field: ${field}`;
    }
  }

  if (typeof album.id !== 'string') return 'id must be a string';
  if (typeof album.title !== 'string') return 'title must be a string';
  if (typeof album.releaseYear !== 'number') return 'releaseYear must be a number';
  if (typeof album.streamLink !== 'string') return 'streamLink must be a string';
  if (typeof album.hasContentId !== 'boolean') return 'hasContentId must be a boolean';
  if (typeof album.albumArtwork !== 'string') return 'albumArtwork must be a string';
  if (!Array.isArray(album.tracks)) return 'tracks must be an array';

  for (let i = 0; i < album.tracks.length; i++) {
    const err = validateTrackJS(album.tracks[i]);
    if (err) return `Track ${i}: ${err}`;
  }

  return '';
}

/**
 * Validates a single track object.
 */
function validateTrackJS(track: any): string {
  if (!track || typeof track !== 'object') return 'Track must be an object';
  if (typeof track.id !== 'string') return 'id must be a string';
  if (typeof track.title !== 'string') return 'title must be a string';
  if (typeof track.license !== 'string') return 'license must be a string';
  return '';
}

/**
 * DataLoader class for loading and processing music data.
 */
export class DataLoader {
  private static instance: DataLoader | null = null;

  public static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader();
    }
    return DataLoader.instance;
  }

  private constructor() {}

  /**
   * Loads and validates music data from a JSON file.
   * Expects the file to contain a top-level array of Album objects.
   *
   * @param jsonPath - Path to the JSON file (defaults to '/data/music.json')
   * @returns Promise<Album[]> - Validated album array
   * @throws DataLoaderError if loading or validation fails
   */
  public async loadMusicData(jsonPath: string = '/data/music.json'): Promise<MusicData> {
    try {
      const response = await fetch(jsonPath);
      if (!response.ok) {
        throw new DataLoaderError(
          `Failed to fetch music data: ${response.status} ${response.statusText}`
        );
      }

      const jsonText = await response.text();

      // Parse JSON
      let rawData: unknown;
      try {
        rawData = JSON.parse(jsonText);
      } catch (parseError) {
        throw new DataLoaderError(
          'Failed to parse JSON data',
          parseError instanceof Error ? parseError : new Error(String(parseError))
        );
      }

      // Validate
      const validationError = validateMusicDataJS(rawData);

      if (validationError) {
        throw new DataLoaderError(`Data validation failed: ${validationError}`);
      }

      return rawData as Album[];
    } catch (error) {
      if (error instanceof DataLoaderError) throw error;
      throw new DataLoaderError(
        'Unexpected error during data loading',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Validates a raw JSON string containing music data.
   *
   * @param jsonText - Raw JSON string to validate
   * @returns Promise<boolean> - true if valid
   * @throws DataLoaderError if validation fails
   */
  public async validateRawData(jsonText: string): Promise<boolean> {
    try {
      let rawData: unknown;
      try {
        rawData = JSON.parse(jsonText);
      } catch (parseError) {
        throw new DataLoaderError(
          'Failed to parse JSON data',
          parseError instanceof Error ? parseError : new Error(String(parseError))
        );
      }

      const validationError = validateMusicDataJS(rawData);

      if (validationError) {
        throw new DataLoaderError(`Validation failed: ${validationError}`);
      }

      return true;
    } catch (error) {
      if (error instanceof DataLoaderError) throw error;
      throw new DataLoaderError(
        'Unexpected error during validation',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}

/**
 * Convenience function to load music data.
 */
export async function loadMusicData(jsonPath?: string): Promise<MusicData> {
  return DataLoader.getInstance().loadMusicData(jsonPath);
}

/**
 * Convenience function to validate raw JSON data.
 */
export async function validateMusicDataString(jsonText: string): Promise<boolean> {
  return DataLoader.getInstance().validateRawData(jsonText);
}

export default DataLoader;
