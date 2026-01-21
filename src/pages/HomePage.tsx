import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="page home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome</h1>
          <p className="hero-subtitle">Music Producer & Game Developer</p>
          <p className="hero-description">
            I create electronic music and develop games. Explore my music portfolio 
            or check out my coding projects.
          </p>
          
          <div className="hero-actions">
            <Link to="/music" className="btn btn-primary">
              Explore My Music
            </Link>
            <Link to="/code" className="btn btn-secondary">
              View My Code
            </Link>
          </div>
        </div>
      </div>
      
      <div className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎵</div>
            <h3>Music Production</h3>
            <p>Electronic music across multiple genres and release labels</p>
            <Link to="/music" className="feature-link">Browse Music →</Link>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💻</div>
            <h3>Game Development</h3>
            <p>Creating games and interactive experiences</p>
            <Link to="/code" className="feature-link">View Projects →</Link>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Open Licensing</h3>
            <p>Many tracks available for creators under permissive licenses</p>
            <Link to="/licenses" className="feature-link">Learn More →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;