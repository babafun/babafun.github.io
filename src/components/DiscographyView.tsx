import React from 'react';
import type { Album, Track } from '../types/music';

export interface DiscographyViewProps {
  albums: Album[];
}

interface SongItemProps {
  track: Track;
  albumStreamLink: string;
}

const SongItem: React.FC<SongItemProps> = ({ track, albumStreamLink }) => {
  const streamLink = track.overrideStreamLink ?? albumStreamLink;
  const isCreatorFriendly = (license: string) => {
    const l = (license || '').toLowerCase().trim();
    return /^cc by( \d+\.\d+)?$/.test(l) || /^cc by-sa( \d+\.\d+)?$/.test(l) ||
           /^cc0( \d+\.\d+)?$/.test(l) || l === 'bgml-p';
  };

  return (
    <article className="song-card" role="article">
      <header>
        <h4 className="mb-1">{track.title}</h4>
      </header>

      <div className="song-meta">
        {isCreatorFriendly(track.license) && (
          <span className="badge creator-friendly" title="This song is free for creators to use">
            Creator Friendly
          </span>
        )}
      </div>

      <div className="song-details mt-1">
        {track.license && (
          <p className="song-license">
            <strong>License:</strong> {track.license}
          </p>
        )}

        <p className="mt-1">
          <a
            href={streamLink}
            target="_blank"
            rel="noopener noreferrer"
            className="streaming-link"
            aria-label={`Listen to ${track.title} on streaming platform`}
          >
            Listen Now
          </a>
        </p>
      </div>
    </article>
  );
};

interface AlbumSectionProps {
  album: Album;
}

const AlbumSection: React.FC<AlbumSectionProps> = ({ album }) => {
  return (
    <section
      className="album-section"
      role="region"
      aria-labelledby={`album-${album.id}`}
    >
      <header>
        <h2 id={`album-${album.id}`} className="album-header">
          {album.title}
        </h2>
        <p className="text-muted mb-2">
          {album.tracks.length} track{album.tracks.length !== 1 ? 's' : ''}
        </p>
      </header>

      <div className="album-tracks">
        {album.tracks.map((track) => (
          <SongItem key={track.id} track={track} albumStreamLink={album.streamLink} />
        ))}
      </div>
    </section>
  );
};

export const DiscographyView: React.FC<DiscographyViewProps> = ({ albums }) => {
  if (!albums || albums.length === 0) {
    return (
      <main className="discography-view" role="main">
        <div className="empty-state text-center" role="status" aria-live="polite">
          <h2 className="text-muted">No Albums Found</h2>
          <p className="text-muted">
            There are no albums to display in the discography.
          </p>
        </div>
      </main>
    );
  }

  const totalTracks = albums.reduce((total, album) => total + album.tracks.length, 0);

  return (
    <main className="discography-view" role="main">
      <header className="discography-header mb-3">
        <h1 className="sr-only">Discography</h1>
        <p className="text-muted text-center">
          {albums.length} album{albums.length !== 1 ? 's' : ''} • {totalTracks} track{totalTracks !== 1 ? 's' : ''}
        </p>
      </header>

      <div className="albums-container">
        {albums.map((album) => (
          <AlbumSection key={album.id} album={album} />
        ))}
      </div>
    </main>
  );
};

export default DiscographyView;