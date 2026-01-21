import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DataLoader } from '../utils/dataLoader';
import type { MusicData, Album } from '../types/music';

const DiscographyPage: React.FC = () => {
  const [musicData, setMusicData] = useState<MusicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dataLoader = DataLoader.getInstance();
        const data = await dataLoader.loadMusicData();
        setMusicData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load music data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const createAlbumId = (albumName: string) => {
    return albumName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const getAlbumYear = (album: Album) => {
    const years = album.songs.map(song => song.releaseYear);
    return Math.min(...years);
  };

  if (loading) {
    return (
      <div className="page discography-page">
        <div className="loading-container">
          <p>Loading discography...</p>
        </div>
      </div>
    );
  }

  if (error || !musicData) {
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
  const sortedAlbums = [...musicData.albums].sort((a, b) => {
    return getAlbumYear(b) - getAlbumYear(a);
  });

  return (
    <div className="page discography-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Discography</h1>
          <p className="page-description">
            All albums organised chronologically
          </p>
          <Link to="/music/search" className="btn btn-secondary">
            Search Songs
          </Link>
        </div>
      </div>
      
      <div className="albums-list">
        {sortedAlbums.map((album) => {
          const albumId = createAlbumId(album.name);
          const albumYear = getAlbumYear(album);
          const albumArtwork = album.songs[0]?.albumArtwork; // Get artwork from first song
          
          return (
            <div key={album.name} className="album-item">
              <div className="album-content">
                {albumArtwork && (
                  <img 
                    src={albumArtwork} 
                    alt={`${album.name} album artwork`}
                    className="album-artwork album-artwork-large"
                    loading="lazy"
                  />
                )}
                <div className="album-info">
                  <h2 className="album-title">
                    <Link to={`/music/a/${albumId}`} className="album-link">
                      {album.name}
                    </Link>
                  </h2>
                  <div className="album-meta">
                    <span className="album-year">{albumYear}</span>
                    <span className="album-count">{album.songs.length} songs</span>
                  </div>
                  <div className="album-labels">
                    {Array.from(new Set(album.songs.map(song => song.releaseType))).map(label => (
                      <span key={label} className={`label label-${label.toLowerCase()}`}>
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="album-actions">
                  <Link to={`/music/a/${albumId}`} className="btn btn-primary">
                    View Album
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DiscographyPage;