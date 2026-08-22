/**
 * Demo file showing how to use the DataLoader with the album-first data model.
 */

import { DataLoader, loadMusicData } from '../utils/dataLoader';

export async function demoBasicUsage() {
  try {
    console.log('Loading music data...');
    const albums = await loadMusicData();

    console.log(`Loaded ${albums.length} albums`);
    const totalTracks = albums.reduce((n, a) => n + a.tracks.length, 0);
    console.log(`Total tracks: ${totalTracks}`);

    if (albums.length > 0) {
      const firstAlbum = albums[0];
      console.log(`First album: "${firstAlbum.title}" (${firstAlbum.releaseYear}) with ${firstAlbum.tracks.length} tracks`);
    }

    return albums;
  } catch (error) {
    console.error('Failed to load music data:', error);
    throw error;
  }
}

export async function demoSingletonUsage() {
  const loader1 = DataLoader.getInstance();
  const loader2 = DataLoader.getInstance();

  console.log('DataLoader is singleton:', loader1 === loader2);
  console.log('WASM ready:', loader1.isWasmReady());

  return loader1;
}

export async function demoValidation() {
  const loader = DataLoader.getInstance();

  const validData = JSON.stringify([
    {
      id: 'demo-album',
      title: 'Demo Album',
      releaseYear: 2024,
      streamLink: 'https://example.com/demo',
      hasContentId: false,
      albumArtwork: 'https://example.com/art.jpg',
      tracks: [
        { id: 'demo-track-1', title: 'Demo Song', license: 'CC BY 4.0' }
      ]
    }
  ]);

  try {
    const isValid = await loader.validateRawData(validData);
    console.log('Valid data validation result:', isValid);
  } catch (error) {
    console.error('Validation failed:', error);
  }
}

export async function runAllDemos() {
  console.log('=== DataLoader Demo ===');
  try {
    await demoSingletonUsage();
    await demoValidation();
    await demoBasicUsage();
    console.log('All demos completed successfully!');
  } catch (error) {
    console.error('Demo failed:', error);
  }
}
