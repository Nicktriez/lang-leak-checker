// The lingua crate ships its own wasm-bindgen bindings (see lingua's `src/wasm.rs`),
// exposed automatically when this library is compiled for the wasm32 target.
// This crate is just a thin build target so `wasm-pack` produces the artifact.
pub use lingua::LanguageDetector;
pub use lingua::LanguageDetectorBuilder;
