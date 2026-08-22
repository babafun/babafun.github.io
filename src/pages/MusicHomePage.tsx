import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DataLoader } from '../utils/dataLoader';
import type { Album } from '../types/music';

interface MusicStats {
  totalSongs: number;
  totalAlbums: number;
  labelCount: number;
  creatorFriendlyCount: number;
  recentAlbums: Album[];
}

const MusicHomePage: React.FC = () => {
  const [stats, setStats] = useState<MusicStats>({
    totalSongs: 0,
    totalAlbums: 0,
    labelCount: 0,
    creatorFriendlyCount: 0,
    recentAlbums: []
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const dataLoader = DataLoader.getInstance();
        const albums = await dataLoader.loadMusicData();
        
        // Calculate real stats
        const totalSongs = albums.reduce((sum, album) => sum + album.tracks.length, 0);
        const totalAlbums = albums.length;
        
        // Count unique labels (excluding empty strings)
        const labels = new Set(
          albums
            .map(a => a.releaseLabel)
            .filter(label => label && label.trim() !== '')
        );
        const labelCount = labels.size;
        
        // Count creator-friendly tracks
        const isCreatorFriendly = (license: string) => {
          const l = (license || '').toLowerCase().trim();
          return /^cc by( \d+\.\d+)?$/.test(l) || 
                 /^cc by-sa( \d+\.\d+)?$/.test(l) ||
                 /^cc0( \d+\.\d+)?$/.test(l) || 
                 l === 'bgml-p';
        };
        
        const creatorFriendlyCount = albums.reduce((count, album) => {
          return count + album.tracks.filter(t => isCreatorFriendly(t.license)).length;
        }, 0);
        
        // Get 2 most recent albums (excluding the mysterious one with year -1)
        const recentAlbums = albums
          .filter(a => a.releaseYear > 0)
          .sort((a, b) => b.releaseYear - a.releaseYear)
          .slice(0, 2);
        
        setStats({
          totalSongs,
          totalAlbums,
          labelCount,
          creatorFriendlyCount,
          recentAlbums
        });
      } catch (error) {
        console.error('Error loading music data:', error);
      }
    };
    
    loadData();
  }, []);

  return (
    <main className="page music-home-page">
      <header className="page-header">
        <h1>Music</h1>
        <p className="page-description">
          Here is all my music - electronic tracks spanning multiple genres and release labels.
        </p>
      </header>
      
      <section className="music-actions" aria-label="Music navigation">
        <Link to="/music/discography" className="btn btn-primary btn-large">
          View Discography
        </Link>
        <Link to="/music/search" className="btn btn-secondary">
          Search & Filter
        </Link>
      </section>
      
      <section className="music-stats" aria-label="Music statistics">
        <div className="stats-grid">
          <article className="stat-card">
            <div className="stat-number" aria-label={`${stats.totalSongs} total songs`}>{stats.totalSongs}</div>
            <div className="stat-label">Total Songs</div>
          </article>
          <article className="stat-card">
            <div className="stat-number" aria-label={`${stats.totalAlbums} albums`}>{stats.totalAlbums}</div>
            <div className="stat-label">Albums</div>
          </article>
          <article className="stat-card">
            <div className="stat-number" aria-label={`${stats.labelCount} release labels`}>{stats.labelCount}</div>
            <div className="stat-label">Release Labels</div>
          </article>
          <article className="stat-card">
            <div className="stat-number" aria-label={`${stats.creatorFriendlyCount} creator-friendly tracks`}>{stats.creatorFriendlyCount}</div>
            <div className="stat-label">Creator-Friendly</div>
          </article>
        </div>
      </section>
      
      <section className="recent-releases" aria-label="Recent music releases">
        <h2>Recent Releases</h2>
        <div className="release-grid">
          {stats.recentAlbums.map(album => (
            <article key={album.id} className="release-card">
              <header>
                <h3>{album.title}</h3>
                <p className="release-year">{album.releaseYear}</p>
              </header>
              <p className="release-description">
                {album.tracks.length} track{album.tracks.length !== 1 ? 's' : ''}
              </p>
              <footer>
                <Link to={`/music/a/${album.id}`} className="release-link" aria-label={`View ${album.title} album`}>
                  View Album
                </Link>
              </footer>
            </article>
          ))}
        </div>
      </section>
      
      <section className="music-features" aria-label="Music features">
        <div className="features-grid">
          <article className="feature-card">
            <h3>Multiple Genres</h3>
            <p>
              Explore electronic music across various subgenres including house, trance, dubstep, and ambient.
            </p>
            <Link to="/music/search?genre=electronic" className="feature-link">
              Browse Genres
            </Link>
          </article>
          <article className="feature-card">
            <h3>Creator-Friendly Licences</h3>
            <p>
              Many tracks are available under Creative Commons licences, perfect for content creators and streamers.
            </p>
            <Link to="/music/search?creator-friendly=true" className="feature-link">
              View Creator-Friendly
            </Link>
          </article>
          {stats.labelCount > 0 && (
            <article className="feature-card">
              <h3>Professional Releases</h3>
              <p>
                Music that I've released across different labels!
              </p>
              <Link to="/music/discography" className="feature-link">
                View All Releases
              </Link>
            </article>
          )}
        </div>
      </section>
    </main>
  );
};

export default MusicHomePage;