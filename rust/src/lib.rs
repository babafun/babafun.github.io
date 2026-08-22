use wasm_bindgen::prelude::*;

// Module declarations
pub mod validation;
pub mod grouping;
pub mod filters;

// Re-export main functions for WASM bindings
pub use validation::*;
pub use grouping::*;
pub use filters::*;

#[cfg(feature = "dev")]
extern crate console_error_panic_hook;

/// Initialize the WASM module
#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "dev")]
    console_error_panic_hook::set_once();
}

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
