/**
 * TypeScript bindings for the Rust/WASM module.
 * Provides camelCase wrappers around the WASM functions with proper type safety.
 */

import wasmInit, {
  init,
  validate_album,
  validate_music_data,
  flatten_songs,
  filter_creator_friendly,
  is_commercial_cc_license,
  is_bgml_p_license,
  is_creator_friendly_song,
  get_version,
  is_initialized
} from '../../rust/pkg/rust';

// Track initialization state
let wasmInitialized = false;

/**
 * Initialize the WASM module synchronously (for tests / Node environments).
 * In test environments WASM init is skipped; callers fall back to JS.
 */
export function initWasm(): void {
  if (!wasmInitialized) {
    console.warn('WASM sync initialization skipped in test environment, using JavaScript fallbacks');
    // Keep wasmInitialized = false so callers use JS fallbacks
  }
}

/**
 * Initialize the WASM module asynchronously (for browser environments).
 */
export async function initWasmAsync(): Promise<void> {
  if (!wasmInitialized) {
    try {
      await wasmInit();
      init();
      wasmInitialized = true;
    } catch (error) {
      console.warn('WASM async initialization failed:', error);
      throw error;
    }
  }
}

/**
 * Ensure WASM is initialized before calling functions.
 * Throws if not initialized so callers can fall back to JS.
 */
function ensureInitialized(): void {
  if (!wasmInitialized) {
    throw new Error('WASM module not initialized. Using JavaScript fallback.');
  }
}

/**
 * Validates a single album object (including its tracks).
 * Returns error message if invalid, empty string if valid.
 */
export function validateAlbum(albumJson: string): string {
  ensureInitialized();
  return validate_album(albumJson);
}

/**
 * Validates entire music data (array of albums).
 * Returns error message if invalid, empty string if valid.
 */
export function validateMusicData(dataJson: string): string {
  ensureInitialized();
  return validate_music_data(dataJson);
}

/**
 * Flattens albums into a list of SongView objects, resolving streamLink per track.
 * Returns JSON string of flattened SongView objects.
 */
export function flattenSongs(albumsJson: string): string {
  ensureInitialized();
  return flatten_songs(albumsJson);
}

/**
 * Filters SongView objects to only creator-friendly ones.
 * Returns JSON string of filtered songs.
 */
export function filterCreatorFriendly(songsJson: string): string {
  ensureInitialized();
  return filter_creator_friendly(songsJson);
}

/**
 * Checks if license is a commercial Creative Commons license.
 */
export function isCommercialCCLicense(license: string): boolean {
  ensureInitialized();
  return is_commercial_cc_license(license);
}

/**
 * Checks if license is BGML-P.
 */
export function isBGMLPLicense(license: string): boolean {
  ensureInitialized();
  return is_bgml_p_license(license);
}

/**
 * Checks if a SongView JSON object is creator-friendly.
 */
export function isCreatorFriendlySong(songJson: string): boolean {
  ensureInitialized();
  return is_creator_friendly_song(songJson);
}

/**
 * Get the version of the WASM module.
 */
export function getVersion(): string {
  ensureInitialized();
  return get_version();
}

/**
 * Check if WASM module is properly initialized.
 */
export function isInitialized(): boolean {
  ensureInitialized();
  return is_initialized();
}
