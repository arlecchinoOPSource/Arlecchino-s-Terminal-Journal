fn main() {
    tauri_build::try_build(tauri_build::Attributes::new().app_manifest(
        tauri_build::AppManifest::new().commands(&[
            "journal_list",
            "journal_last",
            "journal_select",
            "journal_save",
            "journal_delete",
            "journal_finish_exit",
            "preferences_get",
            "preferences_set",
            "backup_export",
            "backup_choose",
            "backup_restore",
            "backup_cancel",
        ]),
    ))
    .expect("could not build application permissions");
}
