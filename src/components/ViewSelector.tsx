/**
 * ViewSelector Component
 * 
 * Navigation component for switching between different views of the music portfolio.
 * Provides accessible navigation with keyboard support and visual indicators.
 * 
 * Features:
 * - Buttons/tabs for each view (Discography, Songs, Creator List)
 * - Highlights active view with purple theme colors
 * - Keyboard navigation support (arrow keys, tab)
 * - ARIA roles and labels for accessibility
 * - Responsive design for mobile and desktop
 */

import React from 'react';

/**
 * Available view types in the music portfolio
 */
export type ViewType = 'discography' | 'songs' | 'creator';

/**
 * Props interface for ViewSelector component
 */
export interface ViewSelectorProps {
  /** Currently active view */
  currentView: ViewType;
  
  /** Callback function when view changes */
  onViewChange: (view: ViewType) => void;
  
  /** Optional: Show song counts for each view */
  songCounts?: {
    total: number;
    creatorFriendly: number;
    albums: number;
  };
}

/**
 * Individual view button component
 */
interface ViewButtonProps {
  view: ViewType;
  isActive: boolean;
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  children: React.ReactNode;
  description?: string;
  count?: number;
}

const ViewButton: React.FC<ViewButtonProps> = ({ 
  view, 
  isActive, 
  onClick, 
  onKeyDown, 
  children, 
  description,
  count 
}) => {
  return (
    <button
      type="button"
      className={`view-button ${isActive ? 'active' : ''}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-pressed={isActive}
      aria-describedby={description ? `${view}-description` : undefined}
      role="tab"
      tabIndex={isActive ? 0 : -1}
    >
      <span className="view-button-text">
        {children}
      </span>
      {count !== undefined && (
        <span className="view-button-count">
          {count}
        </span>
      )}
      {description && (
        <span 
          id={`${view}-description`} 
          className="view-button-description sr-only"
        >
          {description}
        </span>
      )}
    </button>
  );
};

/**
 * ViewSelector Component
 * 
 * Creates navigation interface for switching between views
 * - Provides buttons/tabs for each view
 * - Highlights active view with primary color
 * - Implements keyboard navigation (arrow keys, tab)
 * - Adds ARIA roles and labels for screen readers
 * - Shows optional counts for each view type
 * 
 * @param props - Component props
 * @returns JSX element representing the view selector
 */
export const ViewSelector: React.FC<ViewSelectorProps> = ({ 
  currentView, 
  onViewChange, 
  songCounts 
}) => {
  const viewsRef = React.useRef<HTMLDivElement>(null);

  /**
   * Handle keyboard navigation within the view selector
   * Supports arrow keys for navigation and Enter/Space for selection
   */
  const handleKeyDown = (event: React.KeyboardEvent, targetView: ViewType) => {
    const views: ViewType[] = ['discography', 'songs', 'creator'];
    const currentIndex = views.indexOf(currentView);
    
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : views.length - 1;
        onViewChange(views[prevIndex]);
        break;
        
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = currentIndex < views.length - 1 ? currentIndex + 1 : 0;
        onViewChange(views[nextIndex]);
        break;
        
      case 'Home':
        event.preventDefault();
        onViewChange(views[0]);
        break;
        
      case 'End':
        event.preventDefault();
        onViewChange(views[views.length - 1]);
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        onViewChange(targetView);
        break;
    }
  };

  /**
   * Get view configuration with labels, descriptions, and counts
   */
  const getViewConfig = () => {
    return [
      {
        view: 'discography' as ViewType,
        label: 'Discography',
        description: 'Browse music organized by albums',
        count: songCounts?.albums,
        icon: '📀'
      },
      {
        view: 'songs' as ViewType,
        label: 'All Songs',
        description: 'View detailed information for all songs',
        count: songCounts?.total,
        icon: '🎵'
      },
      {
        view: 'creator' as ViewType,
        label: 'Creator Friendly',
        description: 'Songs free for creators to use in content',
        count: songCounts?.creatorFriendly,
        icon: '✅'
      }
    ];
  };

  const viewConfigs = getViewConfig();

  return (
    <nav 
      className="view-selector" 
      role="tablist" 
      aria-label="Music portfolio view navigation"
      ref={viewsRef}
    >
      <div className="view-selector-container">
        <h2 className="sr-only">Choose View</h2>
        
        <div className="view-buttons">
          {viewConfigs.map((config) => (
            <ViewButton
              key={config.view}
              view={config.view}
              isActive={currentView === config.view}
              onClick={() => onViewChange(config.view)}
              onKeyDown={(event) => handleKeyDown(event, config.view)}
              description={config.description}
              count={config.count}
            >
              <span className="view-icon" aria-hidden="true">
                {config.icon}
              </span>
              <span className="view-label">
                {config.label}
              </span>
            </ViewButton>
          ))}
        </div>
        
        {/* Keyboard navigation instructions */}
        <div className="keyboard-help sr-only" aria-live="polite">
          Use arrow keys to navigate between views, Enter or Space to select
        </div>
      </div>
    </nav>
  );
};

export default ViewSelector;