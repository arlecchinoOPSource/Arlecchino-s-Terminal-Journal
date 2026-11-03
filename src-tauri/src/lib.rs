mod journal;
mod storage;
use std::sync::Mutex;
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{Emitter, Manager};
struct ExitAllowed(AtomicBool);

pub struct Database(pub Mutex<Result<rusqlite::Connection, String>>);

#[tauri::command]
async fn journal_list(db: tauri::State<'_, Database>) -> Result<Vec<journal::Summary>, String> {
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
fn journal_finish_exit(app: tauri::AppHandle) {
    app.state::<ExitAllowed>().0.store(true, Ordering::SeqCst);
    app.exit(0);
}
pub fn run() {
    let app = tauri::Builder::default()
        .manage(ExitAllowed(AtomicBool::new(false)))
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
            journal_finish_exit
        ])
        .setup(|app| {
            let database = (|| {
                let directory = app
                    .path()
                    .app_data_dir()
                    .map_err(|_| "Could not locate journal folder")?;
                std::fs::create_dir_all(&directory)
                    .map_err(|_| "Could not create journal folder")?;
                storage::open(&directory.join("journal.sqlite3"))
                    .map_err(|_| "Could not open journal database")
            })()
            .map_err(str::to_string);
            app.manage(Database(Mutex::new(database)));
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
