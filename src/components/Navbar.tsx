import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-text">babafun</span>
          <span className="brand-subtitle">stuff about me</span>
        </Link>
        
        <ul className="navbar-nav" role="menubar">
          <li className="nav-item" role="none">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              role="menuitem"
              aria-current={isActive('/') ? 'page' : undefined}
            >
              HOME
            </Link>
          </li>
          <li className="nav-item" role="none">
            <Link 
              to="/music" 
              className={`nav-link ${isActive('/music') ? 'active' : ''}`}
              role="menuitem"
              aria-current={isActive('/music') ? 'page' : undefined}
            >
              MUSIC
            </Link>
          </li>
          <li className="nav-item" role="none">
            <Link 
              to="/code" 
              className={`nav-link ${isActive('/code') ? 'active' : ''}`}
              role="menuitem"
              aria-current={isActive('/code') ? 'page' : undefined}
            >
              CODE
            </Link>
          </li>
          <li className="nav-item" role="none">
            <Link 
              to="/licenses" 
              className={`nav-link ${isActive('/licenses') ? 'active' : ''}`}
              role="menuitem"
              aria-current={isActive('/licenses') ? 'page' : undefined}
            >
              LICENSES
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;