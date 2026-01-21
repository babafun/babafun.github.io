/**
 * TypeScript bindings for the Rust/WASM module
 * This file provides a TypeScript wrapper around the WASM functions
 * with proper type safety and error handling.
 */

import init, * as wasm from '../../rust/pkg/rust';

// Track initialization state
let wasmInitialized = false;

/**
 * Initialize the WASM module
 * Must be called before using any WASM functions
 */
export async function initWasm(): Promise<void> {
  if (!wasmInitialized) {
    try {
      // In test environment, try to load WASM from file system
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
        const fs = await import('fs');
        const path = await import('path');
        const wasmPath = path.resolve(__dirname, '../../rust/pkg/rust_bg.wasm');
        const wasmBuffer = fs.readFileSync(wasmPath);
        await init(wasmBuffer);
      } else {
        // In browser environment, let init() handle the fetch
        await init();
      }
      wasmInitialized = true;
    } catch (error) {
      // Fallback: try default initialization
      try {
        await init();
        wasmInitialized = true;
      } catch (fallbackError) {
        throw error; // Throw original error
      }
    }
  }
}

/**
 * Ensure WASM is initialized before calling functions
 */
function ensureInitialized(): void {
  if (!wasmInitialized) {
    throw new Error('WASM module not initialized. Call initWasm() first.');
  }
}

/**
 * Validates a single song object from JSON string
 * Returns detailed error message if invalid, empty string if valid
 */
export function validateSong(songJson: string): string {
  ensureInitialized();
  return wasm.validate_song(songJson);
}

/**
 * Validates entire music data structure
 * Returns error message if invalid, empty string if valid
 */
export function validateMusicData(dataJson: string): string {
  ensureInitialized();
  return wasm.validate_music_data(dataJson);
}

/**
 * Groups songs by album name
 * Returns JSON string of grouped albums
 */
export function groupByAlbum(songsJson: string): string {
  ensureInitialized();
  return wasm.group_by_album(songsJson);
}

/**
 * Filters songs to only creator-friendly ones
 * Returns JSON string of filtered songs
 */
export function filterCreatorFriendly(songsJson: string): string {
  ensureInitialized();
  return wasm.filter_creator_friendly(songsJson);
}

/**
 * Checks if license is commercial CC license
 */
export function isCommercialCCLicense(license: string): boolean {
  ensureInitialized();
  return wasm.is_commercial_cc_license(license);
}

/**
 * Checks if license is BGML-P
 */
export function isBGMLPLicense(license: string): boolean {
  ensureInitialized();
  return wasm.is_bgml_p_license(license);
}

/**
 * Checks if a song is creator-friendly
 * Takes a JSON string representing a single song
 */
export function isCreatorFriendlySong(songJson: string): boolean {
  ensureInitialized();
  return wasm.is_creator_friendly_song(songJson);
}

/**
 * Batch validates multiple songs (optimized)
 * Returns JSON string with validation results for each song
 */
export function batchValidateSongs(songsJson: string): string {
  ensureInitialized();
  return wasm.batch_validate_songs(songsJson);
}

/**
 * Get the version of the WASM module
 */
export function getVersion(): string {
  ensureInitialized();
  return wasm.get_version();
}

/**
 * Check if WASM module is properly initialized
 */
export function isInitialized(): boolean {
  ensureInitialized();
  return wasm.is_initialized();
}

// Export the raw WASM module for advanced usage
export { wasm };