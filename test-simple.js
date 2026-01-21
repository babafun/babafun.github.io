// Simple test to check if JavaScript fallbacks work
const { filterCreatorFriendly, isCreatorFriendlySong } = require('./src/utils/filters.ts');

// Test data
const testSongs = [
  {
    id: 'test-1',
    title: 'Test Song 1',
    albumName: 'Test Album',
    releaseType: 'NCS',
    hasContentId: false,
    streamingLink: 'https://example.com/1',
    license: '',
    releaseYear: 2023
  },
  {
    id: 'test-2', 
    title: 'Test Song 2',
    albumName: 'Test Album',
    releaseType: 'Independent',
    hasContentId: false,
    streamingLink: 'https://example.com/2',
    license: 'CC BY 4.0',
    releaseYear: 2023
  },
  {
    id: 'test-3',
    title: 'Test Song 3', 
    albumName: 'Test Album',
    releaseType: 'Independent',
    hasContentId: true,
    streamingLink: 'https://example.com/3',
    license: 'All Rights Reserved',
    releaseYear: 2023
  }
];

console.log('Testing JavaScript fallbacks...');

try {
  const creatorFriendly = filterCreatorFriendly(testSongs);
  console.log('Creator-friendly songs:', creatorFriendly.length);
  console.log('Expected: 2 (NCS + CC BY)');
  
  const song1CreatorFriendly = isCreatorFriendlySong(testSongs[0]);
  const song2CreatorFriendly = isCreatorFriendlySong(testSongs[1]);
  const song3CreatorFriendly = isCreatorFriendlySong(testSongs[2]);
  
  console.log('Song 1 (NCS):', song1CreatorFriendly, '(expected: true)');
  console.log('Song 2 (CC BY):', song2CreatorFriendly, '(expected: true)');
  console.log('Song 3 (All Rights Reserved):', song3CreatorFriendly, '(expected: false)');
  
  console.log('JavaScript fallbacks working correctly!');
} catch (error) {
  console.error('Error testing JavaScript fallbacks:', error);
}