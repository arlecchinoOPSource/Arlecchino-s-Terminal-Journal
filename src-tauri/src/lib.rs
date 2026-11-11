pub mod backup;
pub mod commands;
pub mod journal;
#[cfg(feature = "startup-metrics")]
mod metrics;
pub mod preferences;
pub mod storage;
// The standalone application (window, close handling, quitting). A host that embeds the journal builds this
// crate with `default-features = false`: it needs none of this, and `generate_context!` would require the
// standalone app's frontend build.
#[cfg(feature = "standalone")]
mod standalone;
#[cfg(feature = "standalone")]
pub use standalone::run;
