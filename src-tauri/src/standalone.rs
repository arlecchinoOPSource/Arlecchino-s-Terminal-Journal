use crate::commands::{self, DataDir, Database, PendingRestore};
#[cfg(feature = "startup-metrics")]
use crate::metrics;
use std::sync::Mutex;
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{Emitter, Manager};
struct ExitAllowed(AtomicBool);

#[tauri::command]
fn journal_finish_exit(app: tauri::AppHandle, linger_ms: Option<u64>) {
    app.state::<ExitAllowed>().0.store(true, Ordering::SeqCst);
    // Synchronous commands run on the macOS main thread, where blocking would
    // stall the run loop that animates the fullscreen Space shut. Move the
    // transition and the sound tail to a worker thread.
    std::thread::spawn(move || finish_exit(app, linger_ms));
}

fn finish_exit(app: tauri::AppHandle, linger_ms: Option<u64>) {
    // The journal is already saved. When a close sound is playing, hide the window
    // and exit when it ends, so closing never waits on the sound.
    // Hiding a fullscreen macOS window leaves its empty Space onscreen for the
    // whole tail. Leave fullscreen first, let the Space close, then hide.
    let windows: Vec<_> = app.webview_windows().into_values().collect();
    let fullscreen = windows.iter().any(|w| w.is_fullscreen().unwrap_or(true));
    let plan = exit_plan(linger_ms, fullscreen);
    if plan.linger_ms == 0 {
        app.exit(0);
        return;
    }
    let started = std::time::Instant::now();
    if plan.leave_fullscreen {
        for window in &windows {
            let _ = window.set_fullscreen(false);
        }
        let deadline = std::time::Instant::now() + std::time::Duration::from_millis(2000);
        while std::time::Instant::now() < deadline
            && windows.iter().any(|w| w.is_fullscreen().unwrap_or(false))
        {
            std::thread::sleep(std::time::Duration::from_millis(25));
        }
        // The Space keeps animating after the window reports itself windowed.
        std::thread::sleep(std::time::Duration::from_millis(700));
    }
    for window in &windows {
        let _ = window.hide();
    }
    // The sound started before this command; do not lengthen the tail by the transition.
    let elapsed = u64::try_from(started.elapsed().as_millis()).unwrap_or(u64::MAX);
    let remaining = plan.linger_ms.saturating_sub(elapsed);
    std::thread::sleep(std::time::Duration::from_millis(remaining));
    app.exit(0);
}
#[derive(Debug, PartialEq)]
struct ExitPlan {
    leave_fullscreen: bool,
    linger_ms: u64,
}
fn exit_plan(requested: Option<u64>, fullscreen: bool) -> ExitPlan {
    let linger_ms = requested.unwrap_or(0).min(MAX_CLOSE_SOUND_MS);
    ExitPlan {
        leave_fullscreen: fullscreen && linger_ms > 0,
        linger_ms,
    }
}
/// Upper bound on keeping a hidden app alive for its close sound; matches MAX_CLOSE_MS in the sound manager.
const MAX_CLOSE_SOUND_MS: u64 = 6500;
pub fn run() {
    #[cfg(feature = "startup-metrics")]
    metrics::start();
    let builder = tauri::Builder::default();
    #[cfg(feature = "startup-metrics")]
    let builder = builder.on_page_load(|_, payload| {
        if matches!(payload.event(), tauri::webview::PageLoadEvent::Finished) {
            metrics::mark("page-loaded");
        }
    });
    let app = builder
        .plugin(tauri_plugin_dialog::init())
        .manage(ExitAllowed(AtomicBool::new(false)))
        .manage(PendingRestore::default())
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.emit("journal-close-requested", ());
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::journal_list,
            commands::journal_last,
            commands::journal_select,
            commands::journal_save,
            commands::journal_delete,
            journal_finish_exit,
            commands::preferences_get,
            commands::preferences_set,
            commands::backup_export,
            commands::backup_choose,
            commands::backup_restore,
            commands::backup_cancel,
            commands::entry_export
        ])
        .setup(|app| {
            let directory = app
                .path()
                .app_data_dir()
                .map_err(|_| "Could not locate journal folder".to_string());
            let database = directory.clone().and_then(|d| commands::open_in(&d));
            app.manage(DataDir(directory));
            app.manage(Database(Mutex::new(database)));
            #[cfg(feature = "startup-metrics")]
            metrics::mark("storage-opened");
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("could not start Terminal");
    app.run(|app, event| {
        if let tauri::RunEvent::ExitRequested { api, .. } = event
            && !app.state::<ExitAllowed>().0.load(Ordering::SeqCst)
        {
            api.prevent_exit();
            let _ = app.emit_to("main", "journal-close-requested", ());
        }
    });
}

#[cfg(test)]
mod tests {
    use super::{ExitPlan, exit_plan};
    #[test]
    fn fullscreen_close_leaves_fullscreen_but_keeps_the_sound_tail() {
        assert_eq!(
            exit_plan(Some(6000), true),
            ExitPlan {
                leave_fullscreen: true,
                linger_ms: 6000,
            }
        );
        assert_eq!(
            exit_plan(Some(u64::MAX), true),
            ExitPlan {
                leave_fullscreen: true,
                linger_ms: 6500,
            }
        );
        assert_eq!(
            exit_plan(Some(6000), false),
            ExitPlan {
                leave_fullscreen: false,
                linger_ms: 6000,
            }
        );
        assert_eq!(
            exit_plan(Some(u64::MAX), false),
            ExitPlan {
                leave_fullscreen: false,
                linger_ms: 6500,
            }
        );
        // No close sound means no reason to animate out of fullscreen first.
        assert_eq!(
            exit_plan(None, true),
            ExitPlan {
                leave_fullscreen: false,
                linger_ms: 0,
            }
        );
        assert_eq!(
            exit_plan(Some(0), true),
            ExitPlan {
                leave_fullscreen: false,
                linger_ms: 0,
            }
        );
    }
}
