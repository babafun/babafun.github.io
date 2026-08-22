# Requirements Document

## Introduction

This document specifies the requirements for a multi-section music portfolio website for "babafun" that displays a musician's discography with routing, search functionality, and creator-friendly filtering. The system manages music data through JSON files and provides a responsive, accessible interface with an interactive gradient background and purple-to-blue color scheme.

## Glossary

- **System**: The music portfolio website application with multi-section routing
- **Music_Data_Store**: JSON file containing album and song information with artwork URLs, structured as a list of albums
- **Navbar**: Top navigation component with HOME, MUSIC, CODE, LICENSES sections
- **Music_Homepage**: Landing page for music section with discography access
- **Discography_Page**: Display showing albums with artwork in full-width layout
- **Album_Page**: Individual album view showing all songs with routing
- **Song_Page**: Individual song detail page with complete information
- **Search_Page**: Advanced search and filtering interface
- **Song_Detail_View**: Display mode showing complete information for individual songs
- **Creator_List_View**: Filtered display showing only songs free for creators to use
- **Content_ID**: YouTube's Content ID system that can claim revenue on videos using the music
- **Release_Label**: Optional label or distributor associated with an album (e.g. a self-release label name). Stored at the album level.
- **License**: Legal terms under which a song can be used
- **CC_License**: Specific type of license — Creative Commons license allowing commercial use
- **BGML_P_License**: Babafun Game Music License (the Babafun Game Music licenses will be part of a different section of the website) — Permissive variant
- **Stream_Link**: URL to music streaming platforms. Stored at the album level; individual songs may optionally override it with a song-specific link via `overrideStreamLink`.
- **Album_Artwork**: URL to album cover image for visual display
- **Color_Scheme**: CSS custom properties defining the visual theme with purple-to-blue gradients
- **Interactive_Background**: Animated gradient background with mouse-following spotlight effect
- **UI_Component**: React component for dynamic content rendering
- **Router**: React Router system for navigation between pages
- **Song_CLI**: Python command-line script for interactively adding songs to the Music_Data_Store

## Requirements

### Requirement 1: Project Infrastructure

**User Story:** As a developer, I want the project set up with TypeScript and Vite, so that I have a modern development environment with type safety.

#### Acceptance Criteria

1. THE System SHALL be built using TypeScript as the primary language
2. THE System SHALL use Vite as the build tool and development server
3. THE System SHALL use Node.js as the runtime environment
4. THE System SHALL use React only for components requiring dynamic content rendering
5. THE System SHALL include proper TypeScript configuration for type checking

### Requirement 2: Music Data Management

**User Story:** As a content manager, I want to store music data in a simple JSON file structured by albums, so that I can easily update my discography without database complexity.

#### Acceptance Criteria

1. THE Music_Data_Store SHALL be a JSON file whose top-level value is a list of album objects
2. EACH album object SHALL contain: a unique album id, title, releaseYear, streamLink, hasContentId (boolean), releaseLabel (optional string), albumArtwork URL, and a tracks array
3. EACH track in the tracks array SHALL contain: a unique id, title, and license (string, may be empty)
4. A track MAY optionally include an `overrideStreamLink` field; when present it takes precedence over the album-level `streamLink` for that song
5. THE Music_Data_Store SHALL store Content ID status as a boolean at the album level
6. THE Music_Data_Store SHALL allow the license field on a track to be an empty string
7. THE Music_Data_Store SHALL allow the releaseLabel field on an album to be absent or an empty string (representing a self-release)
8. THE System SHALL load and parse the Music_Data_Store at application startup
9. THE System SHALL validate the structure of the Music_Data_Store on load

### Requirement 3: Multi-Section Website Structure

**User Story:** As a visitor, I want to navigate between different sections (HOME, MUSIC, CODE, LICENSES), so that I can explore both the musician's work and development projects.

#### Acceptance Criteria

1. THE System SHALL implement a prominent top navigation bar with HOME, MUSIC, CODE, LICENSES options
2. THE System SHALL use React Router for client-side routing between sections
3. THE System SHALL organize all music-related content under /music/ routes
4. THE System SHALL display "babafun" as the site brand name
5. THE System SHALL display "stuff about me" as the tagline
6. THE System SHALL provide a HOME page with general information
7. THE System SHALL provide a CODE page showcasing development work
8. THE System SHALL provide a LICENSES page with legal information
9. THE Navbar SHALL be visible on all pages for consistent navigation

### Requirement 4: Music Section Structure

**User Story:** As a visitor, I want to browse music through a structured hierarchy (homepage → discography → albums → songs), so that I can easily discover and explore the artist's work.

#### Acceptance Criteria

1. THE Music_Homepage SHALL be accessible at /music/ route
2. THE Music_Homepage SHALL display placeholder text and a "View Discography" button
3. THE Discography_Page SHALL be accessible at /music/discography route
4. THE Discography_Page SHALL display all albums with artwork in a full-width layout
5. THE Album_Page SHALL be accessible at /music/a/[album-id] routes
6. THE Album_Page SHALL display all songs within the selected album
7. THE Song_Page SHALL be accessible at /music/s/[song-id] routes using actual song IDs
8. THE Song_Page SHALL display complete information for the selected song
9. THE System SHALL maintain consistent navigation between all music pages

### Requirement 5: Search and Filtering System

**User Story:** As a visitor, I want to search and filter songs by various criteria, so that I can quickly find music that meets my specific needs.

#### Acceptance Criteria

1. THE Search_Page SHALL be accessible from all music pages via a search button
2. THE Search_Page SHALL provide text search functionality across song titles
3. THE Search_Page SHALL provide multi-select filtering by release label
4. THE Search_Page SHALL provide multi-select filtering by license type
5. THE Search_Page SHALL provide a toggle for creator-friendly songs only
6. THE Search_Page SHALL provide sorting options by title and release year
7. THE Search_Page SHALL display results in real-time as filters are applied
8. THE Search_Page SHALL show album artwork for each result
9. THE Search_Page SHALL link to individual song pages using song IDs

### Requirement 6: Song Detail Display

**User Story:** As a visitor, I want to see complete information about each song, so that I can understand its release details and access streaming platforms.

#### Acceptance Criteria

1. THE Song_Detail_View SHALL display the song's album title
2. THE Song_Detail_View SHALL display the album's release label (if present)
3. THE Song_Detail_View SHALL display the album's Content ID status
4. THE Song_Detail_View SHALL display a streaming link as a clickable element
5. WHEN a song has an `overrideStreamLink`, THE Song_Detail_View SHALL use that link
6. WHEN a song does not have an `overrideStreamLink`, THE Song_Detail_View SHALL use the album-level `streamLink`
7. THE Song_Detail_View SHALL display the album's release year
8. THE Song_Detail_View SHALL display the album artwork
9. WHEN a song has a non-empty license field, THE Song_Detail_View SHALL display the license information
10. WHEN a song has an empty license field, THE Song_Detail_View SHALL omit the license from display
11. THE Song_Detail_View SHALL format all information in a clear, readable layout

### Requirement 7: Creator-Friendly List

**User Story:** As a content creator, I want to see which songs I can use in my videos, so that I can find music without copyright concerns.

#### Acceptance Criteria

1. THE Creator_List_View SHALL display only songs that are free for creators to use
2. WHEN filtering songs, THE Creator_List_View SHALL include all songs with CC licenses allowing commercial use
3. WHEN filtering songs, THE Creator_List_View SHALL include all songs with BGML_P_License
4. THE Creator_List_View SHALL exclude songs that do not meet the creator-friendly criteria
5. THE Creator_List_View SHALL display the same song information as Song_Detail_View for included songs

### Requirement 8: Visual Styling and Interactive Design

**User Story:** As a visitor, I want the website to have an engaging interactive design with purple-to-blue gradients and enhanced typography, so that I experience a visually appealing and modern interface.

#### Acceptance Criteria

1. THE System SHALL implement an Interactive_Background with animated gradients
2. THE Interactive_Background SHALL follow mouse movement with a spotlight effect
3. THE Color_Scheme SHALL use purple-to-blue gradients instead of purple-to-yellow-green
4. THE Color_Scheme SHALL use clownfish orange (#FF8C33) for hover states
5. THE System SHALL implement the Color_Scheme using CSS custom properties
6. THE System SHALL support both dark mode and light mode variants
7. THE System SHALL use multiple Google Fonts for enhanced typography:
   - Orbitron for titles and headings
   - Space Grotesk for secondary headings
   - Inter for body text
8. THE System SHALL apply glassmorphism effects with shadows and highlights
9. THE System SHALL provide smooth hover animations throughout the interface
10. THE System SHALL use full-width layouts instead of boxed/centered content
11. THE System SHALL apply the Color_Scheme consistently across all UI_Components

### Requirement 9: Privacy and Contact Information

**User Story:** As a site owner who is a minor, I want all contact sections hidden, so that my privacy is protected.

#### Acceptance Criteria

1. THE System SHALL not display any contact forms
2. THE System SHALL not display any email addresses
3. THE System SHALL not display any social media contact links
4. THE System SHALL not display any direct messaging interfaces
5. WHEN rendering pages, THE System SHALL omit all contact-related UI_Components

### Requirement 10: Responsive Design

**User Story:** As a visitor on any device, I want the website to work well on my screen size, so that I can browse music comfortably.

#### Acceptance Criteria

1. THE System SHALL render correctly on mobile devices (320px - 767px width)
2. THE System SHALL render correctly on tablet devices (768px - 1023px width)
3. THE System SHALL render correctly on desktop devices (1024px and above width)
4. WHEN the viewport size changes, THE System SHALL adapt the layout appropriately
5. THE System SHALL maintain readability at all supported screen sizes
6. THE System SHALL use full-width layouts that utilize the entire browser width

### Requirement 11: Accessibility

**User Story:** As a visitor using assistive technology, I want the website to be accessible, so that I can navigate and understand the content.

#### Acceptance Criteria

1. THE System SHALL use semantic HTML elements for content structure
2. THE System SHALL provide appropriate ARIA labels for interactive elements
3. THE System SHALL maintain sufficient color contrast ratios between text and backgrounds
4. THE System SHALL support keyboard navigation for all interactive elements
5. WHEN displaying links, THE System SHALL provide clear link text or aria-labels
6. THE System SHALL provide alternative text for any images or icons

### Requirement 12: Performance

**User Story:** As a visitor, I want the website to load quickly, so that I can access music information without delay.

#### Acceptance Criteria

1. THE System SHALL load the Music_Data_Store efficiently on initial page load
2. THE System SHALL minimize unnecessary re-renders of UI_Components
3. THE System SHALL optimize asset loading through Vite's build process
4. WHEN switching between views, THE System SHALL respond without noticeable delay
5. THE System SHALL lazy-load UI_Components where appropriate
6. THE System MUST use Rust for any computation-heavy parts of the code

### Requirement 13: Song CLI Tool

**User Story:** As the site owner, I want a Python script I can run locally to add songs to my discography, so that I don't have to manually edit JSON.

#### Acceptance Criteria

1. THE Song_CLI SHALL be a Python script located at `devtools/add_song.py`
2. WHEN run, THE Song_CLI SHALL prompt for the song title
3. THE Song_CLI SHALL then present a fuzzy-searchable list of existing album titles using keyboard up/down navigation and Enter to confirm
4. WHEN the user types, THE Song_CLI SHALL filter the album list in real-time (fuzzy match)
5. WHEN no albums match the typed input, THE Song_CLI SHALL show an option to create a new album with the typed name
6. WHEN the user selects an existing album, THE Song_CLI SHALL add the song to that album's tracks array
7. WHEN the user selects "new album", THE Song_CLI SHALL prompt for: streamLink, releaseYear, hasContentId (y/n), albumArtwork URL, and optionally a releaseLabel
8. THE Song_CLI SHALL ask whether the streaming link is specific to this song or for the whole release
9. WHEN the link is song-specific, THE Song_CLI SHALL store it as `overrideStreamLink` on the track
10. WHEN the link is for the whole release, THE Song_CLI SHALL store it as the album-level `streamLink` (or skip if album already has one)
11. THE Song_CLI SHALL prompt for the song's license (may be left blank)
12. THE Song_CLI SHALL generate a unique track id based on the song title (slugified)
13. THE Song_CLI SHALL write the updated data back to `src/data/music.json`
14. THE Song_CLI SHALL support adding multiple songs in a single session by asking "Add another song?" after each addition
15. THE Song_CLI SHALL require only Python standard library plus one fuzzy-find/interactive selection library (e.g. `prompt_toolkit` or `questionary`)
