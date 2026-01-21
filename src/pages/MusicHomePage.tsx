import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MusicHomePage: React.FC = () => {
  const [hasLabelReleases, setHasLabelReleases] = useState(false);

  useEffect(() => {
    // Check if there are any NCS or Monstercat releases
    fetch('/src/data/music.json')
      .then(response => response.json())
      .then(data => {
        const labelReleases = data.songs.some((song: any) => 
          song.releaseType === 'NCS' || song.releaseType === 'Monstercat'
        );
        setHasLabelReleases(labelReleases);
      })
      .catch(error => {
        console.error('Error loading music data:', error);
      });
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
            <div className="stat-number" aria-label="18 total songs">18</div>
            <div className="stat-label">Total Songs</div>
          </article>
          <article className="stat-card">
            <div className="stat-number" aria-label="6 albums">6</div>
            <div className="stat-label">Albums</div>
          </article>
          <article className="stat-card">
            <div className="stat-number" aria-label="3 release labels">3</div>
            <div className="stat-label">Release Labels</div>
          </article>
          <article className="stat-card">
            <div className="stat-number" aria-label="12 creator-friendly tracks">12</div>
            <div className="stat-label">Creator-Friendly</div>
          </article>
        </div>
      </section>
      
      <section className="recent-releases" aria-label="Recent music releases">
        <h2>Recent Releases</h2>
        <div className="release-grid">
          <article className="release-card">
            <header>
              <h3>Electronic Fusion</h3>
              <p className="release-year">2024</p>
            </header>
            <p className="release-description">
              Latest electronic tracks with NCS and Monstercat releases featuring high-energy beats and melodic progressions.
            </p>
            <footer>
              <Link to="/music/a/electronic-fusion" className="release-link" aria-label="View Electronic Fusion album">
                View Album →
              </Link>
            </footer>
          </article>
          <article className="release-card">
            <header>
              <h3>High Energy</h3>
              <p className="release-year">2024</p>
            </header>
            <p className="release-description">
              High-energy tracks perfect for gaming and workouts, featuring driving basslines and uplifting melodies.
            </p>
            <footer>
              <Link to="/music/a/high-energy" className="release-link" aria-label="View High Energy album">
                View Album →
              </Link>
            </footer>
          </article>
        </div>
      </section>
      
      <section className="music-features" aria-label="Music features">
        <div className="features-grid">
          <article className="feature-card">
            <div className="feature-icon" aria-hidden="true">🎵</div>
            <h3>Multiple Genres</h3>
            <p>
              Explore electronic music across various subgenres including house, trance, dubstep, and ambient.
            </p>
            <Link to="/music/search?genre=electronic" className="feature-link">
              Browse Genres →
            </Link>
          </article>
          <article className="feature-card">
            <div className="feature-icon" aria-hidden="true">📜</div>
            <h3>Creator-Friendly Licences</h3>
            <p>
              Many tracks are available under Creative Commons licences, perfect for content creators and streamers.
            </p>
            <Link to="/music/search?creator-friendly=true" className="feature-link">
              View Creator-Friendly →
            </Link>
          </article>
          {hasLabelReleases && (
            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">🏷️</div>
              <h3>Professional Releases</h3>
              <p>
                Music released through established labels including NCS (NoCopyrightSounds) and Monstercat.
              </p>
              <Link to="/music/search?label=professional" className="feature-link">
                View Label Releases →
              </Link>
            </article>
          )}
        </div>
      </section>
    </main>
  );
};

export default MusicHomePage;