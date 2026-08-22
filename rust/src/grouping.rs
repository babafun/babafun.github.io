use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use crate::validation::Track;

/// Album struct matching TypeScript Album interface
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Album {
    pub id: String,
    pub title: String,
    #[serde(rename = "releaseYear")]
    pub release_year: u32,
    #[serde(rename = "streamLink")]
    pub stream_link: String,
    #[serde(rename = "hasContentId")]
    pub has_content_id: bool,
    #[serde(rename = "releaseLabel", skip_serializing_if = "Option::is_none")]
    pub release_label: Option<String>,
    #[serde(rename = "albumArtwork")]
    pub album_artwork: String,
    pub tracks: Vec<Track>,
}

/// Flattened view of a track with its parent album context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SongView {
    pub id: String,
    pub title: String,
    pub license: String,
    #[serde(rename = "streamLink")]
    pub stream_link: String,
    #[serde(rename = "albumId")]
    pub album_id: String,
    #[serde(rename = "albumTitle")]
    pub album_title: String,
    #[serde(rename = "releaseYear")]
    pub release_year: u32,
    #[serde(rename = "hasContentId")]
    pub has_content_id: bool,
    #[serde(rename = "releaseLabel", skip_serializing_if = "Option::is_none")]
    pub release_label: Option<String>,
    #[serde(rename = "albumArtwork")]
    pub album_artwork: String,
}

/// Flattens albums into a list of SongView objects, resolving streamLink per track.
/// Returns JSON string of flattened SongView objects.
#[wasm_bindgen]
pub fn flatten_songs(albums_json: &str) -> String {
    let albums: Vec<Album> = match serde_json::from_str(albums_json) {
        Ok(a) => a,
        Err(e) => return format!("{{\"error\": \"Invalid JSON: {}\"}}", e),
    };

    let mut song_views: Vec<SongView> = Vec::new();

    for album in &albums {
        for track in &album.tracks {
            let resolved_stream_link = track
                .override_stream_link
                .clone()
                .unwrap_or_else(|| album.stream_link.clone());

            song_views.push(SongView {
                id: track.id.clone(),
                title: track.title.clone(),
                license: track.license.clone(),
                stream_link: resolved_stream_link,
                album_id: album.id.clone(),
                album_title: album.title.clone(),
                release_year: album.release_year,
                has_content_id: album.has_content_id,
                release_label: album.release_label.clone(),
                album_artwork: album.album_artwork.clone(),
            });
        }
    }

    match serde_json::to_string(&song_views) {
        Ok(json) => json,
        Err(e) => format!("{{\"error\": \"Serialization error: {}\"}}", e),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn two_album_json() -> &'static str {
        r#"[
            {
                "id": "album-001",
                "title": "Album One",
                "releaseYear": 2023,
                "streamLink": "https://example.com/album1",
                "hasContentId": false,
                "albumArtwork": "https://example.com/art1.jpg",
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
                        "overrideStreamLink": "https://example.com/track2-specific"
                    }
                ]
            },
            {
                "id": "album-002",
                "title": "Album Two",
                "releaseYear": 2024,
                "streamLink": "https://example.com/album2",
                "hasContentId": true,
                "releaseLabel": "Some Label",
                "albumArtwork": "https://example.com/art2.jpg",
                "tracks": [
                    {
                        "id": "track-003",
                        "title": "Track Three",
                        "license": "BGML-P"
                    }
                ]
            }
        ]"#
    }

    #[test]
    fn test_flatten_songs_count() {
        let result = flatten_songs(two_album_json());
        let views: Vec<SongView> = serde_json::from_str(&result).unwrap();
        assert_eq!(views.len(), 3);
    }

    #[test]
    fn test_flatten_songs_uses_album_stream_link_by_default() {
        let result = flatten_songs(two_album_json());
        let views: Vec<SongView> = serde_json::from_str(&result).unwrap();
        let track1 = views.iter().find(|v| v.id == "track-001").unwrap();
        assert_eq!(track1.stream_link, "https://example.com/album1");
    }

    #[test]
    fn test_flatten_songs_uses_override_stream_link_when_present() {
        let result = flatten_songs(two_album_json());
        let views: Vec<SongView> = serde_json::from_str(&result).unwrap();
        let track2 = views.iter().find(|v| v.id == "track-002").unwrap();
        assert_eq!(track2.stream_link, "https://example.com/track2-specific");
    }

    #[test]
    fn test_flatten_songs_album_context_propagated() {
        let result = flatten_songs(two_album_json());
        let views: Vec<SongView> = serde_json::from_str(&result).unwrap();
        let track3 = views.iter().find(|v| v.id == "track-003").unwrap();
        assert_eq!(track3.album_id, "album-002");
        assert_eq!(track3.album_title, "Album Two");
        assert_eq!(track3.release_year, 2024);
        assert_eq!(track3.has_content_id, true);
        assert_eq!(track3.release_label, Some("Some Label".to_string()));
        assert_eq!(track3.album_artwork, "https://example.com/art2.jpg");
    }

    #[test]
    fn test_flatten_songs_empty_albums() {
        let result = flatten_songs("[]");
        let views: Vec<SongView> = serde_json::from_str(&result).unwrap();
        assert_eq!(views.len(), 0);
    }

    #[test]
    fn test_flatten_songs_album_with_no_tracks() {
        let json = r#"[
            {
                "id": "album-001",
                "title": "Empty Album",
                "releaseYear": 2023,
                "streamLink": "https://example.com/album1",
                "hasContentId": false,
                "albumArtwork": "https://example.com/art1.jpg",
                "tracks": []
            }
        ]"#;
        let result = flatten_songs(json);
        let views: Vec<SongView> = serde_json::from_str(&result).unwrap();
        assert_eq!(views.len(), 0);
    }

    #[test]
    fn test_flatten_songs_invalid_json() {
        let result = flatten_songs("not valid json");
        assert!(result.contains("error"));
    }

    #[test]
    fn test_album_serde_camel_case() {
        let album = Album {
            id: "a-001".to_string(),
            title: "My Album".to_string(),
            release_year: 2024,
            stream_link: "https://example.com".to_string(),
            has_content_id: false,
            release_label: None,
            album_artwork: "https://example.com/art.jpg".to_string(),
            tracks: vec![],
        };
        let json = serde_json::to_string(&album).unwrap();
        assert!(json.contains("\"releaseYear\""));
        assert!(json.contains("\"streamLink\""));
        assert!(json.contains("\"hasContentId\""));
        assert!(json.contains("\"albumArtwork\""));
        assert!(!json.contains("release_year"));
        assert!(!json.contains("stream_link"));
        assert!(!json.contains("has_content_id"));
        assert!(!json.contains("album_artwork"));
    }

    #[test]
    fn test_song_view_serde_camel_case() {
        let view = SongView {
            id: "t-001".to_string(),
            title: "My Track".to_string(),
            license: "CC BY 4.0".to_string(),
            stream_link: "https://example.com".to_string(),
            album_id: "a-001".to_string(),
            album_title: "My Album".to_string(),
            release_year: 2024,
            has_content_id: false,
            release_label: None,
            album_artwork: "https://example.com/art.jpg".to_string(),
        };
        let json = serde_json::to_string(&view).unwrap();
        assert!(json.contains("\"streamLink\""));
        assert!(json.contains("\"albumId\""));
        assert!(json.contains("\"albumTitle\""));
        assert!(json.contains("\"releaseYear\""));
        assert!(json.contains("\"hasContentId\""));
        assert!(json.contains("\"albumArtwork\""));
    }
}
