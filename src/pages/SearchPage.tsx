import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DataLoader } from '../utils/dataLoader';
import type { MusicData, SongView } from '../types/music';

interface SearchFilters {
  query: string;
  licenses: string[];
  creatorFriendlyOnly: boolean;
  sortBy: 'title' | 'year' | 'album';
  sortOrder: 'asc' | 'desc';
}

const SearchPage: React.FC = () => {
  const [albums, setAlbums] = useState<MusicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
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
        setAlbums(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load music data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const isCreatorFriendly = (license: string) => {
    const l = (license || '').toLowerCase().trim();
    return /^cc by( \d+\.\d+)?$/.test(l) || /^cc by-sa( \d+\.\d+)?$/.test(l) ||
           /^cc0( \d+\.\d+)?$/.test(l) || l === 'bgml-p';
  };

  // Flatten albums into SongViews
  const allSongs = useMemo((): SongView[] => {
    if (!albums) return [];
    return albums.flatMap(album =>
      album.tracks.map(track => ({
        id: track.id,
        title: track.title,
        license: track.license,
        streamLink: track.overrideStreamLink ?? album.streamLink,
        albumId: album.id,
        albumTitle: album.title,
        releaseYear: album.releaseYear,
        hasContentId: album.hasContentId,
        releaseLabel: album.releaseLabel,
        albumArtwork: album.albumArtwork
      }))
    );
  }, [albums]);

  const filterOptions = useMemo(() => {
    const licenses = Array.from(new Set(allSongs.map(s => s.license).filter(Boolean)));
    return { licenses };
  }, [allSongs]);

  const filteredSongs = useMemo(() => {
    let songs = [...allSongs];

    if (filters.query) {
      const query = filters.query.toLowerCase();
      songs = songs.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.albumTitle.toLowerCase().includes(query) ||
        s.license.toLowerCase().includes(query)
      );
    }

    if (filters.licenses.length > 0) {
      songs = songs.filter(s => filters.licenses.includes(s.license));
    }

    if (filters.creatorFriendlyOnly) {
      songs = songs.filter(s => isCreatorFriendly(s.license));
    }

    songs.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'title': comparison = a.title.localeCompare(b.title); break;
        case 'year': comparison = a.releaseYear - b.releaseYear; break;
        case 'album': comparison = a.albumTitle.localeCompare(b.albumTitle); break;
      }
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return songs;
  }, [allSongs, filters]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
    setFilters({ query: '', licenses: [], creatorFriendlyOnly: false, sortBy: 'title', sortOrder: 'asc' });
  };

  if (loading) {
    return (
      <div className="page search-page">
        <div className="loading-container"><p>Loading search...</p></div>
      </div>
    );
  }

  if (error || !albums) {
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
              onFocus={() => setFiltersExpanded(true)}
              className="search-input"
            />
          </div>

          <div className={`filters-content ${filtersExpanded ? 'expanded' : ''}`}>
            <div className="filter-group">
              <h4>Licences</h4>
              <div className="filter-options">
                {filterOptions.licenses.map(license => (
                  <div key={license} className="filter-option" onClick={() => handleLicenseToggle(license)}>
                    <input type="checkbox" checked={filters.licenses.includes(license)}
                           onChange={() => handleLicenseToggle(license)} className="filter-checkbox" />
                    <span className="filter-label">{license}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>Options</h4>
              <div className="filter-options">
                <div className="filter-option" onClick={() => handleFilterChange('creatorFriendlyOnly', !filters.creatorFriendlyOnly)}>
                  <input type="checkbox" checked={filters.creatorFriendlyOnly}
                         onChange={(e) => handleFilterChange('creatorFriendlyOnly', e.target.checked)}
                         className="filter-checkbox" />
                  <span className="filter-label">Creator Friendly Only</span>
                </div>
              </div>
            </div>

            <div className="filter-group">
              <h4>Sort By</h4>
              <div className="sort-options">
                <select value={filters.sortBy} onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="sort-select">
                  <option value="title">Title</option>
                  <option value="year">Release Year</option>
                  <option value="album">Album</option>
                </select>
                <select value={filters.sortOrder} onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                        className="sort-select">
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>

            <button onClick={clearFilters} className="clear-filters-btn">Clear Filters</button>
          </div>
        </div>

        <div className="search-results">
          <div className="search-results-header">
            <div className="results-count">
              {filteredSongs.length} song{filteredSongs.length !== 1 ? 's' : ''} found
            </div>
          </div>

          <div className="songs-list">
            {filteredSongs.map((song) => (
              <div key={song.id} className="song-item">
                <div className="song-content">
                  {song.albumArtwork && (
                    <img src={song.albumArtwork} alt={`${song.albumTitle} album artwork`}
                         className="album-artwork" loading="lazy" />
                  )}
                  <div className="song-info">
                    <h3 className="song-title">
                      <Link to={`/music/s/${song.id}`} className="song-link">{song.title}</Link>
                    </h3>
                    <p className="song-album">
                      from <Link to={`/music/a/${song.albumId}`} className="album-link">{song.albumTitle}</Link>
                    </p>
                    <div className="song-meta">
                      <span className="song-year">{song.releaseYear}</span>
                      {isCreatorFriendly(song.license) && (
                        <span className="label label-creator-friendly">Creator Friendly</span>
                      )}
                      {song.hasContentId && (
                        <span className="label label-content-id">Content ID</span>
                      )}
                    </div>
                    {song.license && (
                      <div className="song-license">Licence: {song.license}</div>
                    )}
                  </div>
                  <div className="song-actions">
                    <a href={song.streamLink} target="_blank" rel="noopener noreferrer"
                       className="btn btn-secondary btn-small">Listen</a>
                    <Link to={`/music/s/${song.id}`} className="btn btn-primary btn-small">Details</Link>
                  </div>
                </div>
              </div>
            ))}

            {filteredSongs.length === 0 && (
              <div className="no-results">
                <h3>No songs found</h3>
                <p>No songs match your search criteria.</p>
                <button onClick={clearFilters} className="btn btn-primary">Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
