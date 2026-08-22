# Implementation Tasks: Music Portfolio Website

## Phase 1: Project Setup and Infrastructure

### 1.1 Initialize Project Structure
**Requirements:** 1.1, 1.2, 1.3, 1.4, 10.6
- [x] Initialize Vite + TypeScript + React project with `npm create vite@latest`
- [x] Configure TypeScript with strict mode in `tsconfig.json`
- [x] Install core dependencies: React, React-DOM, TypeScript
- [x] Install dev dependencies: Vite, @vitejs/plugin-react, vite-plugin-wasm
- [x] Configure `vite.config.ts` for WASM integration and aggressive minification:
  - Add vite-plugin-wasm
  - Configure terser minification with drop_console
  - Set up code splitting for react-vendor and wasm-core
  - Exclude WASM from optimizeDeps
- [x] Create project folder structure: `src/`, `src/data/`, `src/types/`, `src/wasm/`, `src/utils/`, `src/components/`, `src/styles/`
- [x] Update `.gitignore` to exclude `node_modules/`, `dist/`, `rust/target/`, `rust/pkg/`, and build artifacts

### 1.2 Initialize Rust/WASM Project
**Requirements:** 10.6 (Rust for computation-heavy parts)
- [x] Install Rust toolchain (rustup) if not already installed
- [x] Install wasm-pack: `cargo install wasm-pack`
- [x] Create `rust/` directory in project root
- [x] Initialize Rust library project: `cargo init --lib` in rust directory
- [x] Configure `Cargo.toml` with wasm-bindgen dependencies:
  - Add `wasm-bindgen = "0.2"`
  - Add `serde = { version = "1.0", features = ["derive"] }`
  - Add `serde_json = "1.0"`
  - Set `crate-type = ["cdylib"]`
- [x] Create Rust source structure: `rust/src/lib.rs`, `rust/src/validation.rs`, `rust/src/filters.rs`, `rust/src/grouping.rs`

### 1.3 Setup Testing Framework
**Requirements:** All (testing infrastructure)
- [x] Install fast-check for property-based testing: `npm install --save-dev fast-check @types/fast-check`
- [x] Install Vitest for unit testing: `npm install --save-dev vitest @testing-library/react @testing-library/jest-dom`
- [x] Configure Vitest in `vite.config.ts`
- [x] Create `test/` directory for test utilities
- [x] Create `test/arbitraries.ts` for custom fast-check generators

## Phase 2: Rust/WASM Core Implementation (Performance Layer)

### 2.1 Define Rust Data Structures
**Requirements:** 2.1, 2.2, 2.3, 2.4, 2.5, 10.6
- [x] Create `rust/src/lib.rs` with wasm_bindgen setup
- [x] Define Rust structs matching TypeScript interfaces:
  - `Song` struct with serde derive
  - `Album` struct
  - `MusicData` struct
- [x] Define `ReleaseType` enum: Independent, NCS, Monstercat
- [x] Add serde serialization/deserialization

### 2.2 Implement Rust Validation Module
**Requirements:** 2.6, 2.7, 10.6
- [x] Create `rust/src/validation.rs`
- [x] Update `validate_album()` function:
  - Check all required album fields present
  - Validate types (string, bool, number, array)
  - Validate each track has required fields
  - Return detailed error messages
- [x] Implement `validate_music_data()` function:
  - Parse JSON array of albums
  - Validate all albums and their tracks
  - Check for duplicate album IDs and track IDs
  - Return error string or empty if valid
- [ ]* Update `batch_validate_albums()` for optimized batch validation
- [x] Add comprehensive error messages

### 2.3 Implement Rust Album/Track Module
**Requirements:** 2.1, 2.2, 10.6
- [x] Create `rust/src/grouping.rs`
- [x] Rename/update to implement `flatten_songs()` function:
  - Parse albums JSON (array of Album objects)
  - For each track, resolve `streamLink` = `overrideStreamLink ?? album.streamLink`
  - Return JSON string of flattened SongView objects
- [x] Remove old `group_by_album()` function (no longer needed)
- [x] Optimize for performance with large datasets

### 2.4 Implement Rust Filtering Module
**Requirements:** 5.1, 5.2, 5.3, 5.4, 5.5, 10.6
- [x] Create `rust/src/filters.rs`
- [x] Implement `is_commercial_cc_license()` function:
  - Use regex for CC BY, CC BY-SA, CC0 patterns
  - Handle version numbers (4.0, etc.)
  - Case-insensitive matching
- [x] Implement `is_bgml_p_license()` function
- [x] Implement `is_creator_friendly()` function:
  - Check commercial CC license
  - Check BGML-P license
  - Return true if ANY condition met
- [x] Implement `filter_creator_friendly()` function:
  - Parse songs JSON
  - Filter using is_creator_friendly
  - Return JSON string of filtered songs
- [x] Optimize regex compilation (use lazy_static)

### 2.5 Build WASM Module
**Requirements:** 10.6
- [x] Build WASM module: `cd rust && wasm-pack build --target web --release`
- [x] Verify output in `rust/pkg/` directory
- [x]* Check WASM file size (target: < 50KB gzipped)
- [x] Test WASM module loads correctly

### 2.6 Create TypeScript WASM Bindings
**Requirements:** 10.6
- [x] Create `src/wasm/bindings.ts`
- [x] Import WASM module from `rust/pkg`
- [x] Create TypeScript wrapper functions with proper types
- [x] Handle WASM initialization
- [x] Export all WASM functions with TypeScript signatures

## Phase 3: TypeScript Data Layer (WASM Wrappers)

### 3.1 Define TypeScript Interfaces
**Requirements:** 2.1, 2.2, 2.3, 2.4, 2.5
- [x] Create `src/types/music.ts`
- [x] Define `Track` interface: `id`, `title`, `license`, optional `overrideStreamLink`
- [x] Define `Album` interface: `id`, `title`, `releaseYear`, `streamLink`, `hasContentId`, optional `releaseLabel`, `albumArtwork`, `tracks`
- [x] Define `SongView` interface (flattened view with resolved `streamLink` and album context)
- [x] Export all types

### 3.2 Create Sample Music Data
**Requirements:** 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
- [x] Restructure `src/data/music.json` as a top-level array of album objects
- [~] Each album has: `id`, `title`, `releaseYear`, `streamLink`, `hasContentId`, optional `releaseLabel`, `albumArtwork`, `tracks`
- [~] Each track has: `id`, `title`, `license`, optional `overrideStreamLink`
- [~] Add at least 3 albums with multiple tracks each
- [~] Include tracks with and without `overrideStreamLink`
- [~] Include tracks with various license types (CC BY, CC BY-SA, CC0, BGML-P, empty, All Rights Reserved)
- [~] Ensure all album IDs and track IDs are unique
- [~] Validate JSON syntax

### 3.3 Implement TypeScript Data Loader (WASM Wrapper)
**Requirements:** 2.6, 2.7, 10.6
- [x] Create `src/utils/dataLoader.ts`
- [~] Import WASM bindings
- [x] Implement `DataLoader` class:
  - `loadMusicData()` async function to fetch JSON
  - Call WASM `validate_music_data()` for validation
  - Parse and return `Album[]`
  - Add error handling
- [x] Update to use new album-first data shape (remove `group_by_album` call — no longer needed)
- [x] Export DataLoader class

### 3.4 Implement TypeScript Filter Utilities (WASM Wrapper)
**Requirements:** 5.1, 5.2, 5.3, 5.4, 5.5, 10.6
- [x] Create `src/utils/filters.ts`
- [ ] Import WASM bindings
- [x] Implement wrapper functions:
  - `filterCreatorFriendly()` - calls WASM function
  - `isCommercialCCLicense()` - calls WASM function
  - `isBGMLPLicense()` - calls WASM function
- [x] Add TypeScript type safety
- [x] Export all filter functions

### 3.5 Write Property-Based Tests for Data Layer
**Requirements:** 2.2, 2.3, 2.4, 2.5, 2.7, 3.1, 3.2
- [x] Create custom arbitraries in `test/arbitraries.ts`
- [x] **Property 1:** Write test for album validation
- [x] **Property 2:** Write test for flatten preserves all tracks
- [x] **Property 3:** Write test for stream link resolution
- [x] **Property 7:** Write test for unique IDs
- [ ]* Run tests and ensure all pass

## Phase 4: Styling Foundation

### 4.1 Create Color Scheme System
**Requirements:** 8.3, 8.4, 8.5
- [x] Create `src/styles/colors.css` with CSS custom properties
- [x] Add oklch color space overrides for modern browsers
- [x] Verify hsl fallbacks are defined before oklch values

### 4.2 Create Base Styles
**Requirements:** 8.1, 8.2, 8.3, 10.1, 10.3
- [x] Create `src/styles/main.css`
- [x] Set body background and text colors
- [x] Define responsive layout styles with media queries
- [x] Define component base styles
- [x] Apply color scheme consistently

### 4.3 Test Color Contrast
**Requirements:** 11.3
- [x] Create `src/utils/colorContrast.ts` with contrast calculation
- [ ]* **Property 8:** Write property-based test for color contrast
- [ ]* Manually verify all text/background combinations meet WCAG AA (4.5:1)

## Phase 5: React Components (DOM Layer)

### 5.1 Implement DiscographyView Component
**Requirements:** 4.3, 4.4
- [x] Create `src/components/DiscographyView.tsx`
- [x] Implement component to display albums with artwork
- [x] Link to individual album pages
- [x] Apply color scheme styling
- [x] Use semantic HTML

### 5.2 Implement SongDetailView Component
**Requirements:** 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11
- [x] Create `src/components/SongDetailView.tsx`
- [x] Display all song metadata (album, label, Content ID, streaming link, year, artwork)
- [x] Implement conditional license display (only if non-empty)
- [x] Resolve stream link: `overrideStreamLink ?? album.streamLink`
- [x] Render streaming links as clickable `<a>` elements with `rel="noopener noreferrer"`

### 5.3 Implement License Display Logic
**Requirements:** 6.9, 6.10
- [x] Create `src/utils/display.ts`
- [x] Implement `shouldDisplayLicense()` function
- [ ]* **Property 5:** Write property-based test for license display logic

### 5.4 Implement CreatorListView Component
**Requirements:** 7.1, 7.2, 7.3, 7.4, 7.5
- [x] Create `src/components/CreatorListView.tsx`
- [x] Filter songs using `filterCreatorFriendly()` utility
- [x] Display same information as SongDetailView for each song
- [x] Add visual creator-friendly badge

### 5.5 Implement View Navigation Component
**Requirements:** 3, 4, 5
- [x] Create `src/components/ViewSelector.tsx`
- [x] Create navigation tabs for each view
- [x] Highlight active view
- [x] Add ARIA roles and labels

### 5.6 Write Property-Based Tests for Filters
**Requirements:** 7.2, 7.3
- [x] **Property 4:** Write test for creator-friendly filter correctness
- [x] **Property 6:** Write test that creator list is subset of all songs
- [ ]* Run tests and ensure all pass

### 5.7 Write Component Unit Tests
**Requirements:** All component requirements
- [x] Write unit tests for DiscographyView rendering
- [x] Write unit tests for SongDetailView rendering and conditional logic
- [ ]* Write unit tests for CreatorListView filtering
- [ ]* Write unit tests for ViewSelector interaction

## Phase 6: Main Application

### 6.1 Implement App Component
**Requirements:** All (main integration)
- [x] Create `src/App.tsx` with React Router setup
- [x] Implement state management with useState hooks
- [x] Load music data on component mount with useEffect
- [x] Handle loading and error states
- [x] Render appropriate page component based on route

### 6.2 Create Application Entry Point
**Requirements:** 1.1, 1.2, 1.3
- [x] Create `src/main.tsx`
- [x] Import styles (colors.css, main.css)
- [x] Render App component with StrictMode

### 6.3 Update HTML Entry Point
**Requirements:** 1.1, 1.2
- [x] Update `index.html` with root div, viewport meta, and Google Fonts
- [x] Update title to "babafun"
- [x] Remove old CSS links and leftover content

### 6.4 Write Integration Tests
**Requirements:** All
- [x] **Property 10:** Write test for view switching data preservation
- [ ]* Test full data loading flow
- [ ]* Test error handling
- [ ]* Test view navigation

## Phase 7: Accessibility & Responsive Design

### 7.1 Implement Keyboard Navigation
**Requirements:** 11.4
- [x] Ensure all interactive elements are keyboard accessible
- [x] Add focus styles for all interactive elements

### 7.2 Add ARIA Labels and Semantic HTML
**Requirements:** 11.1, 11.2, 11.5, 11.6
- [x] Add ARIA labels to navigation elements
- [x] Add ARIA live regions for loading/error states
- [x] Add aria-label to external links
- [ ]* Add alt text for album artwork images

### 7.3 Test Responsive Design
**Requirements:** 10.1, 10.2, 10.3
- [x] Verify layout works on mobile, tablet, and desktop
- [x] Verify no horizontal overflow
- [ ]* **Property 9:** Write property-based test for responsive layout bounds
- [ ]* Adjust media queries as needed

### 7.4 Accessibility Audit
**Requirements:** 11.1, 11.2, 11.3, 11.4, 11.5, 11.6
- [ ]* Run Lighthouse accessibility audit
- [ ]* Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ]* Verify color contrast ratios
- [ ]* Check focus indicators

## Phase 8: Privacy & Contact Requirements

### 8.1 Remove Contact Information
**Requirements:** 9.1, 9.2, 9.3, 9.4, 9.5
- [x] be mysterious

## Phase 9: Performance Optimization

### 9.1 Implement Performance Optimizations
**Requirements:** 12.2, 12.3, 12.5
- [x] Add React.memo to expensive components
- [x] Implement lazy loading with React.lazy and Suspense
- [x] Optimize re-renders with useMemo and useCallback

### 9.2 Performance Testing
**Requirements:** 12.1, 12.4
- [ ]* Run Lighthouse performance audit
- [ ]* Check bundle size (target: < 200KB gzipped including WASM)
- [ ]* Benchmark Rust validation speed (target: < 10ms for 100 songs)
- [ ]* Verify minification is working

## Phase 10: Testing & Validation

### 10.1 Run All Property-Based Tests
**Requirements:** All
- [-] Fix any failing property-based tests

### 10.2 Run All Unit Tests
**Requirements:** All
- [ ]* Verify 80%+ code coverage
- [ ]* Add tests for any uncovered critical paths

### 10.3 Manual Testing
**Requirements:** All
- [x] Test all views (Discography, Album, Song, Creator List, Search)
- [~] Test view navigation end-to-end
- [ ]* Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ]* Test keyboard navigation
- [ ]* Test with screen reader

### 10.4 Data Validation Testing
**Requirements:** 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
- [~] Test with invalid JSON (should show error)
- [~] Test with missing required fields (should show error)
- [ ]* Test with duplicate IDs (should show error)
- [ ]* Test with large dataset (50+ songs)

## Phase 12: Song CLI Tool

### 12.1 Create Python Song CLI Script
**Requirements:** 13.1 – 13.15
- [~] Create `devtools/add_song.py`
- [~] Implement JSON load/save helpers for `src/data/music.json`
- [~] Implement slug-based ID generation with collision handling
- [~] Implement fuzzy album selection using `questionary.autocomplete`:
  - Show all existing album titles as choices
  - Filter in real-time as user types
  - Show "+ Create new album '<typed>'" when no match or as last option
- [~] Implement "add to existing album" flow:
  - Ask if stream link is song-specific or whole-release
  - Prompt for stream link (stored as `overrideStreamLink` or skipped if whole-release)
  - Prompt for license (blank allowed)
  - Append track to album's `tracks` array
- [~] Implement "create new album" flow:
  - Prompt for album stream link, release year, hasContentId, albumArtwork URL, optional releaseLabel
  - Ask if stream link is song-specific or whole-release
  - Prompt for license
  - Create new album object and append to JSON
- [~] Implement "Add another song?" loop
- [~] Write updated JSON back to `src/data/music.json` with consistent formatting
- [ ]* Test script manually with at least 3 scenarios

## Phase 11: Build & Deployment

### 11.1 Configure Production Build
**Requirements:** 1.2, 12.3, 12.6
- [~] Verify `vite.config.ts` production settings (terser, code splitting, WASM plugin)
- [x] Build WASM in release mode: `cd rust && wasm-pack build --target web --release`
- [x] Test production build with `npm run build`
- [x] Verify all features work in production build

### 11.2 Deployment Preparation
**Requirements:** All
- [ ]* Create deployment documentation in README
- [ ]* Document Rust/WASM build process
- [~] Add npm scripts: `build:wasm`, `build:all`, `dev`

### 11.3 Final Validation
**Requirements:** All
- [ ]* Run final Lighthouse audit (target: > 90 score)
- [x] Verify all core requirements are met
- [ ]* Test deployed site on production URL

## Notes

- Optional tasks (`- [ ]*`) are non-blocking for MVP — skip them to ship faster
- **Rust/WASM Strategy**: Use Rust for all batch operations, validation, and filtering
- **Privacy**: No contact information anywhere in the music portfolio
- Build WASM in release mode for production
