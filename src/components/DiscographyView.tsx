/**
 * DiscographyView Component
 * 
 * Displays songs organized by albums with album headers and song lists.
 * Validates Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 * 
 * Features:
 * - Groups songs by album name
 * - Displays album names as section headers
 * - Lists songs under each album
 * - Applies consistent purple theme styling
 * - Uses semantic HTML for accessibility
 */

import React from 'react';
import type { Album, Song } from '../types/music';

/**
 * Props interface for DiscographyView component
 */
export interface DiscographyViewProps {
  /** Array of albums with their songs */
  albums: Album[];
}

/**
 * Individual song item component within an album
 */
interface SongItemProps {
  song: Song;
}

const SongItem: React.FC<SongItemProps> = ({ song }) => {
  return (
    <article className="song-card" role="article">
      <header>
        <h4 className="mb-1">{song.title}</h4>
      </header>
      
      <div className="song-meta">
        <span className={`badge ${song.releaseType.toLowerCase()}`}>
          {song.releaseType}
        </span>
        
        {song.hasContentId && (
          <span className="badge content-id" title="This song has YouTube Content ID enabled">
            Content ID
          </span>
        )}
        
        {(song.releaseType === 'NCS' || 
          song.license.toLowerCase().includes('cc') || 
          song.license.toLowerCase().includes('bgml-p')) && (
          <span className="badge creator-friendly" title="This song is free for creators to use">
            Creator Friendly
          </span>
        )}
      </div>
      
      <div className="song-details mt-1">
        <p className="song-meta">
          <strong>Release:</strong> {song.releaseType}
          {song.hasContentId && <span className="text-muted"> • Content ID Enabled</span>}
        </p>
        
        {song.license && (
          <p className="song-license">
            <strong>License:</strong> {song.license}
          </p>
        )}
        
        <p className="mt-1">
          <a 
            href={song.streamingLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="streaming-link"
            aria-label={`Listen to ${song.title} on streaming platform`}
          >
            Listen Now
          </a>
        </p>
      </div>
    </article>
  );
};

/**
 * Album section component
 */
interface AlbumSectionProps {
  album: Album;
}

const AlbumSection: React.FC<AlbumSectionProps> = ({ album }) => {
  return (
    <section className="album-section" role="region" aria-labelledby={`album-${album.name.replace(/\s+/g, '-').toLowerCase()}`}>
      <header>
        <h2 
          id={`album-${album.name.replace(/\s+/g, '-').toLowerCase()}`}
          className="album-header"
        >
          {album.name}
        </h2>
        <p className="text-muted mb-2">
          {album.songs.length} song{album.songs.length !== 1 ? 's' : ''}
        </p>
      </header>
      
      <div className="album-songs">
        {album.songs.map((song) => (
          <SongItem key={song.id} song={song} />
        ))}
      </div>
    </section>
  );
};

/**
 * DiscographyView Component
 * 
 * Displays songs organized by albums
 * - Renders album sections with headers
 * - Lists songs under each album
 * - Applies consistent styling with purple theme
 * - Uses semantic HTML for accessibility
 * 
 * @param props - Component props containing albums array
 * @returns JSX element representing the discography view
 */
export const DiscographyView: React.FC<DiscographyViewProps> = ({ albums }) => {
  // Handle empty state
  if (!albums || albums.length === 0) {
    return (
      <div className="empty-state text-center" role="status" aria-live="polite">
        <h2 className="text-muted">No Albums Found</h2>
        <p className="text-muted">
          There are no albums to display in the discography.
        </p>
      </div>
    );
  }

  // Calculate total songs across all albums
  const totalSongs = albums.reduce((total, album) => total + album.songs.length, 0);

  return (
    <main className="discography-view" role="main">
      <header className="discography-header mb-3">
        <h1 className="sr-only">Discography</h1>
        <p className="text-muted text-center">
          {albums.length} album{albums.length !== 1 ? 's' : ''} • {totalSongs} song{totalSongs !== 1 ? 's' : ''}
        </p>
      </header>

      <div className="albums-container">
        {albums.map((album) => (
          <AlbumSection key={album.name} album={album} />
        ))}
      </div>
    </main>
  );
};

export default DiscographyView;