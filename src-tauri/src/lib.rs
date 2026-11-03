mod journal;
mod storage;
use std::sync::Mutex;
use tauri::Manager;

pub struct Database(pub Mutex<Result<rusqlite::Connection, String>>);

#[tauri::command]
fn journal_list(db: tauri::State<Database>) -> Result<Vec<journal::Summary>, String> {
    let mut guard = db.0.lock().map_err(|_| "Storage is unavailable")?;
    journal::list(guard.as_mut().map_err(|e| e.clone())?)
}
#[tauri::command]
fn journal_last(db: tauri::State<Database>) -> Result<Option<journal::Entry>, String> {
    let mut guard = db.0.lock().map_err(|_| "Storage is unavailable")?;
    journal::last(guard.as_mut().map_err(|e| e.clone())?)
}
#[tauri::command]
fn journal_select(
    db: tauri::State<Database>,
    id: Option<String>,
) -> Result<Option<journal::Entry>, String> {
    let mut guard = db.0.lock().map_err(|_| "Storage is unavailable")?;
    journal::select(guard.as_mut().map_err(|e| e.clone())?, id.as_deref())
}
#[tauri::command]
fn journal_save(
    db: tauri::State<Database>,
    draft: journal::Save,
) -> Result<Option<journal::Entry>, String> {
    let mut guard = db.0.lock().map_err(|_| "Storage is unavailable")?;
    journal::save(guard.as_mut().map_err(|e| e.clone())?, draft)
}
#[tauri::command]
fn journal_delete(db: tauri::State<Database>, id: String, revision: i64) -> Result<(), String> {
    let mut guard = db.0.lock().map_err(|_| "Storage is unavailable")?;
    journal::delete(guard.as_mut().map_err(|e| e.clone())?, &id, revision)
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            journal_list,
            journal_last,
            journal_select,
            journal_save,
            journal_delete
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
        .run(tauri::generate_context!())
        .expect("could not start Terminal");
}
