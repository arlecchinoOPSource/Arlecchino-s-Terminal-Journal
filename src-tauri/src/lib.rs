pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("could not start Terminal");
}
