# Design Document: Music Portfolio Website

## Overview

The music portfolio website is a multi-section application built with TypeScript, Vite, React, and React Router that displays "babafun's" music portfolio through structured navigation and advanced search capabilities. The system uses a JSON-based data store for music information with album artwork and provides multiple pages: a music homepage, discography view, individual album and song pages, and an advanced search interface.

The architecture emphasizes modern web design with an interactive gradient background, enhanced typography using multiple Google Fonts, and a purple-to-blue color scheme with clownfish orange hover states. The site uses full-width layouts and glassmorphism effects for a contemporary feel.

## Architecture

### High-Level Structure

```
music-portfolio/
├── src/
│   ├── data/
│   │   └── music.json           # Music data store with artwork URLs
│   ├── types/
│   │   └── music.ts              # TypeScript interfaces
│   ├── wasm/
│   │   └── bindings.ts           # WASM module bindings
│   ├── utils/
│   │   ├── dataLoader.ts         # JSON loading (TS wrapper)
│   │   ├── filters.ts            # Filtering utilities
│   │   ├── display.ts            # Display utilities
│   │   └── colorContrast.ts      # Color contrast calculations
│   ├── components/
│   │   ├── Navbar.tsx            # Top navigation bar
│   │   ├── DiscographyView.tsx   # Album-organized view
│   │   ├── SongDetailView.tsx    # Individual song details
│   │   ├── CreatorListView.tsx   # Creator-friendly filtered list
│   │   └── ViewSelector.tsx      # View navigation component
│   ├── pages/
│   │   ├── HomePage.tsx          # Main landing page
│   │   ├── MusicHomePage.tsx     # Music section landing
│   │   ├── DiscographyPage.tsx   # Albums listing page
│   │   ├── AlbumPage.tsx         # Individual album page
│   │   ├── SongPage.tsx          # Individual song page
│   │   ├── SearchPage.tsx        # Advanced search interface
│   │   ├── CodePage.tsx          # Development portfolio
│   │   └── LicensesPage.tsx      # Legal information
│   ├── styles/
│   │   ├── colors.css            # Color scheme variables
│   │   └── main.css              # Global styles with interactive background
│   ├── App.tsx                   # Main application with routing
│   └── main.tsx                  # Application entry point
├── rust/
│   ├── src/
│   │   ├── lib.rs                # WASM entry point
│   │   ├── validation.rs         # Song/data validation
│   │   ├── filters.rs            # Creator-friendly filtering
│   │   └── grouping.rs           # Album grouping logic
│   └── Cargo.toml                # Rust dependencies
├── index.html                    # HTML entry with Google Fonts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Technology Stack

- **TypeScript**: Type-safe development with compile-time error checking, DOM manipulation
- **React**: Component-based UI with hooks for state management
- **React Router**: Client-side routing for multi-page navigation
- **Rust + WebAssembly**: Performance-critical operations (validation, filtering, batch processing)
- **Vite**: Fast development server and optimized production builds with minification
- **Google Fonts**: Enhanced typography (Orbitron, Space Grotesk, Inter)
- **CSS Custom Properties**: Theme system with interactive gradients and glassmorphism
- **JSON**: Simple file-based data storage with album artwork URLs

### Design Principles

1. **Multi-Section Architecture**: Clear separation between HOME, MUSIC, CODE, LICENSES sections
2. **Structured Navigation**: Hierarchical music browsing (homepage → discography → albums → songs)
3. **Advanced Search**: Comprehensive filtering and sorting capabilities
4. **Visual Excellence**: Interactive backgrounds, enhanced typography, glassmorphism effects
5. **Full-Width Design**: Utilize entire browser width instead of boxed layouts
6. **Type Safety**: Leverage TypeScript for data validation and IDE support
7. **Performance First**: Use Rust/WASM for batch operations, validation, and filtering
8. **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
9. **Modern Aesthetics**: Purple-to-blue gradients, clownfish orange hover states

## Components and Interfaces

### Data Models

#### Song Interface

```typescript
interface Song {
  id: string;                    // Unique identifier for routing
  title: string;                 // Song title
  albumName: string;             // Album this song belongs to
  releaseType: ReleaseType;      // Independent, NCS, or Monstercat
  hasContentId: boolean;         // Whether song has Content ID
  streamingLink: string;         // URL to streaming platform
  license: string;               // License type (can be empty string)
  releaseYear: number;           // Year of release for sorting
  albumArtwork: string;          // URL to album cover image
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

/**
 * Main application component with React Router
 * - Sets up routing for all pages
 * - Provides consistent layout with Navbar
 * - Handles global state and theme
 */
function App(): JSX.Element
```

#### Navbar Component

```typescript
// Navbar.tsx
interface NavbarProps {}

/**
 * Top navigation bar component
 * - Displays "babafun" brand and "stuff about me" tagline
 * - Provides navigation to HOME, MUSIC, CODE, LICENSES
 * - Highlights active section
 * - Responsive design for mobile/desktop
 */
function Navbar(): JSX.Element
```

#### Page Components

```typescript
// HomePage.tsx
/**
 * Main landing page
 * - Welcome message and site overview
 * - Links to main sections
 */
function HomePage(): JSX.Element

// MusicHomePage.tsx
/**
 * Music section landing page
 * - Music-focused welcome content
 * - "View Discography" button
 * - Search access
 */
function MusicHomePage(): JSX.Element

// DiscographyPage.tsx
/**
 * Albums listing page
 * - Displays all albums with artwork
 * - Full-width layout
 * - Links to individual album pages
 */
function DiscographyPage(): JSX.Element

// AlbumPage.tsx
interface AlbumPageProps {
  albumId: string; // From URL params
}

/**
 * Individual album page
 * - Shows all songs in the album
 * - Album artwork display
 * - Links to individual song pages using song IDs
 */
function AlbumPage(props: AlbumPageProps): JSX.Element

// SongPage.tsx
interface SongPageProps {
  songId: string; // From URL params
}

/**
 * Individual song page
 * - Complete song information
 * - Album artwork
 * - Streaming links
 * - License information
 */
function SongPage(props: SongPageProps): JSX.Element

// SearchPage.tsx
/**
 * Advanced search and filtering interface
 * - Text search across song titles
 * - Multi-select filters (release label, license)
 * - Creator-friendly toggle
 * - Sorting options (title, year)
 * - Real-time results with artwork
 */
function SearchPage(): JSX.Element

// CodePage.tsx
/**
 * Development portfolio page
 * - Showcases programming projects
 * - Links to repositories
 */
function CodePage(): JSX.Element

// LicensesPage.tsx
/**
 * Legal information page
 * - License details
 * - Terms of use
 */
function LicensesPage(): JSX.Element
```

#### View Components

```typescript
// DiscographyView.tsx
interface DiscographyViewProps {
  albums: Album[];
}

/**
 * Displays albums with artwork in full-width layout
 * - Album artwork display
 * - Album titles and metadata
 * - Links to album pages
 */
function DiscographyView(props: DiscographyViewProps): JSX.Element

// SongDetailView.tsx
interface SongDetailViewProps {
  songs: Song[];
}

/**
 * Displays detailed information for songs
 * - Album artwork
 * - All song metadata
 * - Conditional license display
 * - Streaming links
 */
function SongDetailView(props: SongDetailViewProps): JSX.Element

// CreatorListView.tsx
interface CreatorListViewProps {
  songs: Song[];
}

/**
 * Displays filtered list of creator-friendly songs
 * - Filters using filterCreatorFriendly utility
 * - Album artwork display
 * - Creator-friendly badges
 */
function CreatorListView(props: CreatorListViewProps): JSX.Element
```

## Data Models

### JSON Data Structure

The `music.json` file follows this structure with album artwork:

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
      "license": "CC BY 4.0",
      "releaseYear": 2023,
      "albumArtwork": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f"
    },
    {
      "id": "song-002",
      "title": "Another Song",
      "albumName": "Example Album",
      "releaseType": "NCS",
      "hasContentId": false,
      "streamingLink": "https://example.com/song2",
      "license": "",
      "releaseYear": 2024,
      "albumArtwork": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f"
    }
  ]
}
```

### Validation Rules

1. **Required Fields**: All fields in Song interface must be present (including releaseYear and albumArtwork)
2. **Release Type**: Must be one of: 'Independent', 'NCS', 'Monstercat'
3. **Content ID**: Must be boolean (true/false)
4. **Streaming Link**: Must be valid URL string
5. **License**: Can be empty string, but field must exist
6. **ID**: Must be unique across all songs for routing
7. **Release Year**: Must be valid 4-digit year
8. **Album Artwork**: Must be valid URL string

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

## Color Scheme and Visual Design

### Interactive Background

The website features an animated gradient background with mouse-following spotlight effect:

```css
/* Interactive gradient background */
body {
  background: linear-gradient(135deg, 
    hsl(270, 100%, 15%) 0%,
    hsl(260, 100%, 10%) 25%,
    hsl(250, 100%, 8%) 50%,
    hsl(240, 100%, 12%) 75%,
    hsl(270, 100%, 15%) 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

/* Mouse-following spotlight effect */
.spotlight {
  position: fixed;
  pointer-events: none;
  background: radial-gradient(circle, 
    rgba(255, 255, 255, 0.1) 0%, 
    transparent 70%
  );
  transition: transform 0.1s ease;
}
```

### Typography System

Multiple Google Fonts for enhanced visual hierarchy:

```css
/* Font imports in index.html */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

/* Typography hierarchy */
h1, .title { font-family: 'Orbitron', monospace; }
h2, h3, .heading { font-family: 'Space Grotesk', sans-serif; }
body, p, .body-text { font-family: 'Inter', sans-serif; }
```

### Color Variables

#### Updated Color Scheme (Purple-to-Blue with Clownfish Orange)

The music portfolio uses a purple-to-blue gradient theme with clownfish orange hover states:

```css
:root {
  /* Base colors - purple to blue gradients */
  --bg-dark: hsl(270, 100%, 4%);
  --bg: hsl(260, 100%, 7%);
  --bg-light: hsl(250, 73%, 11%);
  --text: hsl(240, 100%, 100%);
  --text-muted: hsl(240, 57%, 77%);
  --highlight: hsl(245, 43%, 47%);
  --border: hsl(245, 57%, 35%);
  --border-muted: hsl(250, 100%, 21%);
  
  /* Theme colors */
  --primary: hsl(245, 100%, 80%);      /* Purple-blue primary */
  --secondary: hsl(210, 100%, 60%);    /* Blue secondary */
  --accent: hsl(25, 100%, 60%);        /* Clownfish orange for hovers */
  
  /* Semantic colors */
  --danger: hsl(8, 84%, 66%);
  --warning: hsl(54, 100%, 27%);
  --success: hsl(160, 100%, 35%);
  --info: hsl(217, 100%, 69%);
  
  /* Modern browser overrides with oklch */
  --bg-dark: oklch(0.1 0.08 270);
  --bg: oklch(0.15 0.08 260);
  --bg-light: oklch(0.2 0.08 250);
  --text: oklch(0.96 0.1 240);
  --text-muted: oklch(0.76 0.1 240);
  --highlight: oklch(0.5 0.16 245);
  --border: oklch(0.4 0.16 245);
  --border-muted: oklch(0.3 0.16 250);
  --primary: oklch(0.76 0.16 245);
  --secondary: oklch(0.76 0.16 210);
  --accent: oklch(0.7 0.16 25);        /* Clownfish orange */
}
```

**Key Changes from Original:**
- **Gradients**: Purple-to-blue instead of purple-to-yellow-green
- **Hover States**: Clownfish orange (#FF8C33 / hsl(25 100% 60%)) for all hover effects
- **Secondary Color**: Blue instead of yellow-green
- **Consistent Hue Progression**: 270° → 260° → 250° → 245° → 240° for smooth gradient

### Glassmorphism Effects

Modern glassmorphism styling throughout the interface:

```css
/* Glassmorphism cards */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* Enhanced hover effects */
.glass-card:hover {
  background: rgba(255, 140, 51, 0.1); /* Clownfish orange tint */
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(255, 140, 51, 0.3);
}
```

### Full-Width Layout System

```css
/* Full-width containers */
.full-width {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  padding: 0 2rem;
}

/* Album and song listings */
.album-grid, .song-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: none; /* Remove center constraints */
}
```

### Applying Colors

Components use the updated color scheme with clownfish orange hover states:

```css
/* Base layout with interactive background */
body {
  background: var(--bg);
  color: var(--text);
  /* Interactive gradient background applied */
}

/* Navigation */
.navbar {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.navbar a:hover {
  color: var(--accent); /* Clownfish orange */
}

/* Album and song cards */
.album-card, .song-card {
  background: var(--bg-light);
  border: 1px solid var(--border);
  /* Glassmorphism effects applied */
}

.album-card:hover, .song-card:hover {
  border-color: var(--accent);
  color: var(--accent);
  /* Enhanced hover animations */
}

/* Links and buttons */
.streaming-link {
  color: var(--primary);
}

.streaming-link:hover {
  color: var(--accent); /* Clownfish orange */
}

/* Search and filter controls */
.search-input {
  background: var(--bg-light);
  border: 1px solid var(--border);
  color: var(--text);
}

.filter-button.active {
  background: var(--primary);
  color: var(--bg-dark);
}

.filter-button:hover {
  background: var(--accent);
  color: var(--bg-dark);
}

/* Creator-friendly badges */
.creator-badge {
  background: var(--success);
  color: var(--bg-dark);
}

/* Album artwork */
.album-artwork {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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