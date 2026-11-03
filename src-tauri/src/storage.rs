use rusqlite::{Connection, TransactionBehavior};
use std::path::Path;

pub fn open(path: &Path) -> rusqlite::Result<Connection> {
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
