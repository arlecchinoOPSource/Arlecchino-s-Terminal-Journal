mod storage;
use std::sync::Mutex;
use tauri::Manager;

pub struct Database(pub Mutex<Result<rusqlite::Connection, String>>);

pub fn run() {
    tauri::Builder::default()
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
