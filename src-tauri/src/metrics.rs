//! Startup timing for measurement builds (`--features startup-metrics`).
//! Prints only milestone names and elapsed milliseconds.
use std::sync::OnceLock;
use std::time::Instant;

static START: OnceLock<Instant> = OnceLock::new();
static READY: OnceLock<()> = OnceLock::new();

pub fn start() {
    START.get_or_init(Instant::now);
}
pub fn mark(milestone: &str) {
    if let Some(start) = START.get() {
        eprintln!(
            "startup-metrics {milestone} {} ms",
            start.elapsed().as_millis()
        );
    }
}
/// The first entry-list request means the interface has loaded and asked for the journal.
pub fn journal_ready() {
    if READY.set(()).is_ok() {
        mark("journal-requested");
    }
}
