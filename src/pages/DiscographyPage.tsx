import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DataLoader } from '../utils/dataLoader';
import type { MusicData } from '../types/music';

const DiscographyPage: React.FC = () => {
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
      <div className="page discography-page">
        <div className="loading-container"><p>Loading discography...</p></div>
      </div>
    );
  }

  if (error || !albums) {
    return (
      <div className="page discography-page">
        <div className="error-container">
          <h1>Error</h1>
          <p>{error || 'Failed to load discography'}</p>
        </div>
      </div>
    );
  }

  // Sort albums by year (newest first)
  const sortedAlbums = [...albums].sort((a, b) => b.releaseYear - a.releaseYear);

  return (
    <div className="page discography-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Discography</h1>
          <p className="page-description">All albums organised chronologically</p>
          <Link to="/music/search" className="btn btn-secondary">Search Songs</Link>
        </div>
      </div>

      <div className="albums-list">
        {sortedAlbums.map((album) => (
          <div key={album.id} className="album-item">
            <div className="album-content">
              {album.albumArtwork && (
                <img
                  src={album.albumArtwork}
                  alt={`${album.title} album artwork`}
                  className="album-artwork album-artwork-large"
                  loading="lazy"
                />
              )}
              <div className="album-info">
                <h2 className="album-title">
                  <Link to={`/music/a/${album.id}`} className="album-link">{album.title}</Link>
                </h2>
                <div className="album-meta">
                  <span className="album-year">{album.releaseYear}</span>
                  <span className="album-count">{album.tracks.length} tracks</span>
                  {album.releaseLabel && (
                    <span className="album-label">{album.releaseLabel}</span>
                  )}
                </div>
              </div>
              <div className="album-actions">
                <Link to={`/music/a/${album.id}`} className="btn btn-primary">View Album</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscographyPage;
