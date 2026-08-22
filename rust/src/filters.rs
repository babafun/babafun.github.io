use wasm_bindgen::prelude::*;
use crate::grouping::SongView;
use regex::Regex;
use lazy_static::lazy_static;

// Compile regexes once at startup for better performance
lazy_static! {
    static ref CC_BY_REGEX: Regex = Regex::new(r"^CC BY( \d+\.\d+)?$").unwrap();
    static ref CC_BY_SA_REGEX: Regex = Regex::new(r"^CC BY-SA( \d+\.\d+)?$").unwrap();
    static ref CC0_REGEX: Regex = Regex::new(r"^CC0( \d+\.\d+)?$").unwrap();
}

/// Checks if license is a commercial Creative Commons license
/// Matches: CC BY, CC BY-SA, CC0 (with optional version numbers)
#[wasm_bindgen]
pub fn is_commercial_cc_license(license: &str) -> bool {
    let license_upper = license.to_uppercase().trim().to_string();

    CC_BY_REGEX.is_match(&license_upper)
        || CC_BY_SA_REGEX.is_match(&license_upper)
        || CC0_REGEX.is_match(&license_upper)
}

/// Checks if license is BGML-P (Babafun Game Music License - Permissive)
#[wasm_bindgen]
pub fn is_bgml_p_license(license: &str) -> bool {
    license.trim().eq_ignore_ascii_case("BGML-P")
}

/// Checks if a license string is creator-friendly
/// Creator-friendly: CC BY / CC BY-SA / CC0 (any version) OR BGML-P
pub fn is_creator_friendly_license(license: &str) -> bool {
    is_commercial_cc_license(license) || is_bgml_p_license(license)
}

/// Checks if a SongView JSON object is creator-friendly
#[wasm_bindgen]
pub fn is_creator_friendly_song(song_json: &str) -> bool {
    let song: SongView = match serde_json::from_str(song_json) {
        Ok(s) => s,
        Err(_) => return false,
    };
    is_creator_friendly_license(&song.license)
}

/// Filters SongView objects to only creator-friendly ones
/// Returns JSON string of filtered songs
#[wasm_bindgen]
pub fn filter_creator_friendly(songs_json: &str) -> String {
    let songs: Vec<SongView> = match serde_json::from_str(songs_json) {
        Ok(s) => s,
        Err(e) => return format!("{{\"error\": \"Invalid JSON: {}\"}}", e),
    };

    let filtered: Vec<&SongView> = songs
        .iter()
        .filter(|song| is_creator_friendly_license(&song.license))
        .collect();

    match serde_json::to_string(&filtered) {
        Ok(json) => json,
        Err(e) => format!("{{\"error\": \"Serialization error: {}\"}}", e),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_commercial_cc_license() {
        assert!(is_commercial_cc_license("CC BY 4.0"));
        assert!(is_commercial_cc_license("CC BY"));
        assert!(is_commercial_cc_license("cc by 4.0")); // case insensitive
        assert!(is_commercial_cc_license("CC BY-SA 4.0"));
        assert!(is_commercial_cc_license("CC BY-SA"));
        assert!(is_commercial_cc_license("CC0 1.0"));
        assert!(is_commercial_cc_license("CC0"));

        assert!(!is_commercial_cc_license("CC BY-NC 4.0")); // Non-commercial
        assert!(!is_commercial_cc_license("All Rights Reserved"));
        assert!(!is_commercial_cc_license(""));
    }

    #[test]
    fn test_is_bgml_p_license() {
        assert!(is_bgml_p_license("BGML-P"));
        assert!(is_bgml_p_license("bgml-p")); // case insensitive
        assert!(is_bgml_p_license(" BGML-P ")); // with whitespace

        assert!(!is_bgml_p_license("BGML"));
        assert!(!is_bgml_p_license("BGML-R"));
        assert!(!is_bgml_p_license(""));
    }

    #[test]
    fn test_is_creator_friendly_license() {
        assert!(is_creator_friendly_license("CC BY 4.0"));
        assert!(is_creator_friendly_license("CC BY-SA 4.0"));
        assert!(is_creator_friendly_license("CC0 1.0"));
        assert!(is_creator_friendly_license("BGML-P"));

        assert!(!is_creator_friendly_license("All Rights Reserved"));
        assert!(!is_creator_friendly_license(""));
        assert!(!is_creator_friendly_license("CC BY-NC 4.0"));
    }

    fn make_song_view_json(license: &str) -> String {
        format!(
            r#"{{
                "id": "t-001",
                "title": "Test Track",
                "license": "{}",
                "streamLink": "https://example.com",
                "albumId": "a-001",
                "albumTitle": "Test Album",
                "releaseYear": 2024,
                "hasContentId": false,
                "albumArtwork": "https://example.com/art.jpg"
            }}"#,
            license
        )
    }

    #[test]
    fn test_is_creator_friendly_song_cc() {
        assert!(is_creator_friendly_song(&make_song_view_json("CC BY 4.0")));
    }

    #[test]
    fn test_is_creator_friendly_song_bgml_p() {
        assert!(is_creator_friendly_song(&make_song_view_json("BGML-P")));
    }

    #[test]
    fn test_is_creator_friendly_song_not_friendly() {
        assert!(!is_creator_friendly_song(&make_song_view_json("All Rights Reserved")));
        assert!(!is_creator_friendly_song(&make_song_view_json("")));
    }

    #[test]
    fn test_filter_creator_friendly() {
        let songs_json = r#"[
            {
                "id": "t-001",
                "title": "CC Track",
                "license": "CC BY 4.0",
                "streamLink": "https://example.com",
                "albumId": "a-001",
                "albumTitle": "Album",
                "releaseYear": 2024,
                "hasContentId": false,
                "albumArtwork": "https://example.com/art.jpg"
            },
            {
                "id": "t-002",
                "title": "ARR Track",
                "license": "All Rights Reserved",
                "streamLink": "https://example.com",
                "albumId": "a-001",
                "albumTitle": "Album",
                "releaseYear": 2024,
                "hasContentId": false,
                "albumArtwork": "https://example.com/art.jpg"
            },
            {
                "id": "t-003",
                "title": "BGML-P Track",
                "license": "BGML-P",
                "streamLink": "https://example.com",
                "albumId": "a-001",
                "albumTitle": "Album",
                "releaseYear": 2024,
                "hasContentId": false,
                "albumArtwork": "https://example.com/art.jpg"
            }
        ]"#;

        let result = filter_creator_friendly(songs_json);
        let filtered: Vec<SongView> = serde_json::from_str(&result).unwrap();
        assert_eq!(filtered.len(), 2);
        assert!(filtered.iter().any(|s| s.id == "t-001"));
        assert!(filtered.iter().any(|s| s.id == "t-003"));
        assert!(!filtered.iter().any(|s| s.id == "t-002"));
    }

    #[test]
    fn test_filter_creator_friendly_empty() {
        let result = filter_creator_friendly("[]");
        let filtered: Vec<SongView> = serde_json::from_str(&result).unwrap();
        assert_eq!(filtered.len(), 0);
    }
}
