import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { DataLoader } from '../utils/dataLoader';
import type { MusicData, Album, Track } from '../types/music';

const SongPage: React.FC = () => {
  const { songId } = useParams<{ songId: string }>();
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
      <div className="page song-page">
        <div className="loading-container"><p>Loading song...</p></div>
      </div>
    );
  }

  if (error || !albums) {
    return (
      <div className="page song-page">
        <div className="error-container">
          <h1>Error</h1>
          <p>{error || 'Failed to load song'}</p>
        </div>
      </div>
    );
  }

  // Find track by ID across all albums
  let foundTrack: Track | undefined;
  let foundAlbum: Album | undefined;
  for (const album of albums) {
    const track = album.tracks.find(t => t.id === songId);
    if (track) {
      foundTrack = track;
      foundAlbum = album;
      break;
    }
  }

  if (!foundTrack || !foundAlbum) return <Navigate to="/music/discography" replace />;

  const streamLink = foundTrack.overrideStreamLink ?? foundAlbum.streamLink;

  const isCreatorFriendly = (license: string) => {
    const l = (license || '').toLowerCase().trim();
    return /^cc by( \d+\.\d+)?$/.test(l) || /^cc by-sa( \d+\.\d+)?$/.test(l) ||
           /^cc0( \d+\.\d+)?$/.test(l) || l === 'bgml-p';
  };

  const getLicenseDescription = (license: string) => {
    const descriptions: Record<string, string> = {
      'CC BY 4.0': 'Creative Commons Attribution - You can use this track freely with attribution',
      'CC BY-SA 4.0': 'Creative Commons Attribution-ShareAlike - Use with attribution, share derivatives under same license',
      'CC0 1.0': 'Public Domain - No rights reserved, use freely without attribution',
      'CC0': 'Public Domain - No rights reserved, use freely without attribution',
      'BGML-P': 'Babafun Game Music License (Permissive) - Free for game development and content creation',
      'All Rights Reserved': 'Traditional copyright - Contact for licensing'
    };
    return descriptions[license] || license;
  };

  return (
    <div className="page song-page">
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/music" className="breadcrumb-link">Music</Link>
          <span className="breadcrumb-separator">→</span>
          <Link to="/music/discography" className="breadcrumb-link">Discography</Link>
          <span className="breadcrumb-separator">→</span>
          <Link to={`/music/a/${foundAlbum.id}`} className="breadcrumb-link">{foundAlbum.title}</Link>
          <span className="breadcrumb-separator">→</span>
          <span className="breadcrumb-current">{foundTrack.title}</span>
        </div>
      </div>

      <div className="song-details">
        <div className="song-header">
          <h1 className="song-title">{foundTrack.title}</h1>
          <p className="song-album">
            from <Link to={`/music/a/${foundAlbum.id}`} className="album-link">{foundAlbum.title}</Link>
          </p>
        </div>

        <div className="song-info-grid">
          <div className="info-section">
            <h3>Release Information</h3>
            <div className="info-items">
              <div className="info-item">
                <span className="info-label">Release Year:</span>
                <span className="info-value">{foundAlbum.releaseYear}</span>
              </div>
              {foundAlbum.releaseLabel && (
                <div className="info-item">
                  <span className="info-label">Label:</span>
                  <span className="info-value">{foundAlbum.releaseLabel}</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-label">Content ID:</span>
                <span className={`label ${foundAlbum.hasContentId ? 'label-content-id' : 'label-no-content-id'}`}>
                  {foundAlbum.hasContentId ? 'Yes' : 'No'}
                </span>
              </div>
              {isCreatorFriendly(foundTrack.license) && (
                <div className="info-item">
                  <span className="info-label">Creator Friendly:</span>
                  <span className="label label-creator-friendly">Yes</span>
                </div>
              )}
            </div>
          </div>

          {foundTrack.license && (
            <div className="info-section">
              <h3>License</h3>
              <div className="license-info">
                <div className="license-name">{foundTrack.license}</div>
                <div className="license-description">{getLicenseDescription(foundTrack.license)}</div>
              </div>
            </div>
          )}
        </div>

        <div className="song-actions">
          <a href={streamLink} target="_blank" rel="noopener noreferrer"
             className="btn btn-primary btn-large">Listen Now</a>
          <Link to={`/music/a/${foundAlbum.id}`} className="btn btn-secondary">View Album</Link>
        </div>
      </div>
    </div>
  );
};

export default SongPage;
