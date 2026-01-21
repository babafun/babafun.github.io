import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { DataLoader } from '../utils/dataLoader';
import type { MusicData, Song } from '../types/music';

const SongPage: React.FC = () => {
  const { songId } = useParams<{ songId: string }>();
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

  const createSongId = (songTitle: string) => {
    return songTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const createAlbumId = (albumName: string) => {
    return albumName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  if (loading) {
    return (
      <div className="page song-page">
        <div className="loading-container">
          <p>Loading song...</p>
        </div>
      </div>
    );
  }

  if (error || !musicData) {
    return (
      <div className="page song-page">
        <div className="error-container">
          <h1>Error</h1>
          <p>{error || 'Failed to load song'}</p>
        </div>
      </div>
    );
  }

  // Find the song by ID
  const song = musicData.songs.find(s => createSongId(s.title) === songId);

  if (!song) {
    return <Navigate to="/music/discography" replace />;
  }

  const albumId = createAlbumId(song.albumName);

  const isCreatorFriendly = (song: Song) => {
    return song.releaseType === 'NCS' || 
           song.license.toLowerCase().includes('cc') || 
           song.license === 'BGML-P';
  };

  const getLicenseDescription = (license: string) => {
    if (!license) return null;
    
    const descriptions: { [key: string]: string } = {
      'CC BY 4.0': 'Creative Commons Attribution - You can use this track freely with attribution',
      'CC BY-SA 4.0': 'Creative Commons Attribution-ShareAlike - Use with attribution, share derivatives under same license',
      'CC BY 3.0': 'Creative Commons Attribution - You can use this track freely with attribution',
      'CC BY-SA 3.0': 'Creative Commons Attribution-ShareAlike - Use with attribution, share derivatives under same license',
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
          <Link to={`/music/a/${albumId}`} className="breadcrumb-link">{song.albumName}</Link>
          <span className="breadcrumb-separator">→</span>
          <span className="breadcrumb-current">{song.title}</span>
        </div>
      </div>
      
      <div className="song-details">
        <div className="song-header">
          <h1 className="song-title">{song.title}</h1>
          <p className="song-album">
            from <Link to={`/music/a/${albumId}`} className="album-link">{song.albumName}</Link>
          </p>
        </div>
        
        <div className="song-info-grid">
          <div className="info-section">
            <h3>Release Information</h3>
            <div className="info-items">
              <div className="info-item">
                <span className="info-label">Release Year:</span>
                <span className="info-value">{song.releaseYear}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Release Type:</span>
                <span className={`label label-${song.releaseType.toLowerCase()}`}>
                  {song.releaseType}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Content ID:</span>
                <span className={`label ${song.hasContentId ? 'label-content-id' : 'label-no-content-id'}`}>
                  {song.hasContentId ? 'Yes' : 'No'}
                </span>
              </div>
              {isCreatorFriendly(song) && (
                <div className="info-item">
                  <span className="info-label">Creator Friendly:</span>
                  <span className="label label-creator-friendly">Yes</span>
                </div>
              )}
            </div>
          </div>
          
          {song.license && (
            <div className="info-section">
              <h3>License</h3>
              <div className="license-info">
                <div className="license-name">{song.license}</div>
                {getLicenseDescription(song.license) && (
                  <div className="license-description">
                    {getLicenseDescription(song.license)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="song-actions">
          <a 
            href={song.streamingLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary btn-large"
          >
            Listen Now
          </a>
          <Link to={`/music/a/${albumId}`} className="btn btn-secondary">
            View Album
          </Link>
        </div>
        
        {isCreatorFriendly(song) && (
          <div className="creator-info">
            <h3>For Content Creators</h3>
            <p>
              This track is creator-friendly and can be used in your content. 
              {song.license && song.license !== 'All Rights Reserved' && (
                <> Please check the license terms above for specific requirements.</>
              )}
              {song.hasContentId && (
                <> Note: This track has Content ID enabled, which may affect monetization.</>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongPage;