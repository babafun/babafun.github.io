/**
 * TypeScript Data Loader (WASM Wrapper)
 * 
 * This module provides a high-level TypeScript interface for loading and validating
 * music data using the Rust/WASM backend for performance-critical operations.
 * 
 * The DataLoader class handles:
 * - Loading JSON data from files
 * - Validating data structure using WASM
 * - Grouping songs by album using WASM
 * - Error handling and type safety
 */

import { Song, Album, MusicData } from '../types/music';
import { initWasm, validateMusicData, groupByAlbum } from '../wasm/bindings';

/**
 * Error thrown when data loading or validation fails
 */
export class DataLoaderError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'DataLoaderError';
  }
}

/**
 * DataLoader class for loading and processing music data
 * Uses Rust/WASM for performance-critical validation and grouping operations
 */
export class DataLoader {
  private static instance: DataLoader | null = null;
  private wasmInitialized = false;

  /**
   * Get singleton instance of DataLoader
   */
  public static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader();
    }
    return DataLoader.instance;
  }

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Initialize WASM module if not already initialized
   */
  private async ensureWasmInitialized(): Promise<void> {
    if (!this.wasmInitialized) {
      try {
        await initWasm();
        this.wasmInitialized = true;
      } catch (error) {
        throw new DataLoaderError(
          'Failed to initialize WASM module',
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }
  }

  /**
   * Loads and validates music data from JSON file
   * Uses Rust/WASM for validation performance
   * 
   * @param jsonPath - Path to the JSON file (defaults to '/src/data/music.json')
   * @returns Promise<MusicData> - Validated and processed music data
   * @throws DataLoaderError if loading or validation fails
   */
  public async loadMusicData(jsonPath: string = '/src/data/music.json'): Promise<MusicData> {
    try {
      // Ensure WASM is initialized
      await this.ensureWasmInitialized();

      // Fetch JSON data
      const response = await fetch(jsonPath);
      if (!response.ok) {
        throw new DataLoaderError(
          `Failed to fetch music data: ${response.status} ${response.statusText}`
        );
      }

      const jsonText = await response.text();
      
      // Parse JSON first
      let rawData: { songs: Song[] };
      try {
        rawData = JSON.parse(jsonText);
      } catch (parseError) {
        throw new DataLoaderError(
          'Failed to parse JSON data',
          parseError instanceof Error ? parseError : new Error(String(parseError))
        );
      }

      // Validate that we have songs array
      if (!rawData.songs || !Array.isArray(rawData.songs)) {
        throw new DataLoaderError('Invalid data structure: missing or invalid songs array');
      }

      // Group albums using Rust/WASM for performance
      const albumsJson = groupByAlbum(JSON.stringify(rawData.songs));
      let albums: Album[];
      try {
        albums = JSON.parse(albumsJson);
      } catch (parseError) {
        throw new DataLoaderError(
          'Failed to parse album grouping results',
          parseError instanceof Error ? parseError : new Error(String(parseError))
        );
      }

      // Create complete MusicData structure for validation
      const completeData = {
        songs: rawData.songs,
        albums: albums
      };

      // Validate the complete structure using Rust/WASM
      const validationError = validateMusicData(JSON.stringify(completeData));
      if (validationError) {
        throw new DataLoaderError(`Data validation failed: ${validationError}`);
      }

      // Return complete MusicData structure
      return completeData;

    } catch (error) {
      // Re-throw DataLoaderError as-is, wrap other errors
      if (error instanceof DataLoaderError) {
        throw error;
      }
      
      throw new DataLoaderError(
        'Unexpected error during data loading',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Validates a raw JSON string containing music data
   * Uses Rust/WASM for validation performance
   * 
   * @param jsonText - Raw JSON string to validate
   * @returns Promise<boolean> - true if valid, throws error if invalid
   * @throws DataLoaderError if validation fails
   */
  public async validateRawData(jsonText: string): Promise<boolean> {
    try {
      await this.ensureWasmInitialized();
      
      // Parse JSON first
      let rawData: { songs: Song[] };
      try {
        rawData = JSON.parse(jsonText);
      } catch (parseError) {
        throw new DataLoaderError(
          'Failed to parse JSON data',
          parseError instanceof Error ? parseError : new Error(String(parseError))
        );
      }

      // Validate that we have songs array
      if (!rawData.songs || !Array.isArray(rawData.songs)) {
        throw new DataLoaderError('Invalid data structure: missing or invalid songs array');
      }

      // Group albums using Rust/WASM for performance
      const albumsJson = groupByAlbum(JSON.stringify(rawData.songs));
      let albums: Album[];
      try {
        albums = JSON.parse(albumsJson);
      } catch (parseError) {
        throw new DataLoaderError(
          'Failed to parse album grouping results',
          parseError instanceof Error ? parseError : new Error(String(parseError))
        );
      }

      // Create complete MusicData structure for validation
      const completeData = {
        songs: rawData.songs,
        albums: albums
      };

      // Validate the complete structure using Rust/WASM
      const validationError = validateMusicData(JSON.stringify(completeData));
      if (validationError) {
        throw new DataLoaderError(`Validation failed: ${validationError}`);
      }
      
      return true;
    } catch (error) {
      if (error instanceof DataLoaderError) {
        throw error;
      }
      
      throw new DataLoaderError(
        'Unexpected error during validation',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Groups an array of songs by album name
   * Uses Rust/WASM for performance
   * 
   * @param songs - Array of songs to group
   * @returns Promise<Album[]> - Array of albums with grouped songs
   * @throws DataLoaderError if grouping fails
   */
  public async groupSongsByAlbum(songs: Song[]): Promise<Album[]> {
    try {
      await this.ensureWasmInitialized();
      
      const songsJson = JSON.stringify(songs);
      const albumsJson = groupByAlbum(songsJson);
      
      const albums: Album[] = JSON.parse(albumsJson);
      return albums;
    } catch (error) {
      throw new DataLoaderError(
        'Failed to group songs by album',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Check if WASM module is initialized
   */
  public isWasmReady(): boolean {
    return this.wasmInitialized;
  }
}

/**
 * Convenience function to get DataLoader instance and load music data
 * 
 * @param jsonPath - Optional path to JSON file
 * @returns Promise<MusicData> - Loaded and validated music data
 */
export async function loadMusicData(jsonPath?: string): Promise<MusicData> {
  const loader = DataLoader.getInstance();
  return loader.loadMusicData(jsonPath);
}

/**
 * Convenience function to validate raw JSON data
 * 
 * @param jsonText - Raw JSON string to validate
 * @returns Promise<boolean> - true if valid
 */
export async function validateMusicDataString(jsonText: string): Promise<boolean> {
  const loader = DataLoader.getInstance();
  return loader.validateRawData(jsonText);
}

// Export the DataLoader class as default
export default DataLoader;