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
- [ ] Implement `validate_song()` function:
  - Check all required fields present
  - Validate types (string, bool, etc.)
  - Validate release type enum
  - Return detailed error messages
- [ ] Implement `validate_music_data()` function:
  - Parse JSON string
  - Validate all songs
  - Check for duplicate IDs
  - Return error string or empty if valid
- [ ] Implement `batch_validate_songs()` for optimized batch validation
- [ ] Add comprehensive error messages

### 2.3 Implement Rust Album Grouping Module
**Requirements:** 3.1, 3.2, 10.6
- [ ] Create `rust/src/grouping.rs`
- [ ] Implement `group_by_album()` function:
  - Parse songs JSON
  - Use HashMap for efficient grouping
  - Sort albums by name
  - Preserve all songs without duplication
  - Return JSON string of albums
- [ ] Optimize for performance with large datasets

### 2.4 Implement Rust Filtering Module
**Requirements:** 5.1, 5.2, 5.3, 5.4, 5.5, 10.6
- [ ] Create `rust/src/filters.rs`
- [ ] Implement `is_commercial_cc_license()` function:
  - Use regex for CC BY, CC BY-SA, CC0 patterns
  - Handle version numbers (4.0, etc.)
  - Case-insensitive matching
- [ ] Implement `is_bgml_p_license()` function
- [ ] Implement `is_creator_friendly()` function:
  - Check commercial CC license
  - Check NCS release type
  - Check BGML-P license
  - Return true if ANY condition met
- [ ] Implement `filter_creator_friendly()` function:
  - Parse songs JSON
  - Filter using is_creator_friendly
  - Return JSON string of filtered songs
- [ ] Optimize regex compilation (use lazy_static)

### 2.5 Build WASM Module
**Requirements:** 10.6
- [ ] Build WASM module: `cd rust && wasm-pack build --target web --release`
- [ ] Verify output in `rust/pkg/` directory
- [ ] Check WASM file size (target: < 50KB gzipped)
- [ ] Test WASM module loads correctly

### 2.6 Create TypeScript WASM Bindings
**Requirements:** 10.6
- [ ] Create `src/wasm/bindings.ts`
- [ ] Import WASM module from `rust/pkg`
- [ ] Create TypeScript wrapper functions with proper types
- [ ] Handle WASM initialization
- [ ] Export all WASM functions with TypeScript signatures

## Phase 3: TypeScript Data Layer (WASM Wrappers)

### 3.1 Define TypeScript Interfaces
**Requirements:** 2.1, 2.2, 2.3, 2.4, 2.5
- [x] Create `src/types/music.ts`
- [x] Define `ReleaseType` type: `'Independent' | 'NCS' | 'Monstercat'`
- [x] Define `Song` interface with all required fields (id, title, albumName, releaseType, hasContentId, streamingLink, license)
- [x] Define `Album` interface (name, songs array)
- [x] Define `MusicData` interface (songs array, albums array)
- [x] Export all types

### 3.2 Create Sample Music Data
**Requirements:** 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
- [ ] Create `src/data/music.json`
- [ ] Add at least 10 sample songs with varied data:
  - Mix of Independent, NCS, and Monstercat releases
  - Mix of Content ID true/false
  - Various license types (CC BY, CC BY-SA, CC0, BGML-P, empty string, All Rights Reserved)
  - Multiple albums with multiple songs each
- [ ] Ensure all songs have unique IDs
- [ ] Validate JSON syntax

### 3.3 Implement TypeScript Data Loader (WASM Wrapper)
**Requirements:** 2.6, 2.7, 10.6
- [ ] Create `src/utils/dataLoader.ts`
- [ ] Import WASM bindings
- [ ] Implement `DataLoader` class:
  - `loadMusicData()` async function to fetch JSON
  - Call WASM `validate_music_data()` for validation
  - Call WASM `group_by_album()` for grouping
  - Parse results and return MusicData
  - Add error handling
- [ ] Export DataLoader class

### 3.4 Implement TypeScript Filter Utilities (WASM Wrapper)
**Requirements:** 5.1, 5.2, 5.3, 5.4, 5.5, 10.6
- [ ] Create `src/utils/filters.ts`
- [ ] Import WASM bindings
- [ ] Implement wrapper functions:
  - `filterCreatorFriendly()` - calls WASM function
  - `isCommercialCCLicense()` - calls WASM function
  - `isBGMLPLicense()` - calls WASM function
- [ ] Add TypeScript type safety
- [ ] Export all filter functions

### 3.5 Write Property-Based Tests for Data Layer
**Requirements:** 2.2, 2.3, 2.4, 2.5, 2.7, 3.1, 3.2
- [ ] Create custom arbitraries in `test/arbitraries.ts`:
  - `releaseTypeArbitrary`
  - `songArbitrary`
  - `musicDataArbitrary`
- [ ] **Property 1:** Write test for song validation (validates Requirements 2.2, 2.3, 2.4, 2.5)
- [ ] **Property 2:** Write test for album grouping preservation (validates Requirements 3.1, 3.2)
- [ ] **Property 3:** Write test for album grouping correctness (validates Requirements 3.1, 3.2)
- [ ] **Property 7:** Write test for unique song IDs (validates Requirement 2.7)
- [ ] Run tests and ensure all pass

## Phase 4: Styling Foundation

### 4.1 Create Color Scheme System
**Requirements:** 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8
- [ ] Create `src/styles/colors.css`
- [ ] Define CSS custom properties for dark mode using the exact color scheme:
  - Background colors: `--bg-dark: hsl(265 100% 4%)`, `--bg: hsl(271 100% 7%)`, `--bg-light: hsl(271 73% 11%)`
  - Text colors: `--text: hsl(266 100% 100%)`, `--text-muted: hsl(266 57% 77%)`
  - Highlight: `--highlight: hsl(270 43% 47%)`
  - Border colors: `--border: hsl(272 57% 35%)`, `--border-muted: hsl(276 100% 21%)`
  - Primary color: `--primary: hsl(268 100% 80%)` (bright purple)
  - Secondary color: `--secondary: hsl(77 51% 50%)` (yellow-green)
  - Semantic colors: `--danger: hsl(8 84% 66%)`, `--warning: hsl(54 100% 27%)`, `--success: hsl(160 100% 35%)`, `--info: hsl(217 100% 69%)`
- [ ] Add oklch color space overrides for modern browsers:
  - `--bg-dark: oklch(0.1 0.08 304)`, `--bg: oklch(0.15 0.08 304)`, `--bg-light: oklch(0.2 0.08 304)`
  - `--text: oklch(0.96 0.1 304)`, `--text-muted: oklch(0.76 0.1 304)`
  - `--highlight: oklch(0.5 0.16 304)`
  - `--border: oklch(0.4 0.16 304)`, `--border-muted: oklch(0.3 0.16 304)`
  - `--primary: oklch(0.76 0.16 304)`, `--secondary: oklch(0.76 0.16 124)`
  - `--danger: oklch(0.7 0.16 30)`, `--warning: oklch(0.7 0.16 100)`, `--success: oklch(0.7 0.16 160)`, `--info: oklch(0.7 0.16 260)`
- [ ] Verify hsl fallbacks are defined before oklch values

### 4.2 Create Base Styles
**Requirements:** 8.1, 8.2, 8.3, 8.4, 9.1, 9.3
- [ ] Create `src/styles/main.css`
- [ ] Import `colors.css`
- [ ] Set body background to `var(--bg)` and text to `var(--text)`
- [ ] Define base typography styles using purple theme colors
- [ ] Define responsive layout styles with media queries:
  - Mobile: 320px - 767px
  - Tablet: 768px - 1023px
  - Desktop: 1024px+
- [ ] Define component base styles:
  - Song cards with `--bg-light` background and `--border`
  - Links with `--primary` color
  - Buttons with `--border-muted` and `--text-muted`
  - Active states with `--primary` and `--highlight`
- [ ] Ensure semantic HTML styling
- [ ] Apply purple theme consistently across all elements


### 4.4 Test Color Contrast
**Requirements:** 9.3
- [ ] Create `src/utils/colorContrast.ts` with contrast calculation
- [ ] **Property 8:** Write property-based test for color contrast (validates Requirement 9.3)
- [ ] Manually verify all text/background combinations meet WCAG AA (4.5:1)
- [ ] Document any color adjustments needed

## Phase 5: React Components (DOM Layer)

### 5.1 Implement DiscographyView Component
**Requirements:** 3.1, 3.2, 3.3, 3.4, 3.5
- [ ] Create `src/components/DiscographyView.tsx`
- [ ] Define `DiscographyViewProps` interface
- [ ] Implement component to display albums with headers
- [ ] List songs under each album
- [ ] Apply color scheme styling
- [ ] Use semantic HTML (section, h2, ul/li)
- [ ] Add ARIA labels for accessibility

### 5.2 Implement SongDetailView Component
**Requirements:** 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
- [ ] Create `src/components/SongDetailView.tsx`
- [ ] Define `SongDetailViewProps` interface
- [ ] Display all song metadata (album, release type, Content ID, streaming link)
- [ ] Implement conditional license display (only if non-empty)
- [ ] Render streaming links as clickable `<a>` elements with proper attributes
- [ ] Apply consistent styling
- [ ] Use semantic HTML and ARIA labels

### 5.3 Implement License Display Logic
**Requirements:** 4.5, 4.6
- [ ] Create `src/utils/display.ts`
- [ ] Implement `shouldDisplayLicense()` function
- [ ] **Property 5:** Write property-based test for license display logic (validates Requirements 4.5, 4.6)
- [ ] Integrate into SongDetailView component

### 5.4 Implement CreatorListView Component
**Requirements:** 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
- [ ] Create `src/components/CreatorListView.tsx`
- [ ] Define `CreatorListViewProps` interface
- [ ] Filter songs using `filterCreatorFriendly()` utility
- [ ] Display same information as SongDetailView for each song
- [ ] Add visual indicator for creator-friendly status (badge/icon)
- [ ] Apply styling with success color for badges
- [ ] Use semantic HTML and ARIA labels

### 5.5 Implement View Navigation Component
**Requirements:** 3, 4, 5 (navigation between views)
- [ ] Create `src/components/ViewSelector.tsx`
- [ ] Define `ViewSelectorProps` interface
- [ ] Create buttons/tabs for each view (Discography, Songs, Creator List)
- [ ] Highlight active view
- [ ] Implement keyboard navigation (arrow keys, tab)
- [ ] Add ARIA roles and labels for accessibility
- [ ] Apply styling with primary color for active state

### 5.6 Write Property-Based Tests for Filters
**Requirements:** 5.1, 5.2, 5.3, 5.4, 5.5
- [ ] **Property 4:** Write test for creator-friendly filter correctness (validates Requirements 5.2, 5.3, 5.4, 5.5)
- [ ] **Property 6:** Write test that creator list is subset of all songs (validates Requirements 5.1, 5.5)
- [ ] Run tests and ensure all pass

### 5.7 Write Component Unit Tests
**Requirements:** All component requirements
- [ ] Write unit tests for DiscographyView rendering
- [ ] Write unit tests for SongDetailView rendering and conditional logic
- [ ] Write unit tests for CreatorListView filtering
- [ ] Write unit tests for ViewSelector interaction
- [ ] Aim for 80%+ component coverage

## Phase 6: Main Application

### 6.1 Implement App Component
**Requirements:** All (main integration)
- [ ] Create `src/App.tsx`
- [ ] Define `AppState` interface (musicData, currentView, loading, error)
- [ ] Implement state management with useState hooks
- [ ] Load music data on component mount with useEffect
- [ ] Implement view switching logic
- [ ] Handle loading state display
- [ ] Handle error state display
- [ ] Render appropriate view component based on state
- [ ] Integrate ViewSelector for navigation

### 6.2 Create Application Entry Point
**Requirements:** 1.1, 1.2, 1.3
- [ ] Create `src/main.tsx`
- [ ] Import React and ReactDOM
- [ ] Import App component
- [ ] Import styles (colors.css, main.css)
- [ ] Initialize theme with `initTheme()`
- [ ] Render App component to DOM
- [ ] Add StrictMode wrapper

### 6.3 Update HTML Entry Point
**Requirements:** 1.1, 1.2
- [ ] Update `index.html` to include root div
- [ ] Add meta tags for viewport and charset
- [ ] Update title to "Music Portfolio"
- [ ] Link to main.tsx as module script
- [ ] Remove old CSS links and content

### 6.4 Write Integration Tests
**Requirements:** All
- [ ] **Property 10:** Write test for view switching data preservation (validates Requirements 3, 4, 5)
- [ ] Test full data loading flow
- [ ] Test error handling
- [ ] Test view navigation

## Phase 7: Accessibility & Responsive Design

### 7.1 Implement Keyboard Navigation
**Requirements:** 9.4
- [ ] Ensure all interactive elements are keyboard accessible
- [ ] Test tab order is logical
- [ ] Add focus styles for all interactive elements
- [ ] Implement keyboard shortcuts for view switching (optional)
- [ ] Test with keyboard-only navigation

### 7.2 Add ARIA Labels and Semantic HTML
**Requirements:** 9.1, 9.2, 9.5, 9.6
- [ ] Review all components for semantic HTML usage
- [ ] Add ARIA labels to navigation elements
- [ ] Add ARIA labels to view selector
- [ ] Add ARIA live regions for loading/error states
- [ ] Add alt text for any icons or images
- [ ] Add aria-label to external links explaining they open in new tab

### 7.3 Test Responsive Design
**Requirements:** 8.1, 8.2, 8.3, 8.4, 8.5
- [ ] Test layout on mobile (320px - 767px)
- [ ] Test layout on tablet (768px - 1023px)
- [ ] Test layout on desktop (1024px+)
- [ ] Verify no horizontal overflow at any size
- [ ] **Property 9:** Write property-based test for responsive layout bounds (validates Requirements 8.1, 8.2, 8.3)
- [ ] Adjust media queries as needed

### 7.4 Accessibility Audit
**Requirements:** 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
- [ ] Run Lighthouse accessibility audit
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Verify color contrast ratios
- [ ] Check focus indicators
- [ ] Verify all images have alt text
- [ ] Fix any issues discovered

## Phase 8: Privacy & Contact Requirements

### 8.1 Remove Contact Information
**Requirements:** 7.1, 7.2, 7.3, 7.4, 7.5
- [ ] Verify no contact forms in any component
- [ ] Verify no email addresses displayed
- [ ] Verify no social media links
- [ ] Verify no direct messaging interfaces
- [ ] Update main site index.html to remove/hide contact section if needed

## Phase 9: Performance Optimization

### 9.1 Implement Performance Optimizations
**Requirements:** 10.1, 10.2, 10.3, 10.4, 10.5
- [ ] Add React.memo to expensive components
- [ ] Implement lazy loading for view components with React.lazy
- [ ] Add Suspense boundaries for lazy-loaded components
- [ ] Optimize re-renders with useMemo and useCallback
- [ ] Configure Vite for code splitting

### 9.2 Performance Testing
**Requirements:** 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
- [ ] Run Lighthouse performance audit
- [ ] Measure initial load time
- [ ] Measure time to interactive
- [ ] Check bundle size (target: < 200KB gzipped including WASM)
- [ ] Check WASM module size (target: < 50KB gzipped)
- [ ] Test on simulated 3G connection
- [ ] Verify view switching is instant (< 100ms)
- [ ] Benchmark Rust validation speed (target: < 10ms for 100 songs)
- [ ] Compare WASM vs pure JS performance for filtering
- [ ] Verify minification is working (check for console.log removal)

## Phase 10: Testing & Validation

### 10.1 Run All Property-Based Tests
**Requirements:** All
- [ ] Run all property-based tests with `npm run test`
- [ ] Verify all 10 properties pass
- [ ] Fix any failing tests
- [ ] Document any edge cases discovered

### 10.2 Run All Unit Tests
**Requirements:** All
- [ ] Run unit tests with `npm run test`
- [ ] Verify 80%+ code coverage
- [ ] Fix any failing tests
- [ ] Add tests for any uncovered critical paths

### 10.3 Manual Testing
**Requirements:** All
- [ ] Test all three views (Discography, Songs, Creator List)
- [ ] Test view navigation
- [ ] Test theme switching
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on multiple devices (mobile, tablet, desktop)
- [ ] Test with different screen sizes
- [ ] Test keyboard navigation
- [ ] Test with screen reader

### 10.4 Data Validation Testing
**Requirements:** 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
- [ ] Test with invalid JSON (should show error)
- [ ] Test with missing required fields (should show error)
- [ ] Test with invalid release types (should show error)
- [ ] Test with duplicate IDs (should show error)
- [ ] Test with empty songs array (should handle gracefully)
- [ ] Test with large dataset (50+ songs)

## Phase 11: Build & Deployment

### 11.1 Configure Production Build
**Requirements:** 1.2, 10.3, 10.6
- [ ] Verify `vite.config.ts` production settings:
  - Terser minification with drop_console enabled
  - Sourcemaps disabled
  - Code splitting configured
  - WASM plugin configured
- [ ] Build WASM in release mode: `cd rust && wasm-pack build --target web --release`
- [ ] Test production build with `npm run build`
- [ ] Verify minification worked:
  - Check bundle sizes
  - Verify no console.log in output
  - Verify WASM is optimized
- [ ] Preview production build with `npm run preview`
- [ ] Verify all features work in production build
- [ ] Test WASM loading in production build

### 11.2 Deployment Preparation
**Requirements:** All
- [ ] Create deployment documentation in README
- [ ] Document how to add new songs to music.json
- [ ] Document how to update color scheme
- [ ] Document Rust/WASM build process
- [ ] Document how to rebuild WASM module
- [ ] Document build and deployment process
- [ ] Add npm scripts for common tasks:
  - `build:wasm` - Build WASM module
  - `build:all` - Build WASM + Vite
  - `dev` - Development server with WASM

### 11.3 Final Validation
**Requirements:** All
- [ ] Run final Lighthouse audit (target: > 90 score)
- [ ] Verify all requirements are met
- [ ] Verify all acceptance criteria are satisfied
- [ ] Test deployed site on production URL
- [ ] Create list of potential future enhancements

## Summary

Total Tasks: 11 phases with 70+ individual tasks
Estimated Effort: 50-70 hours for complete implementation
Key Milestones:
- Phase 1: Project setup with Rust/WASM toolchain
- Phase 2: Rust/WASM core complete (validation, filtering, grouping)
- Phase 3: TypeScript wrappers complete
- Phase 5: All UI components complete
- Phase 6: Full application integrated
- Phase 10: All tests passing
- Phase 11: Production ready with optimized WASM

## Notes

- **Rust/WASM Strategy**: Use Rust for all batch operations, validation, and filtering. Use TypeScript only for DOM manipulation.
- **Minification**: Vite configured with terser to aggressively minify and remove console.log statements
- **Performance Targets**: 
  - Total bundle < 200KB gzipped (including WASM)
  - WASM module < 50KB gzipped
  - Validation < 10ms for 100 songs
  - Time to interactive < 3s
- All property-based tests must pass before moving to next phase
- Accessibility is critical - test with real assistive technology
- Privacy requirement: No contact information anywhere in the music portfolio
- Use TypeScript strict mode throughout
- Follow the design document's architecture closely
- Build WASM in release mode for production
