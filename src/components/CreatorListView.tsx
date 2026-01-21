/**
 * CreatorListView Component
 * 
 * Displays a filtered list of creator-friendly songs that are free for creators to use.
 * Validates Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 * 
 * Features:
 * - Filters songs using filterCreatorFriendly utility
 * - Displays same information as SongDetailView for each song
 * - Adds visual indicator for creator-friendly status
 * - Uses semantic HTML for accessibility
 * - Applies consistent purple theme styling
 */

import React from 'react';
import type { Song } from '../types/music';
import { filterCreatorFriendly } from '../utils/filters';
import { 
  isCreatorFriendlySong, 
  getCreatorFriendlyReason, 
  shouldDisplayLicense,
  getStreamingLinkText 
} from '../utils/display';

/**
 * Props interface for CreatorListView component
 */
export interface CreatorListViewProps {
  /** Array of all songs to filter */
  songs: Song[];
}

/**
 * Individual creator-friendly song card component
 */
interface CreatorSongCardProps {
  song: Song;
  reason: string;
}

const CreatorSongCard: React.FC<CreatorSongCardProps> = ({ song, reason }) => {
  return (
    <article 
      className="song-card creator-song-card" 
      role="article"
      aria-labelledby={`song-title-${song.id}`}
      aria-describedby={`song-details-${song.id}`}
    >
      <header className="song-header">
        <h3 id={`song-title-${song.id}`} className="song-title mb-1">{song.title}</h3>
        <p className="song-album text-muted">
          from <em>{song.albumName}</em>
        </p>
        
        <div className="creator-status mt-1">
          <span 
            className="badge creator-friendly" 
            title={reason}
            aria-label={`Creator friendly: ${reason}`}
            role="status"
          >
            <span aria-hidden="true">✓</span> Creator Friendly
          </span>
          <span className="creator-reason text-muted ml-1" aria-hidden="true">
            {reason}
          </span>
        </div>
      </header>

      <div id={`song-details-${song.id}`} className="song-metadata mt-2">
        <div className="metadata-row">
          <strong>Release Type:</strong>
          <span 
            className={`badge ${song.releaseType.toLowerCase()} ml-1`}
            aria-label={`Release type: ${song.releaseType}`}
          >
            {song.releaseType}
          </span>
        </div>

        <div className="metadata-row mt-1">
          <strong>Content ID:</strong>
          <span 
            className={`badge ${song.hasContentId ? 'content-id' : 'success'} ml-1`}
            title={song.hasContentId 
              ? 'This song has YouTube Content ID enabled but is still creator-friendly'
              : 'This song does not have YouTube Content ID'
            }
            aria-label={`Content ID ${song.hasContentId ? 'enabled' : 'disabled'}: ${
              song.hasContentId 
                ? 'This song has YouTube Content ID enabled but is still creator-friendly'
                : 'This song does not have YouTube Content ID'
            }`}
          >
            {song.hasContentId ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {shouldDisplayLicense(song.license) && (
          <div className="metadata-row mt-1">
            <strong>License:</strong>
            <span className="song-license ml-1" aria-label={`License: ${song.license}`}>
              {song.license}
            </span>
          </div>
        )}
      </div>

      <footer className="song-actions mt-2">
        <a 
          href={song.streamingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="streaming-link"
          aria-label={`Listen to ${song.title} on streaming platform - creator-friendly music (opens in new tab)`}
        >
          {getStreamingLinkText(song.streamingLink)}
          <span aria-hidden="true"> ↗</span>
        </a>
      </footer>
    </article>
  );
};

/**
 * Empty state component when no creator-friendly songs are found
 */
const EmptyCreatorState: React.FC = () => (
  <div className="empty-state text-center" role="status" aria-live="polite">
    <h2 className="text-muted">No Creator-Friendly Songs Found</h2>
    <p className="text-muted">
      There are currently no songs available that are free for creators to use.
    </p>
    <div className="creator-criteria mt-2" role="region" aria-labelledby="criteria-heading">
      <h3 id="criteria-heading" className="text-muted">Songs are considered creator-friendly if they have:</h3>
      <ul className="text-muted" role="list">
        <li role="listitem">NCS (No Copyright Sounds) release</li>
        <li role="listitem">Creative Commons license (CC BY, CC BY-SA, CC0)</li>
        <li role="listitem">BGML-P (Babafun Game Music License - Permissive)</li>
      </ul>
    </div>
  </div>
);

/**
 * Statistics component showing creator-friendly song breakdown
 */
interface CreatorStatsProps {
  totalSongs: number;
  creatorFriendlySongs: Song[];
}

const CreatorStats: React.FC<CreatorStatsProps> = ({ totalSongs, creatorFriendlySongs }) => {
  // Count by release type
  const ncsCount = creatorFriendlySongs.filter(song => song.releaseType === 'NCS').length;
  const ccCount = creatorFriendlySongs.filter(song => 
    song.releaseType !== 'NCS' && 
    (song.license.toLowerCase().includes('cc') || song.license.toLowerCase().includes('bgml-p'))
  ).length;
  
  const percentage = totalSongs > 0 ? Math.round((creatorFriendlySongs.length / totalSongs) * 100) : 0;

  return (
    <div className="creator-stats mb-3" role="region" aria-labelledby="creator-stats-heading">
      <h2 id="creator-stats-heading" className="sr-only">Creator-Friendly Statistics</h2>
      <div className="stats-summary text-center">
        <p className="text-muted" aria-label={`${creatorFriendlySongs.length} of ${totalSongs} songs are creator-friendly, which is ${percentage} percent`}>
          <strong>{creatorFriendlySongs.length}</strong> of <strong>{totalSongs}</strong> songs 
          are creator-friendly ({percentage}%)
        </p>
        
        {creatorFriendlySongs.length > 0 && (
          <div className="stats-breakdown mt-1" role="group" aria-label="Breakdown by license type">
            {ncsCount > 0 && (
              <span className="badge ncs mr-1" aria-label={`${ncsCount} NCS releases`}>
                {ncsCount} NCS
              </span>
            )}
            {ccCount > 0 && (
              <span className="badge success mr-1" aria-label={`${ccCount} open license songs`}>
                {ccCount} Open License
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * CreatorListView Component
 * 
 * Displays filtered list of creator-friendly songs
 * - Filters songs using filterCreatorFriendly utility
 * - Displays same information as SongDetailView for each song
 * - Highlights creator-friendly status with badges and explanations
 * - Shows statistics about creator-friendly vs total songs
 * 
 * @param props - Component props containing songs array
 * @returns JSX element representing the creator list view
 */
export const CreatorListView: React.FC<CreatorListViewProps> = ({ songs }) => {
  // Handle empty input
  if (!songs || songs.length === 0) {
    return <EmptyCreatorState />;
  }

  // Filter to creator-friendly songs using the WASM-powered utility
  const creatorFriendlySongs = React.useMemo(() => {
    try {
      return filterCreatorFriendly(songs);
    } catch (error) {
      console.error('Error filtering creator-friendly songs:', error);
      // Fallback to JavaScript filtering if WASM fails
      return songs.filter(song => isCreatorFriendlySong(song));
    }
  }, [songs]);

  // Handle case where no creator-friendly songs exist
  if (creatorFriendlySongs.length === 0) {
    return (
      <main className="creator-list-view" role="main" aria-labelledby="main-heading-empty">
        <h1 id="main-heading-empty" className="sr-only">Creator-Friendly Music</h1>
        <CreatorStats totalSongs={songs.length} creatorFriendlySongs={creatorFriendlySongs} />
        <EmptyCreatorState />
      </main>
    );
  }

  // Group songs by release type for better organization
  const songsByType = creatorFriendlySongs.reduce((groups, song) => {
    const type = song.releaseType === 'NCS' ? 'NCS Releases' : 'Open License';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(song);
    return groups;
  }, {} as Record<string, Song[]>);

  const groupTypes = Object.keys(songsByType).sort();

  return (
    <main className="creator-list-view" role="main" aria-labelledby="main-heading">
      <header className="view-header mb-3">
        <h1 id="main-heading" className="sr-only">Creator-Friendly Music</h1>
        <CreatorStats totalSongs={songs.length} creatorFriendlySongs={creatorFriendlySongs} />
        
        <div className="creator-info">
          <p className="text-center text-muted" role="note">
            These songs are free for creators to use in videos, streams, and other content.
          </p>
        </div>
      </header>

      <div className="creator-songs-container">
        {groupTypes.map((groupType) => (
          <section 
            key={groupType}
            className="creator-group mb-3"
            role="region"
            aria-labelledby={`group-${groupType.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <header>
              <h2 
                id={`group-${groupType.replace(/\s+/g, '-').toLowerCase()}`}
                className="group-header"
              >
                {groupType}
              </h2>
              <p className="text-muted mb-2">
                {songsByType[groupType].length} song{songsByType[groupType].length !== 1 ? 's' : ''}
              </p>
            </header>
            
            <div className="songs-grid" role="group" aria-label={`${groupType} songs`}>
              {songsByType[groupType].map((song) => {
                const reason = getCreatorFriendlyReason(song) || 'Creator-friendly';
                return (
                  <CreatorSongCard 
                    key={song.id} 
                    song={song} 
                    reason={reason}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <footer className="creator-disclaimer mt-3" role="contentinfo">
        <div className="disclaimer-content">
          <h3 className="text-muted">Usage Guidelines</h3>
          <ul className="text-muted" role="list">
            <li role="listitem">Always check the specific license terms before using</li>
            <li role="listitem">Some songs may still require attribution even if creator-friendly</li>
            <li role="listitem">Content ID status may affect monetization - check individual songs</li>
            <li role="listitem">When in doubt, contact the artist or label directly</li>
          </ul>
        </div>
      </footer>
    </main>
  );
};

export default CreatorListView;