import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { DataLoader } from '../utils/dataLoader';
import type { MusicData, Album, Track } from '../types/music';

const AlbumPage: React.FC = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const [albums, setAlbums] = useState<MusicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dataLoader = DataLoader.getInstance();
        const data = await dataLoader.loadMusicData();
        setAlbums(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load music data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="page album-page">
        <div className="loading-container"><p>Loading album...</p></div>
      </div>
    );
  }

  if (error || !albums) {
    return (
      <div className="page album-page">
        <div className="error-container">
          <h1>Error</h1>
          <p>{error || 'Failed to load album'}</p>
        </div>
      </div>
    );
  }

  const album = albums.find(a => a.id === albumId);
  if (!album) return <Navigate to="/music/discography" replace />;

  const isCreatorFriendly = (track: Track) => {
    const l = (track.license || '').toLowerCase().trim();
    return /^cc by( \d+\.\d+)?$/.test(l) || /^cc by-sa( \d+\.\d+)?$/.test(l) ||
           /^cc0( \d+\.\d+)?$/.test(l) || l === 'bgml-p';
  };

  return (
    <div className="page album-page">
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/music" className="breadcrumb-link">Music</Link>
          <span className="breadcrumb-separator"> &gt; </span>
          <Link to="/music/discography" className="breadcrumb-link">Discography</Link>
          <span className="breadcrumb-separator"> &gt; </span>
          <span className="breadcrumb-current">{album.title}</span>
        </div>

        <div className="album-header">
          {album.albumArtwork && (
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <img
                src={album.albumArtwork}
                alt={`${album.title} album artwork`}
                style={{ width: '200px', height: '200px', borderRadius: '20px', objectFit: 'cover' }}
                loading="lazy"
              />
            </div>
          )}
          <h1 className="album-title">{album.title}</h1>
          <div className="album-meta">
            <span className="album-year">{album.releaseYear}</span>
            <span className="album-count">{album.tracks.length} tracks</span>
            {album.releaseLabel && <span className="album-label">{album.releaseLabel}</span>}
          </div>
        </div>
      </div>

      <div className="songs-list">
        {album.tracks.map((track, index) => {
          const streamLink = track.overrideStreamLink ?? album.streamLink;
          return (
            <div key={track.id} className="song-item">
              <div className="song-content">
                <div className="song-number">{String(index + 1).padStart(2, '0')}</div>
                <div className="song-info">
                  <h3 className="song-title">
                    <Link to={`/music/s/${track.id}`} className="song-link">{track.title}</Link>
                  </h3>
                  <div className="song-meta">
                    {isCreatorFriendly(track) && (
                      <span className="label label-creator-friendly">Creator Friendly</span>
                    )}
                    {album.hasContentId && (
                      <span className="label label-content-id">Content ID</span>
                    )}
                  </div>
                  {track.license && (
                    <div className="song-license">License: {track.license}</div>
                  )}
                </div>
                <div className="song-actions">
                  <a href={streamLink} target="_blank" rel="noopener noreferrer"
                     className="btn btn-secondary btn-small">Listen</a>
                  <Link to={`/music/s/${track.id}`} className="btn btn-primary btn-small">Details</Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlbumPage;
