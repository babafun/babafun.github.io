/**
 * Demo file showing how to use the DataLoader
 * This would be used in a browser environment with a running server
 */

import { DataLoader, loadMusicData } from '../utils/dataLoader';

/**
 * Demo function showing basic DataLoader usage
 */
export async function demoBasicUsage() {
  try {
    console.log('Loading music data...');
    const musicData = await loadMusicData();
    
    console.log(`Loaded ${musicData.songs.length} songs`);
    console.log(`Organized into ${musicData.albums.length} albums`);
    
    // Show first album
    if (musicData.albums.length > 0) {
      const firstAlbum = musicData.albums[0];
      console.log(`First album: "${firstAlbum.name}" with ${firstAlbum.songs.length} songs`);
    }
    
    return musicData;
  } catch (error) {
    console.error('Failed to load music data:', error);
    throw error;
  }
}

/**
 * Demo function showing DataLoader singleton usage
 */
export async function demoSingletonUsage() {
  const loader1 = DataLoader.getInstance();
  const loader2 = DataLoader.getInstance();
  
  console.log('DataLoader is singleton:', loader1 === loader2);
  
  // Check WASM status
  console.log('WASM ready:', loader1.isWasmReady());
  
  return loader1;
}

/**
 * Demo function showing validation
 */
export async function demoValidation() {
  const loader = DataLoader.getInstance();
  
  // Valid data
  const validData = JSON.stringify({
    songs: [
      {
        id: "demo-001",
        title: "Demo Song",
        albumName: "Demo Album",
        releaseType: "Independent",
        hasContentId: false,
        streamingLink: "https://example.com/demo",
        license: "CC BY 4.0"
      }
    ]
  });
  
  try {
    const isValid = await loader.validateRawData(validData);
    console.log('Valid data validation result:', isValid);
  } catch (error) {
    console.error('Validation failed:', error);
  }
}

/**
 * Demo function showing album grouping
 */
export async function demoAlbumGrouping() {
  const loader = DataLoader.getInstance();
  
  const testSongs = [
    {
      id: "song-1",
      title: "Song 1",
      albumName: "Album A",
      releaseType: "Independent" as const,
      hasContentId: false,
      streamingLink: "https://example.com/1",
      license: "CC BY 4.0"
    },
    {
      id: "song-2",
      title: "Song 2",
      albumName: "Album A",
      releaseType: "NCS" as const,
      hasContentId: false,
      streamingLink: "https://example.com/2",
      license: ""
    },
    {
      id: "song-3",
      title: "Song 3",
      albumName: "Album B",
      releaseType: "Monstercat" as const,
      hasContentId: true,
      streamingLink: "https://example.com/3",
      license: "All Rights Reserved"
    }
  ];
  
  try {
    const albums = await loader.groupSongsByAlbum(testSongs);
    console.log(`Grouped ${testSongs.length} songs into ${albums.length} albums`);
    
    albums.forEach(album => {
      console.log(`- ${album.name}: ${album.songs.length} songs`);
    });
    
    return albums;
  } catch (error) {
    console.error('Album grouping failed:', error);
    throw error;
  }
}

/**
 * Run all demos
 */
export async function runAllDemos() {
  console.log('=== DataLoader Demo ===');
  
  try {
    await demoSingletonUsage();
    await demoValidation();
    await demoAlbumGrouping();
    await demoBasicUsage();
    
    console.log('All demos completed successfully!');
  } catch (error) {
    console.error('Demo failed:', error);
  }
}