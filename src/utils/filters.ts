/**
 * TypeScript Filter Utilities (WASM Wrapper)
 * 
 * This module provides TypeScript wrapper functions around the Rust/WASM
 * filtering functions with proper type safety and error handling.
 * 
 * All filtering operations are performed by the Rust/WASM module for
 * optimal performance, especially with large datasets.
 */

import * as wasm from '../wasm/bindings';
import type { Song } from '../types/music';

// Track WASM initialization state
let wasmInitialized = false;

/**
 * Initialize WASM module synchronously for testing
 * This should be called once before running tests
 */
export function initWasmSync(): void {
  if (!wasmInitialized) {
    try {
      // Initialize WASM synchronously
      wasm.initWasm();
      wasmInitialized = true;
    } catch (error) {
      console.warn('WASM initialization failed, falling back to JavaScript implementation');
      wasmInitialized = false;
    }
  }
}

/**
 * Ensures WASM module is initialized before calling any WASM functions
 */
function ensureWasmInitialized(): void {
  if (!wasmInitialized) {
    initWasmSync();
  }
}

/**
 * Filters songs to only creator-friendly ones
 * 
 * A song is considered creator-friendly if ANY of these conditions are true:
 * 1. Has a commercial CC license (CC BY, CC BY-SA, CC0)
 * 2. Is an NCS release
 * 3. Has a BGML-P license
 * 
 * Uses Rust/WASM for performance optimization.
 * 
 * @param songs - Array of songs to filter
 * @returns Array of songs that are creator-friendly
 * @throws Error if WASM module is not initialized or JSON parsing fails
 */
export function filterCreatorFriendly(songs: Song[]): Song[] {
  try {
    // Ensure WASM is initialized
    ensureWasmInitialized();
    
    // Convert songs to JSON string for WASM function
    const songsJson = JSON.stringify(songs);
    
    // Call WASM function to perform filtering
    const filteredJson = wasm.filterCreatorFriendly(songsJson);
    
    // Parse and return the filtered songs
    const filteredSongs: Song[] = JSON.parse(filteredJson);
    
    return filteredSongs;
  } catch (error) {
    // Fallback to JavaScript implementation if WASM fails
    console.warn('WASM filtering failed, using JavaScript fallback:', error);
    return filterCreatorFriendlyJS(songs);
  }
}

/**
 * Checks if a license string represents a commercial Creative Commons license
 * 
 * Recognizes these CC license patterns (case-insensitive):
 * - CC BY (any version)
 * - CC BY-SA (any version) 
 * - CC0 (public domain)
 * 
 * Delegates to Rust/WASM for consistent regex matching.
 * 
 * @param license - License string to check
 * @returns true if the license is a commercial CC license, false otherwise
 */
export function isCommercialCCLicense(license: string): boolean {
  try {
    // Ensure WASM is initialized
    ensureWasmInitialized();
    
    return wasm.isCommercialCCLicense(license);
  } catch (error) {
    // Fallback to JavaScript implementation if WASM fails
    console.warn('WASM CC license check failed, using JavaScript fallback:', error);
    return isCommercialCCLicenseJS(license);
  }
}

/**
 * Checks if a license string represents a BGML-P (Babafun Game Music License - Permissive) license
 * 
 * Matches the exact string "BGML-P" (case-insensitive).
 * 
 * Delegates to Rust/WASM for consistent pattern matching.
 * 
 * @param license - License string to check
 * @returns true if the license is BGML-P, false otherwise
 */
export function isBGMLPLicense(license: string): boolean {
  try {
    // Ensure WASM is initialized
    ensureWasmInitialized();
    
    return wasm.isBGMLPLicense(license);
  } catch (error) {
    // Fallback to JavaScript implementation if WASM fails
    console.warn('WASM BGML-P license check failed, using JavaScript fallback:', error);
    return isBGMLPLicenseJS(license);
  }
}

/**
 * Checks if a single song is creator-friendly
 * 
 * This is a convenience function that checks if a song meets any of the
 * creator-friendly criteria without needing to filter an entire array.
 * 
 * Uses the same logic as filterCreatorFriendly but for a single song.
 * 
 * @param song - Song to check
 * @returns true if the song is creator-friendly, false otherwise
 */
export function isCreatorFriendlySong(song: Song): boolean {
  try {
    // Ensure WASM is initialized
    ensureWasmInitialized();
    
    // Convert song to JSON string for WASM function
    const songJson = JSON.stringify(song);
    
    // Call WASM function to check if song is creator-friendly
    return wasm.isCreatorFriendlySong(songJson);
  } catch (error) {
    // Fallback to JavaScript implementation if WASM fails
    console.warn('WASM creator-friendly check failed, using JavaScript fallback:', error);
    return isCreatorFriendlySongJS(song);
  }
}

/**
 * Utility function to get a human-readable description of why a song is creator-friendly
 * 
 * This function analyzes a song and returns a string describing which criteria
 * make it creator-friendly, or null if it's not creator-friendly.
 * 
 * @param song - Song to analyze
 * @returns Description string or null if not creator-friendly
 */
export function getCreatorFriendlyReason(song: Song): string | null {
  try {
    // Check each criterion individually
    const hasCommercialCC = isCommercialCCLicense(song.license);
    const isNCS = song.releaseType === 'NCS';
    const isBGMLP = isBGMLPLicense(song.license);
    
    // Build description based on which criteria are met
    const reasons: string[] = [];
    
    if (hasCommercialCC) {
      reasons.push(`Commercial CC license (${song.license})`);
    }
    
    if (isNCS) {
      reasons.push('NCS release');
    }
    
    if (isBGMLP) {
      reasons.push('BGML-P license');
    }
    
    // Return description or null if no criteria met
    return reasons.length > 0 ? reasons.join(', ') : null;
  } catch (error) {
    // If there's an error checking, assume not creator-friendly
    return null;
  }
}

/**
 * Batch check multiple songs for creator-friendliness
 * 
 * This is more efficient than calling isCreatorFriendlySong multiple times
 * as it processes all songs in a single WASM call.
 * 
 * @param songs - Array of songs to check
 * @returns Array of booleans indicating which songs are creator-friendly
 */
export function batchCheckCreatorFriendly(songs: Song[]): boolean[] {
  try {
    // Use the filter function and then map back to boolean array
    const creatorFriendlySongs = filterCreatorFriendly(songs);
    const creatorFriendlyIds = new Set(creatorFriendlySongs.map(song => song.id));
    
    // Return boolean array indicating which songs are creator-friendly
    return songs.map(song => creatorFriendlyIds.has(song.id));
  } catch (error) {
    // Fallback to individual checks
    return songs.map(song => isCreatorFriendlySong(song));
  }
}

// JavaScript fallback implementations
// These are used when WASM is not available or fails

/**
 * JavaScript fallback for commercial CC license checking
 */
function isCommercialCCLicenseJS(license: string): boolean {
  if (!license || typeof license !== 'string') {
    return false;
  }
  
  const trimmed = license.trim().toLowerCase();
  
  // Match CC BY, CC BY-SA, CC0 patterns (case-insensitive)
  const ccPatterns = [
    /^cc by( \d+\.\d+)?$/,           // CC BY, CC BY 4.0, etc.
    /^cc by-sa( \d+\.\d+)?$/,        // CC BY-SA, CC BY-SA 4.0, etc.
    /^cc0( \d+\.\d+)?$/,             // CC0, CC0 1.0, etc.
  ];
  
  return ccPatterns.some(pattern => pattern.test(trimmed));
}

/**
 * JavaScript fallback for BGML-P license checking
 */
function isBGMLPLicenseJS(license: string): boolean {
  if (!license || typeof license !== 'string') {
    return false;
  }
  
  return license.trim().toLowerCase() === 'bgml-p';
}

/**
 * JavaScript fallback for creator-friendly song checking
 */
function isCreatorFriendlySongJS(song: Song): boolean {
  // Check if song meets any creator-friendly criteria
  const hasCommercialCC = isCommercialCCLicenseJS(song.license);
  const isNCS = song.releaseType === 'NCS';
  const isBGMLP = isBGMLPLicenseJS(song.license);
  
  return hasCommercialCC || isNCS || isBGMLP;
}

/**
 * JavaScript fallback for filtering creator-friendly songs
 */
function filterCreatorFriendlyJS(songs: Song[]): Song[] {
  return songs.filter(song => isCreatorFriendlySongJS(song));
}