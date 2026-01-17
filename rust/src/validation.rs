use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use crate::grouping::Album;

/// Release type enum matching TypeScript interface
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ReleaseType {
    Independent,
    NCS,
    Monstercat,
}

/// Song struct matching TypeScript interface
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Song {
    pub id: String,
    pub title: String,
    #[serde(rename = "albumName")]
    pub album_name: String,
    #[serde(rename = "releaseType")]
    pub release_type: ReleaseType,
    #[serde(rename = "hasContentId")]
    pub has_content_id: bool,
    #[serde(rename = "streamingLink")]
    pub streaming_link: String,
    pub license: String,
}

/// Music data structure matching TypeScript interface
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MusicData {
    pub songs: Vec<Song>,
    pub albums: Vec<Album>,
}

/// Validates a single song object from JSON string
/// Returns true if valid, false otherwise
#[wasm_bindgen]
pub fn validate_song(song_json: &str) -> bool {
    match serde_json::from_str::<Song>(song_json) {
        Ok(_) => true,
        Err(_) => false,
    }
}

/// Validates entire music data structure
/// Returns error message if invalid, empty string if valid
#[wasm_bindgen]
pub fn validate_music_data(data_json: &str) -> String {
    // Try to parse the JSON
    let music_data: MusicData = match serde_json::from_str(data_json) {
        Ok(data) => data,
        Err(e) => return format!("Invalid JSON structure: {}", e),
    };

    // Check for duplicate IDs
    let mut seen_ids = std::collections::HashSet::new();
    for song in &music_data.songs {
        if !seen_ids.insert(&song.id) {
            return format!("Duplicate song ID found: {}", song.id);
        }
    }

    // Validate each song has required fields (already done by serde)
    // Additional validation can be added here if needed

    String::new() // Empty string means valid
}

/// Batch validates multiple songs (optimized)
/// Returns JSON string with validation results
#[wasm_bindgen]
pub fn batch_validate_songs(songs_json: &str) -> String {
    let songs: Vec<Song> = match serde_json::from_str(songs_json) {
        Ok(s) => s,
        Err(e) => return format!("{{\"error\": \"Invalid JSON: {}\"}}", e),
    };

    let mut results = Vec::new();
    for (index, _song) in songs.iter().enumerate() {
        results.push(format!("{{\"index\": {}, \"valid\": true}}", index));
    }

    format!("[{}]", results.join(","))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_serde_serialization_deserialization() {
        // Test that structs can serialize to and deserialize from JSON matching TypeScript interfaces
        let song = Song {
            id: "song-001".to_string(),
            title: "Test Song".to_string(),
            album_name: "Test Album".to_string(),
            release_type: ReleaseType::Independent,
            has_content_id: false,
            streaming_link: "https://example.com".to_string(),
            license: "CC BY 4.0".to_string(),
        };

        // Serialize to JSON
        let json = serde_json::to_string(&song).unwrap();
        
        // Verify JSON contains camelCase fields (matching TypeScript)
        assert!(json.contains("\"albumName\""));
        assert!(json.contains("\"releaseType\""));
        assert!(json.contains("\"hasContentId\""));
        assert!(json.contains("\"streamingLink\""));
        assert!(!json.contains("\"album_name\"")); // Should not contain snake_case
        assert!(!json.contains("\"release_type\""));
        assert!(!json.contains("\"has_content_id\""));
        assert!(!json.contains("\"streaming_link\""));

        // Deserialize back from JSON
        let deserialized: Song = serde_json::from_str(&json).unwrap();
        
        // Verify all fields match
        assert_eq!(deserialized.id, song.id);
        assert_eq!(deserialized.title, song.title);
        assert_eq!(deserialized.album_name, song.album_name);
        assert_eq!(deserialized.release_type, song.release_type);
        assert_eq!(deserialized.has_content_id, song.has_content_id);
        assert_eq!(deserialized.streaming_link, song.streaming_link);
        assert_eq!(deserialized.license, song.license);
    }

    #[test]
    fn test_validate_song_valid() {
        let json = r#"{
            "id": "song-001",
            "title": "Test Song",
            "albumName": "Test Album",
            "releaseType": "Independent",
            "hasContentId": false,
            "streamingLink": "https://example.com",
            "license": "CC BY 4.0"
        }"#;
        assert!(validate_song(json));
    }

    #[test]
    fn test_album_serde_serialization() {
        let song = Song {
            id: "song-001".to_string(),
            title: "Test Song".to_string(),
            album_name: "Test Album".to_string(),
            release_type: ReleaseType::NCS,
            has_content_id: false,
            streaming_link: "https://example.com".to_string(),
            license: "".to_string(),
        };

        let album = Album {
            name: "Test Album".to_string(),
            songs: vec![song],
        };

        // Serialize to JSON
        let json = serde_json::to_string(&album).unwrap();
        
        // Verify JSON structure
        assert!(json.contains("\"name\""));
        assert!(json.contains("\"songs\""));
        assert!(json.contains("\"albumName\"")); // Song fields should be camelCase
        assert!(json.contains("\"releaseType\""));

        // Deserialize back from JSON
        let deserialized: Album = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.name, "Test Album");
        assert_eq!(deserialized.songs.len(), 1);
        assert_eq!(deserialized.songs[0].id, "song-001");
    }

    #[test]
    fn test_music_data_serde_serialization() {
        let song = Song {
            id: "song-001".to_string(),
            title: "Test Song".to_string(),
            album_name: "Test Album".to_string(),
            release_type: ReleaseType::Monstercat,
            has_content_id: true,
            streaming_link: "https://example.com".to_string(),
            license: "All Rights Reserved".to_string(),
        };

        let album = Album {
            name: "Test Album".to_string(),
            songs: vec![song.clone()],
        };

        let music_data = MusicData {
            songs: vec![song],
            albums: vec![album],
        };

        // Serialize to JSON
        let json = serde_json::to_string(&music_data).unwrap();
        
        // Verify JSON structure
        assert!(json.contains("\"songs\""));
        assert!(json.contains("\"albums\""));
        assert!(json.contains("\"albumName\"")); // Song fields should be camelCase

        // Deserialize back from JSON
        let deserialized: MusicData = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.songs.len(), 1);
        assert_eq!(deserialized.albums.len(), 1);
        assert_eq!(deserialized.songs[0].id, "song-001");
        assert_eq!(deserialized.albums[0].name, "Test Album");
    }

    #[test]
    fn test_validate_music_data_valid() {
        let json = r#"{
            "songs": [
                {
                    "id": "song-001",
                    "title": "Test Song",
                    "albumName": "Test Album",
                    "releaseType": "Independent",
                    "hasContentId": false,
                    "streamingLink": "https://example.com",
                    "license": "CC BY 4.0"
                }
            ],
            "albums": [
                {
                    "name": "Test Album",
                    "songs": [
                        {
                            "id": "song-001",
                            "title": "Test Song",
                            "albumName": "Test Album",
                            "releaseType": "Independent",
                            "hasContentId": false,
                            "streamingLink": "https://example.com",
                            "license": "CC BY 4.0"
                        }
                    ]
                }
            ]
        }"#;
        let result = validate_music_data(json);
        assert_eq!(result, "");
    }

    #[test]
    fn test_json_format_compatibility_with_typescript() {
        // This test demonstrates that our Rust structs serialize to JSON
        // that exactly matches what TypeScript expects
        
        let song = Song {
            id: "song-001".to_string(),
            title: "Example Song".to_string(),
            album_name: "Example Album".to_string(),
            release_type: ReleaseType::Independent,
            has_content_id: false,
            streaming_link: "https://push.fm/song".to_string(),
            license: "CC BY 4.0".to_string(),
        };

        // Serialize to JSON
        let json = serde_json::to_string_pretty(&song).unwrap();
        println!("Generated JSON:\n{}", json);

        // Verify the JSON contains the exact field names TypeScript expects
        assert!(json.contains("\"id\": \"song-001\""));
        assert!(json.contains("\"title\": \"Example Song\""));
        assert!(json.contains("\"albumName\": \"Example Album\"")); // camelCase
        assert!(json.contains("\"releaseType\": \"Independent\"")); // camelCase
        assert!(json.contains("\"hasContentId\": false")); // camelCase
        assert!(json.contains("\"streamingLink\": \"https://push.fm/song\"")); // camelCase
        assert!(json.contains("\"license\": \"CC BY 4.0\""));

        // Verify it does NOT contain snake_case field names
        assert!(!json.contains("album_name"));
        assert!(!json.contains("release_type"));
        assert!(!json.contains("has_content_id"));
        assert!(!json.contains("streaming_link"));

        // Test that we can parse TypeScript-generated JSON
        let typescript_json = r#"{
            "id": "song-002",
            "title": "Another Song",
            "albumName": "Another Album",
            "releaseType": "NCS",
            "hasContentId": false,
            "streamingLink": "https://example.com/song2",
            "license": ""
        }"#;

        let parsed: Song = serde_json::from_str(typescript_json).unwrap();
        assert_eq!(parsed.id, "song-002");
        assert_eq!(parsed.title, "Another Song");
        assert_eq!(parsed.album_name, "Another Album");
        assert_eq!(parsed.release_type, ReleaseType::NCS);
        assert_eq!(parsed.has_content_id, false);
        assert_eq!(parsed.streaming_link, "https://example.com/song2");
        assert_eq!(parsed.license, "");
    }

    #[test]
    fn test_validate_music_data_duplicate_ids() {
        let json = r#"{
            "songs": [
                {
                    "id": "song-001",
                    "title": "Test Song 1",
                    "albumName": "Test Album",
                    "releaseType": "Independent",
                    "hasContentId": false,
                    "streamingLink": "https://example.com",
                    "license": ""
                },
                {
                    "id": "song-001",
                    "title": "Test Song 2",
                    "albumName": "Test Album",
                    "releaseType": "NCS",
                    "hasContentId": false,
                    "streamingLink": "https://example.com",
                    "license": ""
                }
            ],
            "albums": []
        }"#;
        let result = validate_music_data(json);
        assert!(result.contains("Duplicate song ID"));
    }
}
