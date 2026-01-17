# Design Document: Music Portfolio Website

## Overview

The music portfolio website is a single-page application built with TypeScript, Vite, and React that displays a musician's discography through multiple viewing modes. The system uses a JSON-based data store for music information and provides three distinct views: a discography organized by albums, detailed per-song information, and a creator-friendly filtered list.

The architecture emphasizes simplicity and maintainability by using file-based data storage, minimal React usage (only for dynamic content), and a clean separation between data models, business logic, and presentation layers.

## Architecture

### High-Level Structure

```
music-portfolio/
├── src/
│   ├── data/
│   │   └── music.json           # Music data store
│   ├── types/
│   │   └── music.ts              # TypeScript interfaces
│   ├── wasm/
│   │   └── bindings.ts           # WASM module bindings
│   ├── utils/
│   │   ├── dataLoader.ts         # JSON loading (TS wrapper)
│   │   └── theme.ts              # Theme switching utilities
│   ├── components/
│   │   ├── DiscographyView.tsx   # Album-organized view
│   │   ├── SongDetailView.tsx    # Individual song details
│   │   └── CreatorListView.tsx   # Creator-friendly filtered list
│   ├── styles/
│   │   ├── colors.css            # Color scheme variables
│   │   └── main.css              # Global styles
│   ├── App.tsx                   # Main application component
│   └── main.tsx                  # Application entry point
├── rust/
│   ├── src/
│   │   ├── lib.rs                # WASM entry point
│   │   ├── validation.rs         # Song/data validation
│   │   ├── filters.rs            # Creator-friendly filtering
│   │   └── grouping.rs           # Album grouping logic
│   └── Cargo.toml                # Rust dependencies
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Technology Stack

- **TypeScript**: Type-safe development with compile-time error checking, DOM manipulation
- **Rust + WebAssembly**: Performance-critical operations (validation, filtering, batch processing)
- **Vite**: Fast development server and optimized production builds with minification
- **React**: Minimal usage for dynamic view rendering and state management
- **CSS Custom Properties**: Theme system with dark/light mode support
- **JSON**: Simple file-based data storage

### Design Principles

1. **Simplicity First**: Use JSON files instead of databases, minimize dependencies
2. **Type Safety**: Leverage TypeScript for data validation and IDE support
3. **Minimal React**: Use React only where dynamic rendering is needed
4. **Performance First**: Use Rust/WASM for batch operations, validation, and filtering
5. **Clear Separation**: TypeScript for DOM, Rust for computation
6. **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
7. **Optimized Delivery**: Minified bundles for fast downloads

## Components and Interfaces

### Data Models

#### Song Interface

```typescript
interface Song {
  id: string;                    // Unique identifier
  title: string;                 // Song title
  albumName: string;             // Album this song belongs to
  releaseType: ReleaseType;      // Independent, NCS, or Monstercat
  hasContentId: boolean;         // Whether song has Content ID
  streamingLink: string;         // URL to streaming platform
  license: string;               // License type (can be empty string)
}

type ReleaseType = 'Independent' | 'NCS' | 'Monstercat';
```

#### Album Interface

```typescript
interface Album {
  name: string;                  // Album name
  songs: Song[];                 // Songs in this album
}
```

#### MusicData Interface

```typescript
interface MusicData {
  songs: Song[];                 // All songs in the portfolio
  albums: Album[];               // Derived: songs grouped by album
}
```

### Core Utilities

#### Rust/WASM Module (Performance-Critical Operations)

```rust
// rust/src/lib.rs
// All performance-critical operations compiled to WebAssembly

/// Validates song structure and types
/// Returns true if valid, false otherwise
#[wasm_bindgen]
pub fn validate_song(song_json: &str) -> bool

/// Validates entire music data structure
/// Returns error message if invalid, empty string if valid
#[wasm_bindgen]
pub fn validate_music_data(data_json: &str) -> String

/// Groups songs by album name
/// Returns JSON string of grouped albums
#[wasm_bindgen]
pub fn group_by_album(songs_json: &str) -> String

/// Filters songs to only creator-friendly ones
/// Returns JSON string of filtered songs
#[wasm_bindgen]
pub fn filter_creator_friendly(songs_json: &str) -> String

/// Checks if license is commercial CC license
#[wasm_bindgen]
pub fn is_commercial_cc_license(license: &str) -> bool

/// Checks if license is BGML-P
#[wasm_bindgen]
pub fn is_bgml_p_license(license: &str) -> bool

/// Batch validates multiple songs (optimized)
#[wasm_bindgen]
pub fn batch_validate_songs(songs_json: &str) -> String
```

#### TypeScript Data Loader (WASM Wrapper)

```typescript
// dataLoader.ts
import * as wasm from '../wasm/bindings';

class DataLoader {
  /**
   * Loads and validates music data from JSON file
   * Uses Rust/WASM for validation performance
   * Throws error if validation fails
   */
  async loadMusicData(): Promise<MusicData> {
    const response = await fetch('/src/data/music.json');
    const jsonText = await response.text();
    
    // Validate using Rust/WASM
    const validationError = wasm.validate_music_data(jsonText);
    if (validationError) {
      throw new Error(validationError);
    }
    
    const data = JSON.parse(jsonText);
    
    // Group albums using Rust/WASM
    const albumsJson = wasm.group_by_album(JSON.stringify(data.songs));
    const albums = JSON.parse(albumsJson);
    
    return { songs: data.songs, albums };
  }
}
```

#### TypeScript Filter Utilities (WASM Wrapper)

```typescript
// filters.ts (TypeScript wrapper for Rust functions)
import * as wasm from '../wasm/bindings';

/**
 * Filters songs to only creator-friendly ones
 * Uses Rust/WASM for performance
 */
export function filterCreatorFriendly(songs: Song[]): Song[] {
  const songsJson = JSON.stringify(songs);
  const filteredJson = wasm.filter_creator_friendly(songsJson);
  return JSON.parse(filteredJson);
}

/**
 * Checks if license is commercial CC (delegates to Rust)
 */
export function isCommercialCCLicense(license: string): boolean {
  return wasm.is_commercial_cc_license(license);
}

/**
 * Checks if license is BGML-P (delegates to Rust)
 */
export function isBGMLPLicense(license: string): boolean {
  return wasm.is_bgml_p_license(license);
}
```

### React Components

#### App Component

```typescript
// App.tsx
interface AppProps {}

interface AppState {
  musicData: MusicData | null;
  currentView: 'discography' | 'songs' | 'creator';
  loading: boolean;
  error: string | null;
}

/**
 * Main application component
 * - Loads music data on mount
 * - Manages view state
 * - Renders appropriate view component
 */
function App(): JSX.Element
```

#### DiscographyView Component

```typescript
// DiscographyView.tsx
interface DiscographyViewProps {
  albums: Album[];
}

/**
 * Displays songs organized by albums
 * - Renders album sections with headers
 * - Lists songs under each album
 * - Applies consistent styling
 */
function DiscographyView(props: DiscographyViewProps): JSX.Element
```

#### SongDetailView Component

```typescript
// SongDetailView.tsx
interface SongDetailViewProps {
  songs: Song[];
}

/**
 * Displays detailed information for each song
 * - Shows all song metadata
 * - Conditionally displays license (only if non-empty)
 * - Renders streaming links as clickable elements
 */
function SongDetailView(props: SongDetailViewProps): JSX.Element
```

#### CreatorListView Component

```typescript
// CreatorListView.tsx
interface CreatorListViewProps {
  songs: Song[];
}

/**
 * Displays filtered list of creator-friendly songs
 * - Filters songs using filterCreatorFriendly utility
 * - Displays same information as SongDetailView
 * - Highlights creator-friendly status
 */
function CreatorListView(props: CreatorListViewProps): JSX.Element
```

### View Navigation

```typescript
// ViewSelector component or navigation logic
interface ViewSelectorProps {
  currentView: string;
  onViewChange: (view: 'discography' | 'songs' | 'creator') => void;
}

/**
 * Navigation component for switching between views
 * - Provides buttons/tabs for each view
 * - Highlights active view
 * - Accessible keyboard navigation
 */
function ViewSelector(props: ViewSelectorProps): JSX.Element
```

## Data Models

### JSON Data Structure

The `music.json` file follows this structure:

```json
{
  "songs": [
    {
      "id": "song-001",
      "title": "Example Song",
      "albumName": "Example Album",
      "releaseType": "Independent",
      "hasContentId": false,
      "streamingLink": "https://push.fm/song",
      "license": "CC BY 4.0"
    },
    {
      "id": "song-002",
      "title": "Another Song",
      "albumName": "Example Album",
      "releaseType": "NCS",
      "hasContentId": false,
      "streamingLink": "https://example.com/song2",
      "license": ""
    }
  ]
}
```

### Validation Rules

1. **Required Fields**: All fields in Song interface must be present
2. **Release Type**: Must be one of: 'Independent', 'NCS', 'Monstercat'
3. **Content ID**: Must be boolean (true/false)
4. **Streaming Link**: Must be valid URL string
5. **License**: Can be empty string, but field must exist
6. **ID**: Must be unique across all songs

### Creator-Friendly Criteria

A song is considered creator-friendly if ANY of these conditions are true:

1. **CC Commercial License**: License string matches commercial-use CC licenses:
   - CC BY (any version)
   - CC BY-SA (any version)
   - CC0 (public domain)

2. **NCS Release**: Release type is 'NCS'

3. **BGML-P License**: License string is 'BGML-P'

### License String Patterns

```typescript
// Example license strings to recognize
const CC_COMMERCIAL_PATTERNS = [
  /^CC BY( \d\.\d)?$/i,           // CC BY, CC BY 4.0, etc.
  /^CC BY-SA( \d\.\d)?$/i,        // CC BY-SA, CC BY-SA 4.0, etc.
  /^CC0( \d\.\d)?$/i,             // CC0, CC0 1.0, etc.
];

const BGML_P_PATTERN = /^BGML-P$/i;
```

## Color Scheme Implementation

### CSS Custom Properties

The color scheme is implemented using CSS custom properties with two-tier fallback:

1. **Primary**: oklch color space (modern browsers)
2. **Fallback**: hsl color space (older browsers)

### Color Variables

#### Dark Mode (Default)

The music portfolio uses a purple-themed dark mode color scheme:

```css
:root {
  /* hsl (fallback color) */
  --bg-dark: hsl(265 100% 4%);
  --bg: hsl(271 100% 7%);
  --bg-light: hsl(271 73% 11%);
  --text: hsl(266 100% 100%);
  --text-muted: hsl(266 57% 77%);
  --highlight: hsl(270 43% 47%);
  --border: hsl(272 57% 35%);
  --border-muted: hsl(276 100% 21%);
  --primary: hsl(268 100% 80%);
  --secondary: hsl(77 51% 50%);
  --danger: hsl(8 84% 66%);
  --warning: hsl(54 100% 27%);
  --success: hsl(160 100% 35%);
  --info: hsl(217 100% 69%);
  
  /* oklch */
  --bg-dark: oklch(0.1 0.08 304);
  --bg: oklch(0.15 0.08 304);
  --bg-light: oklch(0.2 0.08 304);
  --text: oklch(0.96 0.1 304);
  --text-muted: oklch(0.76 0.1 304);
  --highlight: oklch(0.5 0.16 304);
  --border: oklch(0.4 0.16 304);
  --border-muted: oklch(0.3 0.16 304);
  --primary: oklch(0.76 0.16 304);
  --secondary: oklch(0.76 0.16 124);
  --danger: oklch(0.7 0.16 30);
  --warning: oklch(0.7 0.16 100);
  --success: oklch(0.7 0.16 160);
  --info: oklch(0.7 0.16 260);
}
```

**Color Breakdown:**
- **Background**: Three shades of deep purple (dark, normal, light) for depth
- **Text**: Bright purple-white for readability, muted purple for secondary text
- **Highlight**: Mid-tone purple for hover states
- **Borders**: Purple borders in two intensities for subtle separation
- **Primary**: Bright purple (oklch 0.76 0.16 304) - main theme color
- **Secondary**: Yellow-green (oklch 0.76 0.16 124) - accent color
- **Semantic Colors**: Danger (red), warning (yellow), success (green), info (blue)

#### Light Mode (Optional)

Light mode is not required for the initial implementation but can be added later by inverting brightness while maintaining the purple hue. Applied via `body.light` class with same variable names for easy switching.

### Theme Switching (Optional)

Light mode is optional for the initial implementation. If implemented later:

```typescript
// Theme management utility
function toggleTheme(): void {
  document.body.classList.toggle('light');
  localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
}

function loadTheme(): void {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light');
  }
}
```

### Applying Colors

Components use CSS custom properties directly:

```css
/* Base layout */
body {
  background-color: var(--bg);
  color: var(--text);
}

/* Song cards */
.song-card {
  background-color: var(--bg-light);
  color: var(--text);
  border: 1px solid var(--border);
}

.song-card:hover {
  background-color: var(--highlight);
  border-color: var(--primary);
}

/* Links */
.streaming-link {
  color: var(--primary);
}

.streaming-link:hover {
  color: var(--secondary);
}

/* Badges */
.creator-badge {
  background-color: var(--success);
  color: var(--bg-dark);
}

/* Navigation */
.view-selector button {
  color: var(--text-muted);
  border: 1px solid var(--border-muted);
}

.view-selector button.active {
  color: var(--primary);
  border-color: var(--primary);
  background-color: var(--bg-light);
}

/* Album headers */
.album-header {
  color: var(--primary);
  border-bottom: 2px solid var(--border);
}
```



## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Song Data Validation

**Validates: Requirements 2.2, 2.3, 2.4, 2.5**

*For any* object claiming to be a Song, the validation function should accept it if and only if it contains all required fields (id, title, albumName, releaseType, hasContentId, streamingLink, license) with correct types.

```typescript
property("Song validation accepts valid songs and rejects invalid ones", 
  forAll(arbitrary.object(), (obj) => {
    const isValid = validateSong(obj);
    const hasAllFields = 
      typeof obj.id === 'string' &&
      typeof obj.title === 'string' &&
      typeof obj.albumName === 'string' &&
      ['Independent', 'NCS', 'Monstercat'].includes(obj.releaseType) &&
      typeof obj.hasContentId === 'boolean' &&
      typeof obj.streamingLink === 'string' &&
      typeof obj.license === 'string';
    
    return isValid === hasAllFields;
  })
);
```

### Property 2: Album Grouping Preserves Songs

**Validates: Requirements 3.1, 3.2**

*For any* list of songs, grouping them by album should preserve all songs without duplication or loss.

```typescript
property("Album grouping preserves all songs", 
  forAll(arbitrary.array(arbitrary.song()), (songs) => {
    const albums = groupByAlbum(songs);
    const allSongsInAlbums = albums.flatMap(album => album.songs);
    
    // Same number of songs
    const countPreserved = allSongsInAlbums.length === songs.length;
    
    // All original songs present
    const allPresent = songs.every(song => 
      allSongsInAlbums.some(s => s.id === song.id)
    );
    
    return countPreserved && allPresent;
  })
);
```

### Property 3: Album Grouping Correctness

**Validates: Requirements 3.1, 3.2**

*For any* list of songs grouped into albums, all songs within an album should have the same album name.

```typescript
property("Songs in an album share the same album name", 
  forAll(arbitrary.array(arbitrary.song()), (songs) => {
    const albums = groupByAlbum(songs);
    
    return albums.every(album => 
      album.songs.every(song => song.albumName === album.name)
    );
  })
);
```

### Property 4: Creator-Friendly Filter Correctness

**Validates: Requirements 5.2, 5.3, 5.4, 5.5**

*For any* song, it should be included in the creator-friendly list if and only if it meets at least one of the criteria: CC commercial license, NCS release, or BGML-P license.

```typescript
property("Creator-friendly filter includes correct songs", 
  forAll(arbitrary.song(), (song) => {
    const isIncluded = isCreatorFriendly(song);
    
    const hasCommercialCC = isCommercialCCLicense(song.license);
    const isNCS = song.releaseType === 'NCS';
    const isBGMLP = isBGMLPLicense(song.license);
    
    const shouldBeIncluded = hasCommercialCC || isNCS || isBGMLP;
    
    return isIncluded === shouldBeIncluded;
  })
);
```

### Property 5: License Display Logic

**Validates: Requirements 4.5, 4.6**

*For any* song, the license should be displayed if and only if the license field is non-empty.

```typescript
property("License displayed only when non-empty", 
  forAll(arbitrary.song(), (song) => {
    const shouldDisplay = shouldDisplayLicense(song);
    const hasLicense = song.license !== '';
    
    return shouldDisplay === hasLicense;
  })
);
```

### Property 6: View Filtering Subset

**Validates: Requirements 5.1, 5.5**

*For any* list of songs, the creator-friendly filtered list should be a subset of the original list.

```typescript
property("Creator list is subset of all songs", 
  forAll(arbitrary.array(arbitrary.song()), (songs) => {
    const creatorSongs = filterCreatorFriendly(songs);
    
    // All creator songs exist in original list
    return creatorSongs.every(creatorSong => 
      songs.some(song => song.id === creatorSong.id)
    );
  })
);
```

### Property 7: Unique Song IDs

**Validates: Requirements 2.7**

*For any* valid music data, all song IDs should be unique.

```typescript
property("All song IDs are unique", 
  forAll(arbitrary.musicData(), (musicData) => {
    const ids = musicData.songs.map(song => song.id);
    const uniqueIds = new Set(ids);
    
    return ids.length === uniqueIds.size;
  })
);
```

### Property 8: Color Contrast Accessibility

**Validates: Requirements 9.3**

*For any* color combination used for text and background, the contrast ratio should meet WCAG AA standards (4.5:1 for normal text).

```typescript
property("Text colors meet contrast requirements", 
  forAll(arbitrary.colorPair(), (pair) => {
    const contrastRatio = calculateContrastRatio(pair.text, pair.background);
    
    return contrastRatio >= 4.5;
  })
);
```

### Property 9: Responsive Layout Bounds

**Validates: Requirements 8.1, 8.2, 8.3**

*For any* viewport width in supported ranges, the layout should render without horizontal overflow.

```typescript
property("Layout fits within viewport", 
  forAll(arbitrary.viewportWidth(320, 2560), (width) => {
    const layout = renderLayout(width);
    
    return layout.contentWidth <= width;
  })
);
```

### Property 10: Navigation State Consistency

**Validates: Requirements 3, 4, 5**

*For any* view state, switching views and returning should preserve the data displayed.

```typescript
property("View switching preserves data", 
  forAll(arbitrary.viewState(), arbitrary.musicData(), (initialView, data) => {
    const views = ['discography', 'songs', 'creator'] as const;
    
    // Cycle through all views and back
    let currentData = data;
    for (const view of views) {
      currentData = renderView(view, currentData);
    }
    
    const finalData = renderView(initialView, currentData);
    
    return deepEqual(data, finalData);
  })
);
```

## Implementation Strategy

### Phase 1: Project Setup
1. Initialize Vite + TypeScript + React project
2. Configure TypeScript with strict mode
3. Initialize Rust project with wasm-pack
4. Set up project structure (folders, files)
5. Install necessary dependencies (including wasm-bindgen)
6. Configure Vite for WASM integration and minification

### Phase 2: Rust/WASM Core (Performance Layer)
1. Set up Rust project with wasm-bindgen
2. Define Rust structs matching TypeScript interfaces
3. Implement validation functions in Rust
4. Implement album grouping in Rust
5. Implement filtering logic in Rust
6. Build WASM module with wasm-pack
7. Generate TypeScript bindings

### Phase 3: Data Layer (TypeScript Wrappers)
1. Define TypeScript interfaces for Song, Album, MusicData
2. Create sample music.json with test data
3. Implement TypeScript data loader wrapping Rust/WASM
4. Write property-based tests for validation
5. Test WASM integration

### Phase 4: Styling Foundation
1. Create colors.css with CSS custom properties
2. Implement dark/light mode variables
3. Create main.css with base styles
4. Implement theme switching utility
5. Test color contrast ratios

### Phase 5: Core Components
1. Implement DiscographyView component
2. Implement SongDetailView component
3. Implement CreatorListView component
4. Implement ViewSelector navigation
5. Write component tests

### Phase 6: Main Application
1. Implement App component with state management
2. Integrate data loading on mount
3. Implement view switching logic
4. Handle loading and error states
5. Test full application flow

### Phase 7: Accessibility & Polish
1. Add ARIA labels to interactive elements
2. Implement keyboard navigation
3. Test with screen readers
4. Optimize performance (lazy loading, memoization)
5. Add responsive design media queries

### Phase 8: Testing & Validation
1. Run all property-based tests
2. Manual testing across devices
3. Accessibility audit
4. Performance profiling
5. Fix any issues discovered

## Testing Strategy

### Property-Based Testing Framework

Use **fast-check** for TypeScript property-based testing:

```bash
npm install --save-dev fast-check @types/fast-check
```

### Custom Arbitraries

```typescript
// test/arbitraries.ts

const releaseTypeArbitrary = fc.constantFrom('Independent', 'NCS', 'Monstercat');

const songArbitrary = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  albumName: fc.string({ minLength: 1, maxLength: 100 }),
  releaseType: releaseTypeArbitrary,
  hasContentId: fc.boolean(),
  streamingLink: fc.webUrl(),
  license: fc.oneof(
    fc.constant(''),
    fc.constant('CC BY 4.0'),
    fc.constant('CC BY-SA 4.0'),
    fc.constant('CC0 1.0'),
    fc.constant('BGML-P'),
    fc.constant('All Rights Reserved')
  )
});

const musicDataArbitrary = fc.record({
  songs: fc.array(songArbitrary, { minLength: 0, maxLength: 50 })
});
```

### Unit Testing

Use **Vitest** for unit tests:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

### Test Coverage Goals

- Data validation: 100% coverage with property tests
- Filtering logic: 100% coverage with property tests
- Components: 80%+ coverage with unit tests
- Integration: Manual testing for user flows

## Performance Considerations

### Rust/WASM Performance Strategy

**Use Rust for:**
1. **Batch Validation**: Validating all songs at once (faster than JS loops)
2. **Data Filtering**: Creator-friendly filter across large datasets
3. **Album Grouping**: Sorting and grouping operations
4. **License Pattern Matching**: Regex operations on many strings
5. **Data Integrity Checks**: Security-critical validation

**Use TypeScript for:**
1. **DOM Manipulation**: All React components and rendering
2. **Event Handling**: User interactions, clicks, navigation
3. **Theme Switching**: LocalStorage and CSS class manipulation
4. **WASM Coordination**: Loading and calling Rust functions

### Optimization Strategies

1. **Rust/WASM**: All batch operations and validation in compiled Rust
2. **Lazy Loading**: Load components only when needed
3. **Memoization**: Use React.memo for expensive components
4. **Code Splitting**: Separate bundles for each view
5. **Minification**: Terser with aggressive compression
6. **Asset Optimization**: Compress and optimize all assets

### Performance Budgets

- Initial Load: < 2 seconds on 3G
- Time to Interactive: < 3 seconds
- Bundle Size: < 200KB (gzipped) including WASM
- WASM Module: < 50KB (gzipped)
- Lighthouse Score: > 90
- Validation Speed: < 10ms for 100 songs

### Monitoring

```typescript
// Performance monitoring utility
function measureViewSwitch(viewName: string): void {
  performance.mark(`view-${viewName}-start`);
  
  requestAnimationFrame(() => {
    performance.mark(`view-${viewName}-end`);
    performance.measure(
      `view-${viewName}`,
      `view-${viewName}-start`,
      `view-${viewName}-end`
    );
  });
}
```

## Security Considerations

### Data Validation

- Validate all JSON data before use
- Sanitize any user-generated content (if added later)
- Use TypeScript strict mode for type safety

### External Links

- Validate streaming link URLs
- Use `rel="noopener noreferrer"` for external links
- Consider Content Security Policy headers

### Privacy

- No contact forms or data collection (per requirements)
- No analytics or tracking
- No cookies or local storage (except theme preference)

## Deployment

### Build Process

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### Static Hosting

The application is a static site and can be hosted on:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

### Environment Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  plugins: [react(), wasm()],
  base: '/', // Adjust for subdirectory deployment
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser', // Aggressive minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'wasm-core': ['./src/wasm/bindings'],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['./src/wasm/bindings'], // Don't pre-bundle WASM
  },
});
```

## Future Enhancements

Potential features for future iterations:

1. **Search Functionality**: Filter songs by title, album, or license
2. **Sorting Options**: Sort by release date, title, or album
3. **Audio Previews**: Embed audio players for song samples
4. **Album Art**: Display album artwork images
5. **Export Options**: Download creator-friendly list as CSV/JSON
6. **Multi-language Support**: Internationalization for global audience
7. **Advanced Filtering**: Combine multiple filter criteria
8. **Statistics Dashboard**: Show release type distribution, license breakdown

## Maintenance

### Adding New Songs

1. Open `src/data/music.json`
2. Add new song object to `songs` array
3. Ensure all required fields are present
4. Validate JSON syntax
5. Rebuild and deploy

### Updating Color Scheme

1. Open `src/styles/colors.css`
2. Modify CSS custom property values
3. Test in both dark and light modes
4. Verify contrast ratios
5. Update documentation if needed

### Dependency Updates

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Rebuild WASM module
cd rust && wasm-pack build --target web

# Test after updates
npm run test
npm run build
```

### Building WASM Module

```bash
# Development build (with debug symbols)
cd rust && wasm-pack build --target web --dev

# Production build (optimized and minified)
cd rust && wasm-pack build --target web --release

# The output will be in rust/pkg/ directory
```

## Conclusion

This design provides a comprehensive blueprint for building a music portfolio website that meets all specified requirements. The architecture emphasizes simplicity, type safety, and maintainability while providing a solid foundation for future enhancements. The property-based testing approach ensures correctness across a wide range of inputs, and the modular component structure allows for easy updates and extensions.