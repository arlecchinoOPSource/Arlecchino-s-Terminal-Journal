mod backup;
mod journal;
#[cfg(feature = "startup-metrics")]
mod metrics;
mod preferences;
mod storage;
use std::sync::Mutex;
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{Emitter, Manager};
use tauri_plugin_dialog::DialogExt;
struct ExitAllowed(AtomicBool);

pub struct Database(pub Mutex<Result<rusqlite::Connection, String>>);
/// A validated backup waiting for the person to confirm replacement.
struct PendingRestore(Mutex<Option<(u64, backup::Backup)>>);

fn now_ms() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or_default()
}
/// Keeps a suggested file name to plain characters; the dialog decides the folder.
fn safe_file_name(name: &str, extension: &str) -> String {
    let cleaned: String = name
        .chars()
        .filter(|c| c.is_alphanumeric() || matches!(c, ' ' | '-' | '_' | '.'))
        .take(80)
        .collect();
    let stem = cleaned
        .trim()
        .trim_end_matches(&format!(".{extension}"))
        .trim_matches('.');
    format!(
        "{}.{extension}",
        if stem.is_empty() { "Terminal" } else { stem }
    )
}
/// Writes next to the destination first, then renames, so an interrupted write never leaves half a file.
/// `private` files (copies kept in the app-data folder) are readable by their owner only.
fn write_atomically(path: &std::path::Path, bytes: &[u8], private: bool) -> Result<(), String> {
    let failed =
        |_| "The file could not be written. Choose another folder and try again.".to_string();
    let file_name = path
        .file_name()
        .ok_or("Choose a file name.")?
        .to_string_lossy();
    let temporary = path.with_file_name(format!(".{file_name}.partial"));
    std::fs::write(&temporary, bytes).map_err(failed)?;
    if private {
        storage::restrict_to_owner(&temporary).map_err(failed)?;
    }
    std::fs::rename(&temporary, path).map_err(|e| {
        let _ = std::fs::remove_file(&temporary);
        failed(e)
    })
}
fn display_name(path: &std::path::Path) -> String {
    path.file_name()
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_default()
}

#[tauri::command]
async fn journal_list(db: tauri::State<'_, Database>) -> Result<Vec<journal::Summary>, String> {
    #[cfg(feature = "startup-metrics")]
    metrics::journal_ready();
    let mut guard = db.0.lock().map_err(|_| "Storage is unavailable")?;
    journal::list(guard.as_mut().map_err(|e| e.clone())?)
}
#[tauri::command]
async fn journal_last(db: tauri::State<'_, Database>) -> Result<Option<journal::Entry>, String> {
    let mut guard = db.0.lock().map_err(|_| "Storage is unavailable")?;
    journal::last(guard.as_mut().map_err(|e| e.clone())?)
}
#[tauri::command]
async fn journal_select(
    db: tauri::State<'_, Database>,
    id: Option<String>,
) -> Result<Option<journal::Entry>, String> {
    let mut guard = db.0.lock().map_err(|_| "Storage is unavailable")?;
    journal::select(guard.as_mut().map_err(|e| e.clone())?, id.as_deref())
}
#[tauri::command]
async fn journal_save(
    db: tauri::State<'_, Database>,
    draft: journal::Save,
) -> Result<Option<journal::Entry>, String> {
    let mut guard = db.0.lock().map_err(|_| "Storage is unavailable")?;
    journal::save(guard.as_mut().map_err(|e| e.clone())?, draft)
}
#[tauri::command]
async fn journal_delete(
    db: tauri::State<'_, Database>,
    id: String,
    revision: i64,
) -> Result<(), String> {
    let mut guard = db.0.lock().map_err(|_| "Storage is unavailable")?;
    journal::delete(guard.as_mut().map_err(|e| e.clone())?, &id, revision)
}

#[tauri::command]
async fn preferences_get(
    db: tauri::State<'_, Database>,
) -> Result<preferences::Preferences, String> {
    let mut guard = db.0.lock().map_err(|_| "Storage is unavailable")?;
    preferences::get(guard.as_mut().map_err(|e| e.clone())?)
}
#[tauri::command]
async fn preferences_set(
    db: tauri::State<'_, Database>,
    preferences: preferences::Preferences,
) -> Result<(), String> {
    let mut guard = db.0.lock().map_err(|_| "Storage is unavailable")?;
    preferences::set(guard.as_mut().map_err(|e| e.clone())?, &preferences)
}

#[tauri::command]
async fn backup_export(
    app: tauri::AppHandle,
    db: tauri::State<'_, Database>,
    suggested_name: String,
) -> Result<Option<String>, String> {
    let json = {
        let mut guard = db.0.lock().map_err(|_| "Storage is unavailable")?;
        backup::export(guard.as_mut().map_err(|e| e.clone())?, now_ms())?
    };
    let Some(path) = app
        .dialog()
        .file()
        .set_title("Export journal backup")
        .add_filter("Terminal backup", &["json"])
        .set_file_name(safe_file_name(&suggested_name, "json"))
        .blocking_save_file()
        .and_then(|p| p.into_path().ok())
    else {
        return Ok(None);
    };
    write_atomically(&path, json.as_bytes(), false)?;
    Ok(Some(display_name(&path)))
}
#[tauri::command]
async fn backup_choose(
    app: tauri::AppHandle,
    db: tauri::State<'_, Database>,
    pending: tauri::State<'_, PendingRestore>,
) -> Result<Option<backup::Preview>, String> {
    let Some(path) = app
        .dialog()
        .file()
        .set_title("Choose a journal backup to restore")
        .add_filter("Terminal backup", &["json"])
        .blocking_pick_file()
        .and_then(|p| p.into_path().ok())
    else {
        return Ok(None);
    };
    let unreadable =
        |_| "The file could not be read. Your journal has not been changed.".to_string();
    if std::fs::metadata(&path).map_err(unreadable)?.len() > backup::MAX_BYTES {
        return Err(
            "This file is too large to be a Terminal backup. Your journal has not been changed."
                .into(),
        );
    }
    let parsed = backup::parse(&std::fs::read(&path).map_err(unreadable)?)?;
    let current_entries = {
        let mut guard = db.0.lock().map_err(|_| "Storage is unavailable")?;
        backup::count_entries(guard.as_mut().map_err(|e| e.clone())?)?
    };
    let token = now_ms() as u64;
    let preview = backup::Preview {
        token,
        backup_entries: parsed.entries.len(),
        exported_at: parsed.exported_at,
        current_entries,
    };
    *pending.0.lock().map_err(|_| "Restore is unavailable")? = Some((token, parsed));
    Ok(Some(preview))
}
#[tauri::command]
async fn backup_restore(
    app: tauri::AppHandle,
    db: tauri::State<'_, Database>,
    pending: tauri::State<'_, PendingRestore>,
    token: u64,
) -> Result<String, String> {
    let Some((_, chosen)) = pending
        .0
        .lock()
        .map_err(|_| "Restore is unavailable")?
        .take_if(|(t, _)| *t == token)
    else {
        return Err(
            "Choose the backup again before restoring. Your journal has not been changed.".into(),
        );
    };
    let mut guard = db.0.lock().map_err(|_| "Storage is unavailable")?;
    let connection = guard.as_mut().map_err(|e| e.clone())?;
    // Keep a copy of the journal being replaced; refuse to continue if it cannot be written.
    let folder = app
        .path()
        .app_data_dir()
        .map_err(|_| "Could not locate the journal folder. Your journal has not been changed.")?
        .join("backups");
    std::fs::create_dir_all(&folder)
        .and_then(|_| storage::restrict_to_owner(&folder))
        .map_err(
            |_| "Could not save a copy of the current journal. Your journal has not been changed.",
        )?;
    let copy = folder.join(format!("before-restore-{}.json", now_ms()));
    write_atomically(
        &copy,
        backup::export(connection, now_ms())?.as_bytes(),
        true,
    )
    .map_err(
        |_| "Could not save a copy of the current journal. Your journal has not been changed.",
    )?;
    backup::restore(connection, &chosen)?;
    Ok(copy.display().to_string())
}
/// Saves one entry as a readable file. The person chooses HTML or plain text by the file name's extension.
#[tauri::command]
async fn entry_export(
    app: tauri::AppHandle,
    suggested_name: String,
    html: String,
    text: String,
) -> Result<Option<String>, String> {
    if html.len() > 64 * 1024 * 1024 || text.len() > 64 * 1024 * 1024 {
        return Err("This entry is too large to export.".into());
    }
    let Some(mut path) = app
        .dialog()
        .file()
        .set_title("Export entry")
        .add_filter("Web page (HTML)", &["html", "htm"])
        .add_filter("Plain text", &["txt"])
        .set_file_name(safe_file_name(&suggested_name, "html"))
        .blocking_save_file()
        .and_then(|p| p.into_path().ok())
    else {
        return Ok(None);
    };
    let extension = path
        .extension()
        .map(|e| e.to_string_lossy().to_lowercase())
        .unwrap_or_default();
    let plain = extension == "txt" || extension == "text";
    if !plain && extension != "html" && extension != "htm" {
        path.set_extension(if extension.is_empty() {
            "html".to_string()
        } else {
            format!("{extension}.html")
        });
    }
    write_atomically(
        &path,
        if plain {
            text.as_bytes()
        } else {
            html.as_bytes()
        },
        false,
    )?;
    Ok(Some(display_name(&path)))
}
#[tauri::command]
fn backup_cancel(pending: tauri::State<'_, PendingRestore>) {
    if let Ok(mut slot) = pending.0.lock() {
        *slot = None;
    }
}

#[tauri::command]
fn journal_finish_exit(app: tauri::AppHandle) {
    app.state::<ExitAllowed>().0.store(true, Ordering::SeqCst);
    app.exit(0);
}
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
        .manage(PendingRestore(Mutex::new(None)))
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.emit("journal-close-requested", ());
            }
        })
        .invoke_handler(tauri::generate_handler![
            journal_list,
            journal_last,
            journal_select,
            journal_save,
            journal_delete,
            journal_finish_exit,
            preferences_get,
            preferences_set,
            backup_export,
            backup_choose,
            backup_restore,
            backup_cancel,
            entry_export
        ])
        .setup(|app| {
            let database = (|| {
                let directory = app
                    .path()
                    .app_data_dir()
                    .map_err(|_| "Could not locate journal folder")?;
                std::fs::create_dir_all(&directory)
                    .and_then(|_| storage::restrict_to_owner(&directory))
                    .map_err(|_| "Could not create journal folder")?;
                storage::open(&directory.join("journal.sqlite3"))
                    .map_err(|_| "Could not open journal database")
            })()
            .map_err(str::to_string);
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
    use super::safe_file_name;
    #[test]
    fn suggested_file_names_stay_plain() {
        assert_eq!(
            safe_file_name("Terminal backup 2026-11-04", "json"),
            "Terminal backup 2026-11-04.json"
        );
        assert_eq!(safe_file_name("../../etc/passwd", "html"), "etcpasswd.html");
        assert_eq!(safe_file_name("Notes.html", "html"), "Notes.html");
        assert_eq!(safe_file_name("Café 日本語", "html"), "Café 日本語.html");
        assert_eq!(safe_file_name("///", "json"), "Terminal.json");
    }
}
