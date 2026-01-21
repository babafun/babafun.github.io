/**
 * SongDetailView Component
 * 
 * Displays detailed information for each song including all metadata.
 * Validates Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 * 
 * Features:
 * - Shows all song metadata (album, release type, Content ID, streaming link)
 * - Conditionally displays license (only if non-empty)
 * - Renders streaming links as clickable elements
 * - Applies consistent styling with purple theme
 * - Uses semantic HTML for accessibility
 */

import React from 'react';
import type { Song } from '../types/music';

/**
 * Props interface for SongDetailView component
 */
export interface SongDetailViewProps {
  /** Array of songs to display */
  songs: Song[];
}

/**
 * Individual song detail card component
 */
interface SongDetailCardProps {
  song: Song;
}

const SongDetailCard: React.FC<SongDetailCardProps> = ({ song }) => {
  /**
   * Determines if license should be displayed
   * License is displayed only if it's not an empty string
   */
  const shouldDisplayLicense = (license: string): boolean => {
    return license.trim() !== '';
  };

  /**
   * Determines if a song is creator-friendly based on license and release type
   */
  const isCreatorFriendly = (song: Song): boolean => {
    // NCS releases are always creator-friendly
    if (song.releaseType === 'NCS') {
      return true;
    }
    
    // Check for commercial CC licenses
    const license = song.license.toLowerCase();
    if (license.includes('cc by') || license.includes('cc0') || license.includes('bgml-p')) {
      return true;
    }
    
    return false;
  };

  /**
   * Gets a human-readable description of the Content ID status
   */
  const getContentIdDescription = (hasContentId: boolean): string => {
    return hasContentId 
      ? 'This song has YouTube Content ID enabled and may claim revenue on videos'
      : 'This song does not have YouTube Content ID';
  };

  return (
    <article className="song-card song-detail-card" role="article">
      <header className="song-header">
        <h3 className="song-title mb-1">{song.title}</h3>
        <p className="song-album text-muted">
          from <em>{song.albumName}</em>
        </p>
      </header>

      <div className="song-metadata mt-2">
        <div className="metadata-row">
          <strong>Release Type:</strong>
          <span className={`badge ${song.releaseType.toLowerCase()} ml-1`}>
            {song.releaseType}
          </span>
        </div>

        <div className="metadata-row mt-1">
          <strong>Content ID:</strong>
          <span 
            className={`badge ${song.hasContentId ? 'content-id' : 'success'} ml-1`}
            title={getContentIdDescription(song.hasContentId)}
          >
            {song.hasContentId ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {shouldDisplayLicense(song.license) && (
          <div className="metadata-row mt-1">
            <strong>License:</strong>
            <span className="song-license ml-1">{song.license}</span>
          </div>
        )}

        {isCreatorFriendly(song) && (
          <div className="metadata-row mt-1">
            <span className="badge creator-friendly" title="This song is free for creators to use">
              ✓ Creator Friendly
            </span>
          </div>
        )}
      </div>

      <footer className="song-actions mt-2">
        <a 
          href={song.streamingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="streaming-link"
          aria-label={`Listen to ${song.title} by opening streaming platform in new tab`}
        >
          🎵 Listen Now
        </a>
      </footer>
    </article>
  );
};

/**
 * SongDetailView Component
 * 
 * Displays detailed information for each song
 * - Shows all song metadata
 * - Conditionally displays license (only if non-empty)
 * - Renders streaming links as clickable elements
 * - Formats all information in a clear, readable layout
 * 
 * @param props - Component props containing songs array
 * @returns JSX element representing the song detail view
 */
export const SongDetailView: React.FC<SongDetailViewProps> = ({ songs }) => {
  // Handle empty state
  if (!songs || songs.length === 0) {
    return (
      <div className="empty-state text-center" role="status" aria-live="polite">
        <h2 className="text-muted">No Songs Found</h2>
        <p className="text-muted">
          There are no songs to display.
        </p>
      </div>
    );
  }

  // Group songs by release type for better organization
  const songsByReleaseType = songs.reduce((groups, song) => {
    const releaseType = song.releaseType;
    if (!groups[releaseType]) {
      groups[releaseType] = [];
    }
    groups[releaseType].push(song);
    return groups;
  }, {} as Record<string, Song[]>);

  const releaseTypes = Object.keys(songsByReleaseType).sort();

  return (
    <main className="song-detail-view" role="main">
      <header className="view-header mb-3">
        <h1 className="sr-only">Song Details</h1>
        <p className="text-muted text-center">
          {songs.length} song{songs.length !== 1 ? 's' : ''} with detailed information
        </p>
      </header>

      <div className="songs-container">
        {releaseTypes.map((releaseType) => (
          <section 
            key={releaseType}
            className="release-type-section mb-3"
            role="region"
            aria-labelledby={`release-${releaseType.toLowerCase()}`}
          >
            <header>
              <h2 
                id={`release-${releaseType.toLowerCase()}`}
                className="release-type-header"
              >
                {releaseType} Releases
              </h2>
              <p className="text-muted mb-2">
                {songsByReleaseType[releaseType].length} song{songsByReleaseType[releaseType].length !== 1 ? 's' : ''}
              </p>
            </header>
            
            <div className="songs-grid">
              {songsByReleaseType[releaseType].map((song) => (
                <SongDetailCard key={song.id} song={song} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
};

export default SongDetailView;