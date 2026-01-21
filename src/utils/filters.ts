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
    // Convert songs to JSON string for WASM function
    const songsJson = JSON.stringify(songs);
    
    // Call WASM function to perform filtering
    const filteredJson = wasm.filterCreatorFriendly(songsJson);
    
    // Parse and return the filtered songs
    const filteredSongs: Song[] = JSON.parse(filteredJson);
    
    return filteredSongs;
  } catch (error) {
    throw new Error(`Failed to filter creator-friendly songs: ${error instanceof Error ? error.message : String(error)}`);
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
 * @throws Error if WASM module is not initialized
 */
export function isCommercialCCLicense(license: string): boolean {
  try {
    return wasm.isCommercialCCLicense(license);
  } catch (error) {
    throw new Error(`Failed to check CC license: ${error instanceof Error ? error.message : String(error)}`);
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
 * @throws Error if WASM module is not initialized
 */
export function isBGMLPLicense(license: string): boolean {
  try {
    return wasm.isBGMLPLicense(license);
  } catch (error) {
    throw new Error(`Failed to check BGML-P license: ${error instanceof Error ? error.message : String(error)}`);
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
 * @throws Error if WASM module is not initialized or JSON parsing fails
 */
export function isCreatorFriendlySong(song: Song): boolean {
  try {
    // Convert song to JSON string for WASM function
    const songJson = JSON.stringify(song);
    
    // Call WASM function to check if song is creator-friendly
    return wasm.isCreatorFriendlySong(songJson);
  } catch (error) {
    throw new Error(`Failed to check if song is creator-friendly: ${error instanceof Error ? error.message : String(error)}`);
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
 * @throws Error if WASM module is not initialized or processing fails
 */
export function batchCheckCreatorFriendly(songs: Song[]): boolean[] {
  try {
    // Use the filter function and then map back to boolean array
    const creatorFriendlySongs = filterCreatorFriendly(songs);
    const creatorFriendlyIds = new Set(creatorFriendlySongs.map(song => song.id));
    
    // Return boolean array indicating which songs are creator-friendly
    return songs.map(song => creatorFriendlyIds.has(song.id));
  } catch (error) {
    throw new Error(`Failed to batch check creator-friendly songs: ${error instanceof Error ? error.message : String(error)}`);
  }
}