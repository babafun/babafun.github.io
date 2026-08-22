/**
 * TypeScript Filter Utilities (WASM Wrapper)
 *
 * Wrapper functions around the Rust/WASM filtering functions.
 * Operates on SongView objects (flattened album-track views).
 */

import * as wasm from '../wasm/bindings';
import type { SongView } from '../types/music';

// ---------------------------------------------------------------------------
// WASM initialization
// ---------------------------------------------------------------------------

let wasmInitialized = false;

function ensureWasmInitialized(): void {
  if (!wasmInitialized) {
    try {
      wasm.initWasm();
      wasmInitialized = true;
    } catch {
      wasmInitialized = false;
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Filters songs to only creator-friendly ones.
 * A song is creator-friendly if it has a commercial CC license or a BGML-P license.
 */
export function filterCreatorFriendly(songs: SongView[]): SongView[] {
  try {
    ensureWasmInitialized();
    const filteredJson = wasm.filterCreatorFriendly(JSON.stringify(songs));
    return JSON.parse(filteredJson) as SongView[];
  } catch (error) {
    console.warn('WASM filtering failed, using JavaScript fallback:', error);
    return songs.filter(isCreatorFriendlySongJS);
  }
}

/**
 * Checks if a license string represents a commercial Creative Commons license.
 * Recognizes CC BY, CC BY-SA, and CC0 (with optional version numbers).
 */
export function isCommercialCCLicense(license: string): boolean {
  try {
    ensureWasmInitialized();
    return wasm.isCommercialCCLicense(license);
  } catch (error) {
    console.warn('WASM CC license check failed, using JavaScript fallback:', error);
    return isCommercialCCLicenseJS(license);
  }
}

/**
 * Checks if a license string is BGML-P (Babafun Game Music License - Permissive).
 */
export function isBGMLPLicense(license: string): boolean {
  try {
    ensureWasmInitialized();
    return wasm.isBGMLPLicense(license);
  } catch (error) {
    console.warn('WASM BGML-P license check failed, using JavaScript fallback:', error);
    return isBGMLPLicenseJS(license);
  }
}

/**
 * Checks if a single SongView is creator-friendly.
 */
export function isCreatorFriendlySong(song: SongView): boolean {
  try {
    ensureWasmInitialized();
    return wasm.isCreatorFriendlySong(JSON.stringify(song));
  } catch (error) {
    console.warn('WASM creator-friendly check failed, using JavaScript fallback:', error);
    return isCreatorFriendlySongJS(song);
  }
}

/**
 * Batch check multiple songs for creator-friendliness.
 * Returns a boolean array aligned with the input array.
 */
export function batchCheckCreatorFriendly(songs: SongView[]): boolean[] {
  try {
    const creatorFriendlySongs = filterCreatorFriendly(songs);
    const creatorFriendlyIds = new Set(creatorFriendlySongs.map(s => s.id));
    return songs.map(s => creatorFriendlyIds.has(s.id));
  } catch {
    return songs.map(isCreatorFriendlySong);
  }
}

// ---------------------------------------------------------------------------
// JavaScript fallbacks
// ---------------------------------------------------------------------------

function isCommercialCCLicenseJS(license: string): boolean {
  if (!license || typeof license !== 'string') return false;
  const trimmed = license.trim().toLowerCase();
  return (
    /^cc by( \d+\.\d+)?$/.test(trimmed) ||
    /^cc by-sa( \d+\.\d+)?$/.test(trimmed) ||
    /^cc0( \d+\.\d+)?$/.test(trimmed)
  );
}

function isBGMLPLicenseJS(license: string): boolean {
  if (!license || typeof license !== 'string') return false;
  return license.trim().toLowerCase() === 'bgml-p';
}

function isCreatorFriendlySongJS(song: SongView): boolean {
  return isCommercialCCLicenseJS(song.license) || isBGMLPLicenseJS(song.license);
}
