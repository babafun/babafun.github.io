import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { DataLoader } from '../utils/dataLoader';
import type { MusicData, Song } from '../types/music';

const AlbumPage: React.FC = () => {
  const { albumId } = useParams<{ albumId: string }>();
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

  const createSongId = (songTitle: string) => {
    return songTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  if (loading) {
    return (
      <div className="page album-page">
        <div className="loading-container">
          <p>Loading album...</p>
        </div>
      </div>
    );
  }

  if (error || !musicData) {
    return (
      <div className="page album-page">
        <div className="error-container">
          <h1>Error</h1>
          <p>{error || 'Failed to load album'}</p>
        </div>
      </div>
    );
  }

  // Find the album by ID
  const album = musicData.albums.find(a => createAlbumId(a.name) === albumId);

  if (!album) {
    return <Navigate to="/music/discography" replace />;
  }

  // Sort songs by title
  const sortedSongs = [...album.songs].sort((a, b) => a.title.localeCompare(b.title));

  const getAlbumYear = () => {
    const years = album.songs.map(song => song.releaseYear);
    return Math.min(...years);
  };

  const isCreatorFriendly = (song: Song) => {
    return song.releaseType === 'NCS' || 
           song.license.toLowerCase().includes('cc') || 
           song.license === 'BGML-P';
  };

  return (
    <div className="page album-page">
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/music" className="breadcrumb-link">Music</Link>
          <span className="breadcrumb-separator">→</span>
          <Link to="/music/discography" className="breadcrumb-link">Discography</Link>
          <span className="breadcrumb-separator">→</span>
          <span className="breadcrumb-current">{album.name}</span>
        </div>
        
        <div className="album-header">
          {album.songs[0]?.albumArtwork && (
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <img 
                src={album.songs[0].albumArtwork} 
                alt={`${album.name} album artwork`}
                style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '20px',
                  objectFit: 'cover',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                  marginBottom: '1rem'
                }}
                loading="lazy"
              />
            </div>
          )}
          <h1 className="album-title">{album.name}</h1>
          <div className="album-meta">
            <span className="album-year">{getAlbumYear()}</span>
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
      </div>
      
      <div className="songs-list">
        {sortedSongs.map((song, index) => {
          const songId = createSongId(song.title);
          
          return (
            <div key={song.id} className="song-item">
              <div className="song-content">
                {song.albumArtwork && (
                  <img 
                    src={song.albumArtwork} 
                    alt={`${song.albumName} album artwork`}
                    className="album-artwork"
                    loading="lazy"
                  />
                )}
                <div className="song-number">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="song-info">
                  <h3 className="song-title">
                    <Link to={`/music/s/${songId}`} className="song-link">
                      {song.title}
                    </Link>
                  </h3>
                  <div className="song-meta">
                    <span className="song-year">{song.releaseYear}</span>
                    <span className={`label label-${song.releaseType.toLowerCase()}`}>
                      {song.releaseType}
                    </span>
                    {isCreatorFriendly(song) && (
                      <span className="label label-creator-friendly">Creator Friendly</span>
                    )}
                    {song.hasContentId && (
                      <span className="label label-content-id">Content ID</span>
                    )}
                  </div>
                  {song.license && (
                    <div className="song-license">
                      License: {song.license}
                    </div>
                  )}
                </div>
                <div className="song-actions">
                  <a 
                    href={song.streamingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-small"
                  >
                    Listen
                  </a>
                  <Link to={`/music/s/${songId}`} className="btn btn-primary btn-small">
                    Details
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

export default AlbumPage;