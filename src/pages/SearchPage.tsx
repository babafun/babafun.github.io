import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DataLoader } from '../utils/dataLoader';
import type { MusicData, Song, ReleaseType } from '../types/music';

interface SearchFilters {
  query: string;
  releaseTypes: ReleaseType[];
  licenses: string[];
  creatorFriendlyOnly: boolean;
  sortBy: 'title' | 'year' | 'album';
  sortOrder: 'asc' | 'desc';
}

const SearchPage: React.FC = () => {
  const [musicData, setMusicData] = useState<MusicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    releaseTypes: [],
    licenses: [],
    creatorFriendlyOnly: false,
    sortBy: 'title',
    sortOrder: 'asc'
  });

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

  const isCreatorFriendly = (song: Song) => {
    return song.releaseType === 'NCS' || 
           song.license.toLowerCase().includes('cc') || 
           song.license === 'BGML-P';
  };

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    if (!musicData) return { releaseTypes: [], licenses: [] };
    
    const releaseTypes = Array.from(new Set(musicData.songs.map(song => song.releaseType)));
    const licenses = Array.from(new Set(musicData.songs.map(song => song.license).filter(Boolean)));
    
    return { releaseTypes, licenses };
  }, [musicData]);

  // Filter and sort songs
  const filteredSongs = useMemo(() => {
    if (!musicData) return [];
    
    let songs = [...musicData.songs];
    
    // Apply text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      songs = songs.filter(song => 
        song.title.toLowerCase().includes(query) ||
        song.albumName.toLowerCase().includes(query) ||
        song.license.toLowerCase().includes(query)
      );
    }
    
    // Apply release type filter
    if (filters.releaseTypes.length > 0) {
      songs = songs.filter(song => filters.releaseTypes.includes(song.releaseType));
    }
    
    // Apply license filter
    if (filters.licenses.length > 0) {
      songs = songs.filter(song => filters.licenses.includes(song.license));
    }
    
    // Apply creator-friendly filter
    if (filters.creatorFriendlyOnly) {
      songs = songs.filter(isCreatorFriendly);
    }
    
    // Apply sorting
    songs.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'year':
          comparison = a.releaseYear - b.releaseYear;
          break;
        case 'album':
          comparison = a.albumName.localeCompare(b.albumName);
          break;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return songs;
  }, [musicData, filters]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReleaseTypeToggle = (releaseType: ReleaseType) => {
    setFilters(prev => ({
      ...prev,
      releaseTypes: prev.releaseTypes.includes(releaseType)
        ? prev.releaseTypes.filter(rt => rt !== releaseType)
        : [...prev.releaseTypes, releaseType]
    }));
  };

  const handleLicenseToggle = (license: string) => {
    setFilters(prev => ({
      ...prev,
      licenses: prev.licenses.includes(license)
        ? prev.licenses.filter(l => l !== license)
        : [...prev.licenses, license]
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      releaseTypes: [],
      licenses: [],
      creatorFriendlyOnly: false,
      sortBy: 'title',
      sortOrder: 'asc'
    });
  };

  const handleSearchFocus = () => {
    setFiltersExpanded(true);
  };

  const handleSearchBlur = () => {
    // Only collapse if no filters are active
    const hasActiveFilters = filters.releaseTypes.length > 0 || 
                            filters.licenses.length > 0 || 
                            filters.creatorFriendlyOnly;
    if (!hasActiveFilters) {
      setFiltersExpanded(false);
    }
  };

  if (loading) {
    return (
      <div className="page search-page">
        <div className="loading-container">
          <p>Loading search...</p>
        </div>
      </div>
    );
  }

  if (error || !musicData) {
    return (
      <div className="page search-page">
        <div className="error-container">
          <h1>Error</h1>
          <p>{error || 'Failed to load search'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page search-page">
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/music" className="breadcrumb-link">Music</Link>
          <span className="breadcrumb-separator">→</span>
          <span className="breadcrumb-current">Search</span>
        </div>
        <h1>Search & Filter</h1>
      </div>
      
      <div className={`search-container ${!filtersExpanded ? 'collapsed' : ''}`}>
        <div className={`search-filters ${!filtersExpanded ? 'collapsed' : ''}`}>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search songs, albums, or licences..."
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="search-input"
            />
          </div>
          
          <div className={`filters-content ${filtersExpanded ? 'expanded' : ''}`}>
            <div className="filter-group">
              <h4>Release Labels</h4>
              <div className="filter-options">
                {filterOptions.releaseTypes.map(releaseType => (
                  <div key={releaseType} className="filter-option" onClick={() => handleReleaseTypeToggle(releaseType)}>
                    <input
                      type="checkbox"
                      checked={filters.releaseTypes.includes(releaseType)}
                      onChange={() => handleReleaseTypeToggle(releaseType)}
                      className="filter-checkbox"
                    />
                    <span className="filter-label">
                      {releaseType}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="filter-group">
              <h4>Licences</h4>
              <div className="filter-options">
                {filterOptions.licenses.map(license => (
                  <div key={license} className="filter-option" onClick={() => handleLicenseToggle(license)}>
                    <input
                      type="checkbox"
                      checked={filters.licenses.includes(license)}
                      onChange={() => handleLicenseToggle(license)}
                      className="filter-checkbox"
                    />
                    <span className="filter-label">{license}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="filter-group">
              <h4>Options</h4>
              <div className="filter-options">
                <div className="filter-option" onClick={(e) => {
                  e.preventDefault();
                  handleFilterChange('creatorFriendlyOnly', !filters.creatorFriendlyOnly);
                }}>
                  <input
                    type="checkbox"
                    checked={filters.creatorFriendlyOnly}
                    onChange={(e) => handleFilterChange('creatorFriendlyOnly', e.target.checked)}
                    className="filter-checkbox"
                  />
                  <span className="filter-label">Creator Friendly Only</span>
                </div>
              </div>
            </div>
            
            <div className="filter-group">
              <h4>Sort By</h4>
              <div className="sort-options">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="sort-select"
                >
                  <option value="title">Title</option>
                  <option value="year">Release Year</option>
                  <option value="album">Album</option>
                </select>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="sort-select"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
            
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        </div>
        
        <div className="search-results">
          <div className="search-results-header">
            <div className="results-count">
              {filteredSongs.length} song{filteredSongs.length !== 1 ? 's' : ''} found
            </div>
          </div>
          
          <div className="songs-list">
            {filteredSongs.map((song) => {
              const songId = createSongId(song.title);
              const albumId = createAlbumId(song.albumName);
              
              return (
                <div key={song.id} className="song-item">
                  <div className="song-content">
                    {song.albumArtwork && (
                      <img 
                        src={song.albumArtwork} 
                        alt={`${song.albumName} album artwork`}
                        className="album-artwork"
                        loading="lazy"
                      />
                    )}
                    <div className="song-info">
                      <h3 className="song-title">
                        <Link to={`/music/s/${songId}`} className="song-link">
                          {song.title}
                        </Link>
                      </h3>
                      <p className="song-album">
                        from <Link to={`/music/a/${albumId}`} className="album-link">{song.albumName}</Link>
                      </p>
                      <div className="song-meta">
                        <span className="song-year">{song.releaseYear}</span>
                        <span className={`label label-${song.releaseType.toLowerCase()}`}>
                          {song.releaseType}
                        </span>
                        {isCreatorFriendly(song) && (
                          <span className="label label-creator-friendly">Creator Friendly</span>
                        )}
                        {song.hasContentId && (
                          <span className="label label-content-id">Content ID</span>
                        )}
                      </div>
                      {song.license && (
                        <div className="song-license">
                          Licence: {song.license}
                        </div>
                      )}
                    </div>
                    <div className="song-actions">
                      <a 
                        href={song.streamingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-small"
                      >
                        Listen
                      </a>
                      <Link to={`/music/s/${songId}`} className="btn btn-primary btn-small">
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredSongs.length === 0 && (
              <div className="no-results">
                <h3>No songs found</h3>
                <p>No songs match your search criteria.</p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;