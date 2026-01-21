import React from 'react';
import { Link } from 'react-router-dom';

const LicensesPage: React.FC = () => {
  return (
    <div className="page licenses-page">
      <div className="page-header">
        <h1>Licenses & Usage</h1>
        <p className="page-description">
          Understanding how you can use my music in your projects
        </p>
      </div>
      
      <div className="license-sections">
        <div className="license-section">
          <h2>Creator-Friendly Music</h2>
          <p>
            Many of my tracks are available for content creators to use freely. 
            Look for the "Creator Friendly" label on songs.
          </p>
          <Link to="/music/search?creatorFriendly=true" className="btn btn-primary">
            Browse Creator-Friendly Songs
          </Link>
        </div>
        
        <div className="license-types">
          <div className="license-type">
            <h3>Creative Commons (CC)</h3>
            <div className="license-variants">
              <div className="license-variant">
                <h4>CC BY 4.0</h4>
                <p>Use freely with attribution - perfect for content creation</p>
              </div>
              <div className="license-variant">
                <h4>CC BY-SA 4.0</h4>
                <p>Use with attribution, share derivatives under same license</p>
              </div>
              <div className="license-variant">
                <h4>CC0</h4>
                <p>Public domain - no attribution required</p>
              </div>
            </div>
          </div>
          
          <div className="license-type">
            <h3>NCS (No Copyright Sounds)</h3>
            <p>
              Tracks released through NCS are free for content creators to use. 
              Perfect for YouTube videos, streams, and other content.
            </p>
          </div>
          
          <div className="license-type">
            <h3>BGML-P (Babafun Game Music License - Permissive)</h3>
            <p>
              Specially designed for game developers and content creators. 
              Free to use in games and interactive media.
            </p>
          </div>
          
          <div className="license-type">
            <h3>All Rights Reserved</h3>
            <p>
              Traditional copyright protection. Contact for licensing inquiries.
            </p>
          </div>
        </div>
        
        <div className="content-id-info">
          <h2>About Content ID</h2>
          <p>
            Some tracks have YouTube Content ID enabled. This means:
          </p>
          <ul>
            <li>The track may be automatically detected in videos</li>
            <li>Monetization may be affected depending on the license</li>
            <li>Creator-friendly tracks with Content ID are still free to use</li>
            <li>Check individual song pages for specific details</li>
          </ul>
        </div>
        
        <div className="usage-guidelines">
          <h2>Usage Guidelines</h2>
          <div className="guidelines-grid">
            <div className="guideline">
              <h3>✅ Allowed</h3>
              <ul>
                <li>YouTube videos and streams</li>
                <li>Podcasts and audio content</li>
                <li>Game development (with appropriate licenses)</li>
                <li>Educational content</li>
                <li>Personal projects</li>
              </ul>
            </div>
            <div className="guideline">
              <h3>❓ Check License</h3>
              <ul>
                <li>Commercial use</li>
                <li>Redistribution</li>
                <li>Remixing and derivatives</li>
                <li>Sync licensing for media</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicensesPage;