use wasm_bindgen::prelude::*;
use crate::validation::{Song, ReleaseType};
use regex::Regex;

/// Checks if license is a commercial Creative Commons license
/// Matches: CC BY, CC BY-SA, CC0 (with optional version numbers)
#[wasm_bindgen]
pub fn is_commercial_cc_license(license: &str) -> bool {
    let license_upper = license.to_uppercase().trim().to_string();
    
    // Match CC BY, CC BY-SA, CC0 with optional version numbers
    // Examples: "CC BY", "CC BY 4.0", "CC BY-SA", "CC BY-SA 4.0", "CC0", "CC0 1.0"
    let patterns = [
        r"^CC BY( \d+\.\d+)?$",
        r"^CC BY-SA( \d+\.\d+)?$",
        r"^CC0( \d+\.\d+)?$",
    ];
    
    for pattern in &patterns {
        if let Ok(re) = Regex::new(pattern) {
            if re.is_match(&license_upper) {
                return true;
            }
        }
    }
    
    false
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
