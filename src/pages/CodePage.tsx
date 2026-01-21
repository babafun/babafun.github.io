import React from 'react';

const CodePage: React.FC = () => {
  return (
    <div className="page code-page">
      <div className="page-header">
        <h1>Code & Game Development</h1>
        <p className="page-description">
          My programming projects and game development work
        </p>
      </div>
      
      <div className="coming-soon">
        <div className="coming-soon-content">
          <div className="coming-soon-icon">💻</div>
          <h2>Coming Soon</h2>
          <p>
            This section will showcase my game development projects, 
            programming tools, and open-source contributions.
          </p>
          <div className="preview-items">
            <div className="preview-item">
              <h3>Game Projects</h3>
              <p>Interactive games and experiences</p>
            </div>
            <div className="preview-item">
              <h3>Development Tools</h3>
              <p>Utilities and libraries for developers</p>
            </div>
            <div className="preview-item">
              <h3>Open Source</h3>
              <p>Contributions to the developer community</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodePage;