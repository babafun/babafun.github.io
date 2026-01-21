use wasm_bindgen::prelude::*;
use crate::validation::{Song, ReleaseType};
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
    
    // Use pre-compiled regexes for better performance
    CC_BY_REGEX.is_match(&license_upper) ||
    CC_BY_SA_REGEX.is_match(&license_upper) ||
    CC0_REGEX.is_match(&license_upper)
}

/// Checks if license is BGML-P (Babafun Game Music License - Permissive)
#[wasm_bindgen]
pub fn is_bgml_p_license(license: &str) -> bool {
    license.trim().eq_ignore_ascii_case("BGML-P")
}

/// Checks if a song is creator-friendly
/// A song is creator-friendly if ANY of these conditions are true:
/// 1. Has a commercial CC license (CC BY, CC BY-SA, CC0)
/// 2. Is an NCS release
/// 3. Has BGML-P license
#[wasm_bindgen]
pub fn is_creator_friendly_song(song_json: &str) -> bool {
    let song: Song = match serde_json::from_str(song_json) {
        Ok(s) => s,
        Err(_) => return false,
    };
    
    is_creator_friendly(&song)
}

/// Internal function to check if a song is creator-friendly
/// A song is creator-friendly if ANY of these conditions are true:
/// 1. Has a commercial CC license (CC BY, CC BY-SA, CC0)
/// 2. Is an NCS release
/// 3. Has BGML-P license
pub fn is_creator_friendly(song: &Song) -> bool {
    // Check for commercial CC license
    if is_commercial_cc_license(&song.license) {
        return true;
    }
    
    // Check for NCS release
    if song.release_type == ReleaseType::NCS {
        return true;
    }
    
    // Check for BGML-P license
    if is_bgml_p_license(&song.license) {
        return true;
    }
    
    false
}

/// Filters songs to only creator-friendly ones
/// Returns JSON string of filtered songs
#[wasm_bindgen]
pub fn filter_creator_friendly(songs_json: &str) -> String {
    let songs: Vec<Song> = match serde_json::from_str(songs_json) {
        Ok(s) => s,
        Err(e) => return format!("{{\"error\": \"Invalid JSON: {}\"}}", e),
    };
    
    let filtered: Vec<&Song> = songs.iter()
        .filter(|song| is_creator_friendly(song))
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
    fn test_is_creator_friendly() {
        // Test CC license
        let song_cc = Song {
            id: "1".to_string(),
            title: "Test".to_string(),
            album_name: "Album".to_string(),
            release_type: ReleaseType::Independent,
            has_content_id: false,
            streaming_link: "https://example.com".to_string(),
            license: "CC BY 4.0".to_string(),
        };
        assert!(is_creator_friendly(&song_cc));

        // Test NCS release
        let song_ncs = Song {
            id: "2".to_string(),
            title: "Test".to_string(),
            album_name: "Album".to_string(),
            release_type: ReleaseType::NCS,
            has_content_id: false,
            streaming_link: "https://example.com".to_string(),
            license: "".to_string(),
        };
        assert!(is_creator_friendly(&song_ncs));

        // Test BGML-P license
        let song_bgml = Song {
            id: "3".to_string(),
            title: "Test".to_string(),
            album_name: "Album".to_string(),
            release_type: ReleaseType::Independent,
            has_content_id: false,
            streaming_link: "https://example.com".to_string(),
            license: "BGML-P".to_string(),
        };
        assert!(is_creator_friendly(&song_bgml));

        // Test non-creator-friendly
        let song_not_friendly = Song {
            id: "4".to_string(),
            title: "Test".to_string(),
            album_name: "Album".to_string(),
            release_type: ReleaseType::Independent,
            has_content_id: true,
            streaming_link: "https://example.com".to_string(),
            license: "All Rights Reserved".to_string(),
        };
        assert!(!is_creator_friendly(&song_not_friendly));
    }
}
