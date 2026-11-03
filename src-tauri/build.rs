fn main() {
    tauri_build::try_build(tauri_build::Attributes::new().app_manifest(
        tauri_build::AppManifest::new().commands(&[
            "journal_list",
            "journal_last",
            "journal_select",
            "journal_save",
            "journal_delete",
            "journal_finish_exit",
        ]),
    ))
    .expect("could not build application permissions");
}
