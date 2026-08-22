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
        <br/>
          
          <div className="license-type">
            <h3>BGML-P</h3>
            <p>
              This is <i>meant</i> to be a licence, but I haven't exactly been bothered to write it. For now, treat it as "All Rights Reserved" with the sole exception that these songs may be used commercially in YouTube videos, YouTube Shorts/TikToks, or in Twitch streams, so long as they are not the main focus of the video. If you are unsure, DM me via <a href="https://soundcloud.com/babafun">SoundCloud</a>.
            </p>
          </div>
        </div>
        
        <div className="content-id-info">
          <h3>About Content ID</h3>
          <p>
            Some tracks have YouTube Content ID enabled. This means:
          </p>
          <ul>
            <li>The track may be automatically detected in videos</li>
            <li>Monetisation may be affected depending on the license</li>
            <li>Creator-friendly tracks with Content ID are still free to use</li>
            <li>Check individual song pages for specific details</li>
          </ul>
        </div>
      </div>

  );
};

export default LicensesPage;