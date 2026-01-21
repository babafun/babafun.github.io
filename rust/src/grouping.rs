use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use crate::validation::Song;
use std::collections::HashMap;

/// Album structure for grouping songs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Album {
    pub name: String,
    pub songs: Vec<Song>,
}

/// Groups songs by album name
/// Returns JSON string of grouped albums
#[wasm_bindgen]
pub fn group_by_album(songs_json: &str) -> String {
    let songs: Vec<Song> = match serde_json::from_str(songs_json) {
        Ok(s) => s,
        Err(e) => return format!("{{\"error\": \"Invalid JSON: {}\"}}", e),
    };
    
    // Use HashMap for efficient grouping
    let mut album_map: HashMap<String, Vec<Song>> = HashMap::new();
    
    for song in songs {
        album_map
            .entry(song.album_name.clone())
            .or_insert_with(Vec::new)
            .push(song);
    }
    
    // Convert to Album structs and sort by album name
    let mut albums: Vec<Album> = album_map
        .into_iter()
        .map(|(name, songs)| Album { name, songs })
        .collect();
    
    albums.sort_by(|a, b| a.name.cmp(&b.name));
    
    match serde_json::to_string(&albums) {
        Ok(json) => json,
        Err(e) => format!("{{\"error\": \"Serialization error: {}\"}}", e),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_group_by_album() {
        let json = r#"[
            {
                "id": "song-001",
                "title": "Song 1",
                "albumName": "Album A",
                "releaseType": "Independent",
                "hasContentId": false,
                "streamingLink": "https://example.com",
                "license": ""
            },
            {
                "id": "song-002",
                "title": "Song 2",
                "albumName": "Album B",
                "releaseType": "NCS",
                "hasContentId": false,
                "streamingLink": "https://example.com",
                "license": ""
            },
            {
                "id": "song-003",
                "title": "Song 3",
                "albumName": "Album A",
                "releaseType": "Independent",
                "hasContentId": false,
                "streamingLink": "https://example.com",
                "license": ""
            }
        ]"#;
        
        let result = group_by_album(json);
        assert!(!result.contains("error"));
        
        // Parse result to verify structure
        let albums: Vec<Album> = serde_json::from_str(&result).unwrap();
        assert_eq!(albums.len(), 2);
        
        // Find Album A
        let album_a = albums.iter().find(|a| a.name == "Album A").unwrap();
        assert_eq!(album_a.songs.len(), 2);
        
        // Find Album B
        let album_b = albums.iter().find(|a| a.name == "Album B").unwrap();
        assert_eq!(album_b.songs.len(), 1);
    }

    #[test]
    fn test_group_by_album_preserves_songs() {
        let json = r#"[
            {
                "id": "song-001",
                "title": "Song 1",
                "albumName": "Album A",
                "releaseType": "Independent",
                "hasContentId": false,
                "streamingLink": "https://example.com",
                "license": ""
            },
            {
                "id": "song-002",
                "title": "Song 2",
                "albumName": "Album A",
                "releaseType": "NCS",
                "hasContentId": false,
                "streamingLink": "https://example.com",
                "license": ""
            }
        ]"#;
        
        let result = group_by_album(json);
        let albums: Vec<Album> = serde_json::from_str(&result).unwrap();
        
        // Count total songs
        let total_songs: usize = albums.iter().map(|a| a.songs.len()).sum();
        assert_eq!(total_songs, 2);
        
        // Verify all songs are present
        let all_songs: Vec<&Song> = albums.iter().flat_map(|a| &a.songs).collect();
        assert!(all_songs.iter().any(|s| s.id == "song-001"));
        assert!(all_songs.iter().any(|s| s.id == "song-002"));
    }

    #[test]
    fn test_group_by_album_comprehensive_demo() {
        println!("\n=== Album Grouping Functionality Demo ===");
        
        let json = r#"[
            {
                "id": "song-001",
                "title": "Song 1",
                "albumName": "Album A",
                "releaseType": "Independent",
                "hasContentId": false,
                "streamingLink": "https://example.com",
                "license": ""
            },
            {
                "id": "song-002",
                "title": "Song 2",
                "albumName": "Album B",
                "releaseType": "NCS",
                "hasContentId": false,
                "streamingLink": "https://example.com",
                "license": ""
            },
            {
                "id": "song-003",
                "title": "Song 3",
                "albumName": "Album A",
                "releaseType": "Independent",
                "hasContentId": false,
                "streamingLink": "https://example.com",
                "license": ""
            }
        ]"#;
        
        println!("Input songs JSON:");
        println!("{}", json);
        
        let result = group_by_album(json);
        println!("\nGrouped albums result:");
        println!("{}", result);
        
        // Parse and verify result
        let albums: Vec<Album> = serde_json::from_str(&result).unwrap();
        
        println!("\nAnalysis:");
        println!("- Number of albums: {}", albums.len());
        
        for (i, album) in albums.iter().enumerate() {
            println!("- Album {}: '{}' with {} songs", i + 1, album.name, album.songs.len());
            for song in &album.songs {
                println!("  - {}: {}", song.id, song.title);
            }
        }
        
        // Verify sorting
        let is_sorted = albums.windows(2).all(|w| w[0].name <= w[1].name);
        println!("- Albums sorted by name: {}", is_sorted);
        
        // Count total songs
        let total_songs: usize = albums.iter().map(|a| a.songs.len()).sum();
        println!("- Total songs preserved: {}", total_songs);
        
        println!("✅ Album grouping demo completed!\n");
        
        // Assertions
        assert_eq!(albums.len(), 2);
        assert!(is_sorted);
        assert_eq!(total_songs, 3);
        
        let album_a = albums.iter().find(|a| a.name == "Album A").unwrap();
        let album_b = albums.iter().find(|a| a.name == "Album B").unwrap();
        assert_eq!(album_a.songs.len(), 2);
        assert_eq!(album_b.songs.len(), 1);
    }
}
    #[test]
    fn test_group_by_album_empty() {
        let json = r#"[]"#;
        let result = group_by_album(json);
        let albums: Vec<Album> = serde_json::from_str(&result).unwrap();
        assert_eq!(albums.len(), 0);
    }

    #[test]
    fn test_group_by_album_performance_optimization() {
        // Test with a larger dataset to verify HashMap efficiency
        let mut songs = Vec::new();
        
        // Create 100 songs across 10 albums
        for album_num in 1..=10 {
            for song_num in 1..=10 {
                songs.push(format!(r#"{{
                    "id": "song-{:03}",
                    "title": "Song {} from Album {}",
                    "albumName": "Album {}",
                    "releaseType": "Independent",
                    "hasContentId": false,
                    "streamingLink": "https://example.com",
                    "license": ""
                }}"#, album_num * 10 + song_num, song_num, album_num, album_num));
            }
        }
        
        let json = format!("[{}]", songs.join(","));
        
        // Time the grouping operation
        let start = std::time::Instant::now();
        let result = group_by_album(&json);
        let duration = start.elapsed();
        
        println!("Grouped 100 songs into albums in {:?}", duration);
        
        // Verify result
        let albums: Vec<Album> = serde_json::from_str(&result).unwrap();
        assert_eq!(albums.len(), 10);
        
        // Verify each album has 10 songs
        for album in &albums {
            assert_eq!(album.songs.len(), 10);
        }
        
        // Verify sorting
        let is_sorted = albums.windows(2).all(|w| w[0].name <= w[1].name);
        assert!(is_sorted);
        
        // Verify total song count
        let total_songs: usize = albums.iter().map(|a| a.songs.len()).sum();
        assert_eq!(total_songs, 100);
        
        println!("✅ Performance test passed: {} albums, {} total songs", albums.len(), total_songs);
    }