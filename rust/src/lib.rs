use wasm_bindgen::prelude::*;

// Module declarations
pub mod validation;
pub mod filters;
pub mod grouping;

// Re-export main functions for WASM bindings
pub use validation::*;
pub use filters::*;
pub use grouping::*;

// When the `dev` feature is enabled, we can call the
// `set_panic_hook` function at least once during initialization, and then
// we will get better error messages if our code ever panics.
//
// For more details see
// https://github.com/rustwasm/console_error_panic_hook#readme
#[cfg(feature = "dev")]
extern crate console_error_panic_hook;

/// Initialize the WASM module
/// Sets up panic hook for better error messages in development
#[wasm_bindgen(start)]
pub fn init() {
    // Set up better panic messages for debugging (only in dev builds)
    #[cfg(feature = "dev")]
    console_error_panic_hook::set_once();
}

// Export utility functions that might be useful for TypeScript
/// Get the version of the WASM module
#[wasm_bindgen]
pub fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Check if WASM module is properly initialized
#[wasm_bindgen]
pub fn is_initialized() -> bool {
    true
}
