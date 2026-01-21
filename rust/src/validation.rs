use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::json;
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
/// Returns detailed error message if invalid, empty string if valid
#[wasm_bindgen]
pub fn validate_song(song_json: &str) -> String {
    // First try to parse as generic JSON to check structure
    let json_value: serde_json::Value = match serde_json::from_str(song_json) {
        Ok(value) => value,
        Err(e) => return format!("Invalid JSON syntax: {}", e),
    };

    // Check if it's an object
    let obj = match json_value.as_object() {
        Some(obj) => obj,
        None => return "Song must be a JSON object".to_string(),
    };

    // Check all required fields are present
    let required_fields = ["id", "title", "albumName", "releaseType", "hasContentId", "streamingLink", "license"];
    for field in &required_fields {
        if !obj.contains_key(*field) {
            return format!("Missing required field: {}", field);
        }
    }

    // Validate field types
    if !obj["id"].is_string() {
        return "Field 'id' must be a string".to_string();
    }
    if obj["id"].as_str().unwrap().is_empty() {
        return "Field 'id' cannot be empty".to_string();
    }

    if !obj["title"].is_string() {
        return "Field 'title' must be a string".to_string();
    }
    if obj["title"].as_str().unwrap().is_empty() {
        return "Field 'title' cannot be empty".to_string();
    }

    if !obj["albumName"].is_string() {
        return "Field 'albumName' must be a string".to_string();
    }
    if obj["albumName"].as_str().unwrap().is_empty() {
        return "Field 'albumName' cannot be empty".to_string();
    }

    if !obj["releaseType"].is_string() {
        return "Field 'releaseType' must be a string".to_string();
    }
    let release_type = obj["releaseType"].as_str().unwrap();
    if !["Independent", "NCS", "Monstercat"].contains(&release_type) {
        return format!("Field 'releaseType' must be one of: Independent, NCS, Monstercat. Got: {}", release_type);
    }

    if !obj["hasContentId"].is_boolean() {
        return "Field 'hasContentId' must be a boolean".to_string();
    }

    if !obj["streamingLink"].is_string() {
        return "Field 'streamingLink' must be a string".to_string();
    }
    if obj["streamingLink"].as_str().unwrap().is_empty() {
        return "Field 'streamingLink' cannot be empty".to_string();
    }

    if !obj["license"].is_string() {
        return "Field 'license' must be a string".to_string();
    }
    // Note: license can be empty string, so we don't check for emptiness

    // Try to deserialize to Song struct as final validation
    match serde_json::from_str::<Song>(song_json) {
        Ok(_) => String::new(), // Empty string means valid
        Err(e) => format!("Failed to parse song: {}", e),
    }
}

/// Validates entire music data structure
/// Returns error message if invalid, empty string if valid
#[wasm_bindgen]
pub fn validate_music_data(data_json: &str) -> String {
    // First try to parse as generic JSON to check structure
    let json_value: serde_json::Value = match serde_json::from_str(data_json) {
        Ok(value) => value,
        Err(e) => return format!("Invalid JSON syntax: {}", e),
    };

    // Check if it's an object
    let obj = match json_value.as_object() {
        Some(obj) => obj,
        None => return "Music data must be a JSON object".to_string(),
    };

    // Check required top-level fields
    if !obj.contains_key("songs") {
        return "Missing required field: songs".to_string();
    }

    if !obj["songs"].is_array() {
        return "Field 'songs' must be an array".to_string();
    }

    // Try to parse the full structure
    let music_data: MusicData = match serde_json::from_str(data_json) {
        Ok(data) => data,
        Err(e) => return format!("Invalid music data structure: {}", e),
    };

    // Validate each song individually
    for (index, song) in music_data.songs.iter().enumerate() {
        let song_json = match serde_json::to_string(song) {
            Ok(json) => json,
            Err(e) => return format!("Failed to serialize song at index {}: {}", index, e),
        };
        
        let validation_result = validate_song(&song_json);
        if !validation_result.is_empty() {
            return format!("Song at index {} is invalid: {}", index, validation_result);
        }
    }

    // Check for duplicate IDs
    let mut seen_ids = std::collections::HashSet::new();
    for (index, song) in music_data.songs.iter().enumerate() {
        if !seen_ids.insert(&song.id) {
            return format!("Duplicate song ID '{}' found at index {}", song.id, index);
        }
    }

    // Validate that songs array is not empty if albums are present
    if music_data.songs.is_empty() && obj.contains_key("albums") && obj["albums"].is_array() && !obj["albums"].as_array().unwrap().is_empty() {
        return "Cannot have albums without songs".to_string();
    }

    String::new() // Empty string means valid
}

/// Batch validates multiple songs (optimized)
/// Returns JSON string with validation results for each song
#[wasm_bindgen]
pub fn batch_validate_songs(songs_json: &str) -> String {
    // First try to parse as generic JSON to check structure
    let json_value: serde_json::Value = match serde_json::from_str(songs_json) {
        Ok(value) => value,
        Err(e) => return format!("{{\"error\": \"Invalid JSON syntax: {}\"}}", e.to_string().replace('"', "\\\"")),
    };

    // Check if it's an array
    let _songs_array = match json_value.as_array() {
        Some(array) => array,
        None => return "{\"error\": \"Input must be a JSON array of songs\"}".to_string(),
    };

    // Try to parse as songs array
    let songs: Vec<Song> = match serde_json::from_str(songs_json) {
        Ok(s) => s,
        Err(e) => return format!("{{\"error\": \"Failed to parse songs array: {}\"}}", e.to_string().replace('"', "\\\"")),
    };

    let mut results = Vec::new();
    let mut seen_ids = std::collections::HashSet::new();

    for (index, song) in songs.iter().enumerate() {
        // Check for duplicate IDs
        let mut validation_errors = Vec::new();
        
        if !seen_ids.insert(&song.id) {
            validation_errors.push(format!("Duplicate ID '{}'", song.id));
        }

        // Validate individual song by serializing it back and validating
        let song_json = match serde_json::to_string(song) {
            Ok(json) => json,
            Err(e) => {
                validation_errors.push(format!("Serialization error: {}", e));
                json!({
                    "index": index,
                    "valid": false,
                    "errors": validation_errors
                }).to_string()
            }
        };

        if validation_errors.is_empty() {
            let validation_result = validate_song(&song_json);
            if !validation_result.is_empty() {
                validation_errors.push(validation_result);
            }
        }

        let result = if validation_errors.is_empty() {
            serde_json::json!({
                "index": index,
                "valid": true,
                "songId": song.id
            })
        } else {
            serde_json::json!({
                "index": index,
                "valid": false,
                "songId": song.id,
                "errors": validation_errors
            })
        };

        results.push(result.to_string());
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
        let result = validate_song(json);
        assert_eq!(result, ""); // Empty string means valid
    }

    #[test]
    fn test_validate_song_missing_field() {
        let json = r#"{
            "id": "song-001",
            "title": "Test Song",
            "albumName": "Test Album",
            "releaseType": "Independent",
            "hasContentId": false,
            "streamingLink": "https://example.com"
        }"#;
        let result = validate_song(json);
        assert!(result.contains("Missing required field: license"));
    }

    #[test]
    fn test_validate_song_invalid_release_type() {
        let json = r#"{
            "id": "song-001",
            "title": "Test Song",
            "albumName": "Test Album",
            "releaseType": "InvalidType",
            "hasContentId": false,
            "streamingLink": "https://example.com",
            "license": ""
        }"#;
        let result = validate_song(json);
        assert!(result.contains("releaseType' must be one of: Independent, NCS, Monstercat"));
    }

    #[test]
    fn test_validate_song_invalid_type() {
        let json = r#"{
            "id": "song-001",
            "title": "Test Song",
            "albumName": "Test Album",
            "releaseType": "Independent",
            "hasContentId": "not_a_boolean",
            "streamingLink": "https://example.com",
            "license": ""
        }"#;
        let result = validate_song(json);
        assert!(result.contains("hasContentId' must be a boolean"));
    }

    #[test]
    fn test_validate_song_empty_required_field() {
        let json = r#"{
            "id": "",
            "title": "Test Song",
            "albumName": "Test Album",
            "releaseType": "Independent",
            "hasContentId": false,
            "streamingLink": "https://example.com",
            "license": ""
        }"#;
        let result = validate_song(json);
        assert!(result.contains("Field 'id' cannot be empty"));
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

    #[test]
    fn test_validate_music_data_invalid_song() {
        let json = r#"{
            "songs": [
                {
                    "id": "song-001",
                    "title": "Test Song 1",
                    "albumName": "Test Album",
                    "releaseType": "InvalidType",
                    "hasContentId": false,
                    "streamingLink": "https://example.com",
                    "license": ""
                }
            ],
            "albums": []
        }"#;
        let result = validate_music_data(json);
        println!("Actual result: {}", result);
        assert!(result.contains("Song at index 0 is invalid") || result.contains("Invalid music data structure"));
        assert!(result.contains("releaseType") || result.contains("InvalidType"));
    }

    #[test]
    fn test_validate_music_data_missing_songs_field() {
        let json = r#"{
            "albums": []
        }"#;
        let result = validate_music_data(json);
        assert!(result.contains("Missing required field: songs"));
    }

    #[test]
    fn test_batch_validate_songs_valid() {
        let json = r#"[
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
                "id": "song-002",
                "title": "Test Song 2",
                "albumName": "Test Album",
                "releaseType": "NCS",
                "hasContentId": false,
                "streamingLink": "https://example.com",
                "license": "CC BY 4.0"
            }
        ]"#;
        let result = batch_validate_songs(json);
        
        // Parse the result to verify structure
        let parsed: serde_json::Value = serde_json::from_str(&result).unwrap();
        assert!(parsed.is_array());
        let array = parsed.as_array().unwrap();
        assert_eq!(array.len(), 2);
        
        // Check first song result
        assert_eq!(array[0]["index"], 0);
        assert_eq!(array[0]["valid"], true);
        assert_eq!(array[0]["songId"], "song-001");
        
        // Check second song result
        assert_eq!(array[1]["index"], 1);
        assert_eq!(array[1]["valid"], true);
        assert_eq!(array[1]["songId"], "song-002");
    }

    #[test]
    fn test_batch_validate_songs_with_duplicates() {
        let json = r#"[
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
        ]"#;
        let result = batch_validate_songs(json);
        
        // Parse the result to verify structure
        let parsed: serde_json::Value = serde_json::from_str(&result).unwrap();
        assert!(parsed.is_array());
        let array = parsed.as_array().unwrap();
        assert_eq!(array.len(), 2);
        
        // First song should be valid
        assert_eq!(array[0]["valid"], true);
        
        // Second song should be invalid due to duplicate ID
        assert_eq!(array[1]["valid"], false);
        assert!(array[1]["errors"].as_array().unwrap()[0].as_str().unwrap().contains("Duplicate ID"));
    }

    #[test]
    fn test_batch_validate_songs_invalid_json() {
        let json = "not valid json";
        let result = batch_validate_songs(json);
        
        // Parse the result to verify error structure
        let parsed: serde_json::Value = serde_json::from_str(&result).unwrap();
        assert!(parsed["error"].as_str().unwrap().contains("Invalid JSON syntax"));
    }

    #[test]
    fn test_comprehensive_validation_workflow() {
        // This test demonstrates the complete validation workflow
        
        // 1. Test individual song validation
        let valid_song = r#"{
            "id": "song-001",
            "title": "Test Song",
            "albumName": "Test Album",
            "releaseType": "Independent",
            "hasContentId": false,
            "streamingLink": "https://example.com",
            "license": "CC BY 4.0"
        }"#;
        
        let song_result = validate_song(valid_song);
        assert_eq!(song_result, "");
        
        // 2. Test music data validation
        let music_data = r#"{
            "songs": [
                {
                    "id": "song-001",
                    "title": "Test Song 1",
                    "albumName": "Test Album",
                    "releaseType": "Independent",
                    "hasContentId": false,
                    "streamingLink": "https://example.com",
                    "license": "CC BY 4.0"
                },
                {
                    "id": "song-002",
                    "title": "Test Song 2",
                    "albumName": "Another Album",
                    "releaseType": "NCS",
                    "hasContentId": true,
                    "streamingLink": "https://example.com/2",
                    "license": ""
                }
            ],
            "albums": []
        }"#;
        
        let data_result = validate_music_data(music_data);
        assert_eq!(data_result, "");
        
        // 3. Test batch validation
        let songs_batch = r#"[
            {
                "id": "song-001",
                "title": "Test Song 1",
                "albumName": "Test Album",
                "releaseType": "Independent",
                "hasContentId": false,
                "streamingLink": "https://example.com",
                "license": "CC BY 4.0"
            },
            {
                "id": "song-002",
                "title": "Test Song 2",
                "albumName": "Another Album",
                "releaseType": "NCS",
                "hasContentId": true,
                "streamingLink": "https://example.com/2",
                "license": ""
            }
        ]"#;
        
        let batch_result = batch_validate_songs(songs_batch);
        let parsed: serde_json::Value = serde_json::from_str(&batch_result).unwrap();
        assert!(parsed.is_array());
        let array = parsed.as_array().unwrap();
        assert_eq!(array.len(), 2);
        
        // Both songs should be valid
        for item in array {
            assert_eq!(item["valid"], true);
        }
    }
}
