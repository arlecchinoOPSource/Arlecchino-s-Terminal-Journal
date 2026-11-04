use rusqlite::{Connection, TransactionBehavior};
use std::path::Path;

/// Journal files are readable by their owner only (Unix). Windows profile folders
/// are already private to the user, so this is a no-op there.
pub fn restrict_to_owner(path: &Path) -> std::io::Result<()> {
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mode = if path.is_dir() { 0o700 } else { 0o600 };
        std::fs::set_permissions(path, std::fs::Permissions::from_mode(mode))?;
    }
    #[cfg(not(unix))]
    let _ = path;
    Ok(())
}

pub fn open(path: &Path) -> rusqlite::Result<Connection> {
    // Create the file owner-only before SQLite opens it; SQLite gives its WAL and
    // shared-memory files the same permissions as the database.
    if !path.exists() {
        let mut options = std::fs::OpenOptions::new();
        options.write(true).create_new(true);
        #[cfg(unix)]
        std::os::unix::fs::OpenOptionsExt::mode(&mut options, 0o600);
        options
            .open(path)
            .map_err(|_| rusqlite::Error::InvalidPath(path.to_path_buf()))?;
    }
    restrict_to_owner(path).map_err(|_| rusqlite::Error::InvalidPath(path.to_path_buf()))?;
    let mut db = Connection::open(path)?;
    db.busy_timeout(std::time::Duration::from_secs(3))?;
    migrate(&mut db)?;
    db.pragma_update(None, "journal_mode", "WAL")?;
    db.pragma_update(None, "synchronous", "FULL")?;
    Ok(db)
}

pub fn migrate(db: &mut Connection) -> rusqlite::Result<()> {
    let tx = db.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let version: i64 = tx.pragma_query_value(None, "user_version", |row| row.get(0))?;
    if version > 1 {
        return Err(rusqlite::Error::InvalidQuery);
    }
    if version == 0 {
        tx.execute_batch(include_str!("../migrations/0001_initial.sql"))?;
        tx.pragma_update(None, "user_version", 1)?;
    }
    tx.commit()
}

#[cfg(test)]
mod tests {
    use super::*;
    #[cfg(unix)]
    #[test]
    fn journal_files_are_readable_by_their_owner_only() {
        use std::os::unix::fs::PermissionsExt;
        let dir =
            std::env::temp_dir().join(format!("terminal-perms-synthetic-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        restrict_to_owner(&dir).unwrap();
        let path = dir.join("journal.sqlite3");
        let db = open(&path).unwrap();
        db.execute("INSERT INTO settings VALUES ('synthetic', 'true')", [])
            .unwrap();
        let mode = |p: &Path| std::fs::metadata(p).unwrap().permissions().mode() & 0o777;
        assert_eq!(mode(&dir), 0o700);
        assert_eq!(mode(&path), 0o600);
        let wal = dir.join("journal.sqlite3-wal");
        assert!(wal.exists());
        assert_eq!(mode(&wal), 0o600);
        drop(db);
        // An existing, looser file is tightened when opened.
        std::fs::set_permissions(&path, std::fs::Permissions::from_mode(0o644)).unwrap();
        drop(open(&path).unwrap());
        assert_eq!(mode(&path), 0o600);
        std::fs::remove_dir_all(&dir).unwrap();
    }
    #[test]
    fn a_damaged_database_file_is_reported_without_changing_it() {
        let dir =
            std::env::temp_dir().join(format!("terminal-corrupt-synthetic-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let path = dir.join("journal.sqlite3");
        let garbage = b"not a database, synthetic bytes".repeat(200);
        std::fs::write(&path, &garbage).unwrap();
        assert!(open(&path).is_err());
        assert_eq!(std::fs::read(&path).unwrap(), garbage);
        std::fs::remove_dir_all(&dir).unwrap();
    }
    #[test]
    fn migration_is_repeatable_and_preserves_data() {
        let mut db = Connection::open_in_memory().unwrap();
        migrate(&mut db).unwrap();
        db.execute("INSERT INTO settings VALUES ('synthetic', 'true')", [])
            .unwrap();
        migrate(&mut db).unwrap();
        assert_eq!(
            db.query_row("SELECT value FROM settings", [], |r| r.get::<_, String>(0))
                .unwrap(),
            "true"
        );
    }
    #[test]
    fn future_schema_is_rejected_without_mutation() {
        let mut db = Connection::open_in_memory().unwrap();
        db.pragma_update(None, "user_version", 99).unwrap();
        assert!(migrate(&mut db).is_err());
        assert_eq!(
            db.pragma_query_value(None, "user_version", |r| r.get::<_, i64>(0))
                .unwrap(),
            99
        );
    }
    #[test]
    fn failed_migration_rolls_back_all_changes() {
        let mut db = Connection::open_in_memory().unwrap();
        db.execute("CREATE TABLE settings (existing TEXT)", [])
            .unwrap();
        assert!(migrate(&mut db).is_err());
        assert_eq!(
            db.query_row(
                "SELECT count(*) FROM sqlite_master WHERE name='entries'",
                [],
                |r| r.get::<_, i64>(0)
            )
            .unwrap(),
            0
        );
    }
}
