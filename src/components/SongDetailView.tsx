import React from 'react';
import type { SongView } from '../types/music';
import { shouldDisplayLicense } from '../utils/display';

export interface SongDetailViewProps {
  songs: SongView[];
}

interface SongDetailCardProps {
  song: SongView;
}

const SongDetailCard: React.FC<SongDetailCardProps> = ({ song }) => {
  const isCreatorFriendly = (song: SongView): boolean => {
    const license = (song.license || '').toLowerCase().trim();
    return /^cc by( \d+\.\d+)?$/.test(license) || /^cc by-sa( \d+\.\d+)?$/.test(license) ||
           /^cc0( \d+\.\d+)?$/.test(license) || license === 'bgml-p';
  };

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
          from <em>{song.albumTitle}</em>
        </p>
      </header>

      <div className="song-metadata mt-2">
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
          href={song.streamLink}
          target="_blank"
          rel="noopener noreferrer"
          className="streaming-link"
          aria-label={`Listen to ${song.title} by opening streaming platform in new tab`}
        >
          Listen Now
        </a>
      </footer>
    </article>
  );
};

export const SongDetailView: React.FC<SongDetailViewProps> = ({ songs }) => {
  if (!songs || songs.length === 0) {
    return (
      <div className="empty-state text-center" role="status" aria-live="polite">
        <h2 className="text-muted">No Songs Found</h2>
        <p className="text-muted">There are no songs to display.</p>
      </div>
    );
  }

  return (
    <main className="song-detail-view" role="main">
      <header className="view-header mb-3">
        <h1 className="sr-only">Song Details</h1>
        <p className="text-muted text-center">
          {songs.length} song{songs.length !== 1 ? 's' : ''} with detailed information
        </p>
      </header>

      <div className="songs-container">
        {songs.map((song) => (
          <SongDetailCard key={song.id} song={song} />
        ))}
      </div>
    </main>
  );
};

export default SongDetailView;