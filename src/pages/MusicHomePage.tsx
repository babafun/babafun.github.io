import React from 'react';
import { Link } from 'react-router-dom';

const MusicHomePage: React.FC = () => {
  return (
    <div className="page music-home-page">
      <div className="page-header">
        <h1>Music</h1>
        <p className="page-description">
          Here is all my music - electronic tracks spanning multiple genres and release labels.
        </p>
      </div>
      
      <div className="music-actions">
        <Link to="/music/discography" className="btn btn-primary btn-large">
          View Discography
        </Link>
        <Link to="/music/search" className="btn btn-secondary">
          Search & Filter
        </Link>
      </div>
      
      <div className="music-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">18</div>
            <div className="stat-label">Total Songs</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">6</div>
            <div className="stat-label">Albums</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">3</div>
            <div className="stat-label">Release Labels</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">12</div>
            <div className="stat-label">Creator-Friendly</div>
          </div>
        </div>
      </div>
      
      <div className="recent-releases">
        <h2>Recent Releases</h2>
        <div className="release-grid">
          <div className="release-card">
            <h3>Electronic Fusion</h3>
            <p className="release-year">2024</p>
            <p className="release-description">Latest electronic tracks with NCS and Monstercat releases</p>
            <Link to="/music/a/electronic-fusion" className="release-link">View Album →</Link>
          </div>
          <div className="release-card">
            <h3>High Energy</h3>
            <p className="release-year">2024</p>
            <p className="release-description">High-energy tracks perfect for gaming and workouts</p>
            <Link to="/music/a/high-energy" className="release-link">View Album →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicHomePage;