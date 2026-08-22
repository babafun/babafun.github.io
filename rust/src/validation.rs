use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

/// Track struct matching TypeScript Track interface
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Track {
    pub id: String,
    pub title: String,
    pub license: String,
    #[serde(rename = "overrideStreamLink", skip_serializing_if = "Option::is_none")]
    pub override_stream_link: Option<String>,
}

/// Validates a single album object (including its tracks)
/// Returns error message if invalid, empty string if valid
#[wasm_bindgen]
pub fn validate_album(album_json: &str) -> String {
    let json_value: serde_json::Value = match serde_json::from_str(album_json) {
        Ok(v) => v,
        Err(e) => return format!("Invalid JSON syntax: {}", e),
    };

    let obj = match json_value.as_object() {
        Some(o) => o,
        None => return "Album must be a JSON object".to_string(),
    };

    // Check required string fields
    for field in &["id", "title", "streamLink", "albumArtwork"] {
        match obj.get(*field) {
            None => return format!("Missing required field: {}", field),
            Some(v) if !v.is_string() => return format!("Field '{}' must be a string", field),
            Some(v) if v.as_str().unwrap().is_empty() => {
                return format!("Field '{}' cannot be empty", field)
            }
            _ => {}
        }
    }

    // Check releaseYear (required number)
    match obj.get("releaseYear") {
        None => return "Missing required field: releaseYear".to_string(),
        Some(v) if !v.is_number() => return "Field 'releaseYear' must be a number".to_string(),
        _ => {}
    }

    // Check hasContentId (required boolean)
    match obj.get("hasContentId") {
        None => return "Missing required field: hasContentId".to_string(),
        Some(v) if !v.is_boolean() => {
            return "Field 'hasContentId' must be a boolean".to_string()
        }
        _ => {}
    }

    // Check tracks (required array)
    match obj.get("tracks") {
        None => return "Missing required field: tracks".to_string(),
        Some(v) if !v.is_array() => return "Field 'tracks' must be an array".to_string(),
        _ => {}
    }

    // Validate each track
    let tracks = obj["tracks"].as_array().unwrap();
    for (i, track) in tracks.iter().enumerate() {
        let track_obj = match track.as_object() {
            Some(o) => o,
            None => return format!("Track at index {} must be a JSON object", i),
        };

        for field in &["id", "title", "license"] {
            match track_obj.get(*field) {
                None => {
                    return format!("Track at index {} missing required field: {}", i, field)
                }
                Some(v) if !v.is_string() => {
                    return format!(
                        "Track at index {} field '{}' must be a string",
                        i, field
                    )
                }
                _ => {}
            }
        }

        // id and title cannot be empty
        for field in &["id", "title"] {
            if track_obj[*field].as_str().unwrap().is_empty() {
                return format!(
                    "Track at index {} field '{}' cannot be empty",
                    i, field
                );
            }
        }
    }

    String::new()
}

/// Validates entire music data (array of albums)
/// Returns error message if invalid, empty string if valid
#[wasm_bindgen]
pub fn validate_music_data(data_json: &str) -> String {
    let json_value: serde_json::Value = match serde_json::from_str(data_json) {
        Ok(v) => v,
        Err(e) => return format!("Invalid JSON syntax: {}", e),
    };

    let albums_array = match json_value.as_array() {
        Some(a) => a,
        None => return "Music data must be a JSON array of albums".to_string(),
    };

    let mut seen_album_ids = std::collections::HashSet::new();
    let mut seen_track_ids = std::collections::HashSet::new();

    for (i, album) in albums_array.iter().enumerate() {
        let album_str = match serde_json::to_string(album) {
            Ok(s) => s,
            Err(e) => return format!("Failed to serialize album at index {}: {}", i, e),
        };

        let err = validate_album(&album_str);
        if !err.is_empty() {
            return format!("Album at index {} is invalid: {}", i, err);
        }

        // Check duplicate album IDs
        let album_id = album["id"].as_str().unwrap();
        if !seen_album_ids.insert(album_id.to_string()) {
            return format!("Duplicate album ID '{}' found at index {}", album_id, i);
        }

        // Check duplicate track IDs globally
        let tracks = album["tracks"].as_array().unwrap();
        for (j, track) in tracks.iter().enumerate() {
            let track_id = track["id"].as_str().unwrap();
            if !seen_track_ids.insert(track_id.to_string()) {
                return format!(
                    "Duplicate track ID '{}' found in album '{}' at track index {}",
                    track_id, album_id, j
                );
            }
        }
    }

    String::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn valid_album_json() -> &'static str {
        r#"{
            "id": "album-001",
            "title": "Test Album",
            "releaseYear": 2024,
            "streamLink": "https://example.com/album",
            "hasContentId": false,
            "albumArtwork": "https://example.com/art.jpg",
            "tracks": [
                {
                    "id": "track-001",
                    "title": "Track One",
                    "license": "CC BY 4.0"
                },
                {
                    "id": "track-002",
                    "title": "Track Two",
                    "license": "",
                    "overrideStreamLink": "https://example.com/track2"
                }
            ]
        }"#
    }

    #[test]
    fn test_validate_album_valid() {
        assert_eq!(validate_album(valid_album_json()), "");
    }

    #[test]
    fn test_validate_album_with_optional_release_label() {
        let json = r#"{
            "id": "album-001",
            "title": "Test Album",
            "releaseYear": 2024,
            "streamLink": "https://example.com/album",
            "hasContentId": false,
            "releaseLabel": "Some Label",
            "albumArtwork": "https://example.com/art.jpg",
            "tracks": []
        }"#;
        assert_eq!(validate_album(json), "");
    }

    #[test]
    fn test_validate_album_missing_id() {
        let json = r#"{
            "title": "Test Album",
            "releaseYear": 2024,
            "streamLink": "https://example.com",
            "hasContentId": false,
            "albumArtwork": "https://example.com/art.jpg",
            "tracks": []
        }"#;
        let result = validate_album(json);
        assert!(result.contains("Missing required field: id"), "got: {}", result);
    }

    #[test]
    fn test_validate_album_missing_release_year() {
        let json = r#"{
            "id": "album-001",
            "title": "Test Album",
            "streamLink": "https://example.com",
            "hasContentId": false,
            "albumArtwork": "https://example.com/art.jpg",
            "tracks": []
        }"#;
        let result = validate_album(json);
        assert!(result.contains("Missing required field: releaseYear"), "got: {}", result);
    }

    #[test]
    fn test_validate_album_wrong_type_has_content_id() {
        let json = r#"{
            "id": "album-001",
            "title": "Test Album",
            "releaseYear": 2024,
            "streamLink": "https://example.com",
            "hasContentId": "yes",
            "albumArtwork": "https://example.com/art.jpg",
            "tracks": []
        }"#;
        let result = validate_album(json);
        assert!(result.contains("'hasContentId' must be a boolean"), "got: {}", result);
    }

    #[test]
    fn test_validate_album_empty_id() {
        let json = r#"{
            "id": "",
            "title": "Test Album",
            "releaseYear": 2024,
            "streamLink": "https://example.com",
            "hasContentId": false,
            "albumArtwork": "https://example.com/art.jpg",
            "tracks": []
        }"#;
        let result = validate_album(json);
        assert!(result.contains("'id' cannot be empty"), "got: {}", result);
    }

    #[test]
    fn test_validate_album_track_missing_field() {
        let json = r#"{
            "id": "album-001",
            "title": "Test Album",
            "releaseYear": 2024,
            "streamLink": "https://example.com",
            "hasContentId": false,
            "albumArtwork": "https://example.com/art.jpg",
            "tracks": [
                {
                    "id": "track-001",
                    "title": "Track One"
                }
            ]
        }"#;
        let result = validate_album(json);
        assert!(result.contains("missing required field: license"), "got: {}", result);
    }

    #[test]
    fn test_validate_album_track_empty_id() {
        let json = r#"{
            "id": "album-001",
            "title": "Test Album",
            "releaseYear": 2024,
            "streamLink": "https://example.com",
            "hasContentId": false,
            "albumArtwork": "https://example.com/art.jpg",
            "tracks": [
                {
                    "id": "",
                    "title": "Track One",
                    "license": ""
                }
            ]
        }"#;
        let result = validate_album(json);
        assert!(result.contains("cannot be empty"), "got: {}", result);
    }

    #[test]
    fn test_validate_music_data_valid() {
        let json = r#"[
            {
                "id": "album-001",
                "title": "Album One",
                "releaseYear": 2023,
                "streamLink": "https://example.com/1",
                "hasContentId": false,
                "albumArtwork": "https://example.com/art1.jpg",
                "tracks": [
                    { "id": "track-001", "title": "Track 1", "license": "CC BY 4.0" }
                ]
            },
            {
                "id": "album-002",
                "title": "Album Two",
                "releaseYear": 2024,
                "streamLink": "https://example.com/2",
                "hasContentId": true,
                "albumArtwork": "https://example.com/art2.jpg",
                "tracks": [
                    { "id": "track-002", "title": "Track 2", "license": "" }
                ]
            }
        ]"#;
        assert_eq!(validate_music_data(json), "");
    }

    #[test]
    fn test_validate_music_data_not_array() {
        let json = r#"{"songs": []}"#;
        let result = validate_music_data(json);
        assert!(result.contains("must be a JSON array"), "got: {}", result);
    }

    #[test]
    fn test_validate_music_data_duplicate_album_ids() {
        let json = r#"[
            {
                "id": "album-001",
                "title": "Album One",
                "releaseYear": 2023,
                "streamLink": "https://example.com/1",
                "hasContentId": false,
                "albumArtwork": "https://example.com/art1.jpg",
                "tracks": []
            },
            {
                "id": "album-001",
                "title": "Album Two",
                "releaseYear": 2024,
                "streamLink": "https://example.com/2",
                "hasContentId": false,
                "albumArtwork": "https://example.com/art2.jpg",
                "tracks": []
            }
        ]"#;
        let result = validate_music_data(json);
        assert!(result.contains("Duplicate album ID"), "got: {}", result);
    }

    #[test]
    fn test_validate_music_data_duplicate_track_ids() {
        let json = r#"[
            {
                "id": "album-001",
                "title": "Album One",
                "releaseYear": 2023,
                "streamLink": "https://example.com/1",
                "hasContentId": false,
                "albumArtwork": "https://example.com/art1.jpg",
                "tracks": [
                    { "id": "track-001", "title": "Track 1", "license": "" }
                ]
            },
            {
                "id": "album-002",
                "title": "Album Two",
                "releaseYear": 2024,
                "streamLink": "https://example.com/2",
                "hasContentId": false,
                "albumArtwork": "https://example.com/art2.jpg",
                "tracks": [
                    { "id": "track-001", "title": "Track 2", "license": "" }
                ]
            }
        ]"#;
        let result = validate_music_data(json);
        assert!(result.contains("Duplicate track ID"), "got: {}", result);
    }

    #[test]
    fn test_track_serde_with_override_stream_link() {
        let track = Track {
            id: "t-001".to_string(),
            title: "My Track".to_string(),
            license: "CC BY 4.0".to_string(),
            override_stream_link: Some("https://example.com/track".to_string()),
        };
        let json = serde_json::to_string(&track).unwrap();
        assert!(json.contains("\"overrideStreamLink\""));
        assert!(!json.contains("override_stream_link"));

        let deserialized: Track = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.override_stream_link, Some("https://example.com/track".to_string()));
    }

    #[test]
    fn test_track_serde_without_override_stream_link() {
        let track = Track {
            id: "t-001".to_string(),
            title: "My Track".to_string(),
            license: "".to_string(),
            override_stream_link: None,
        };
        let json = serde_json::to_string(&track).unwrap();
        // Should not include overrideStreamLink when None (skip_serializing_if)
        assert!(!json.contains("overrideStreamLink"));
    }
}
