//! Complete journal backups (T-15). Format: see docs/BACKUP-FORMAT.md.
use crate::journal::{Entry, valid_entry_fields};
use crate::preferences::{self, Preferences};
use rusqlite::{Connection, TransactionBehavior, params};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

pub const FORMAT: &str = "terminal-journal-backup";
pub const VERSION: u32 = 1;
/// Refuse to read larger files; a journal of plain text is far smaller.
pub const MAX_BYTES: u64 = 256 * 1024 * 1024;
const MAX_ENTRIES: usize = 200_000;

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Backup {
    pub format: String,
    pub version: u32,
    pub exported_at: i64,
    pub next_entry_number: i64,
    pub entries: Vec<Entry>,
    pub preferences: Option<Preferences>,
}

/// What the person is asked to confirm before a restore replaces their journal.
#[derive(Serialize)]
pub struct Preview {
    pub token: u64,
    pub backup_entries: usize,
    pub exported_at: i64,
    pub current_entries: usize,
}

const UNREADABLE: &str =
    "This file is not a Terminal backup or is damaged. Your journal has not been changed.";

pub fn export(db: &Connection, exported_at: i64) -> Result<String, String> {
    let failed =
        |_| "The backup could not be created. Your journal has not been changed.".to_string();
    let mut query = db
        .prepare("SELECT id,entry_number,title,content,schema_version,created_at,updated_at,revision FROM entries ORDER BY entry_number")
        .map_err(failed)?;
    let entries = query
        .query_map([], |r| {
            let json: String = r.get(3)?;
            Ok(Entry {
                id: r.get(0)?,
                entry_number: r.get(1)?,
                title: r.get(2)?,
                content: serde_json::from_str(&json).unwrap_or_default(),
                schema_version: r.get(4)?,
                created_at: r.get(5)?,
                updated_at: r.get(6)?,
                revision: r.get(7)?,
            })
        })
        .map_err(failed)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(failed)?;
    let next_entry_number = db
        .query_row("SELECT next_number FROM entry_sequence", [], |r| r.get(0))
        .map_err(failed)?;
    let backup = Backup {
        format: FORMAT.into(),
        version: VERSION,
        exported_at,
        next_entry_number,
        entries,
        preferences: Some(preferences::get(db)?),
    };
    serde_json::to_string_pretty(&backup)
        .map_err(|_| "The backup could not be created.".to_string())
}

/// Parses and fully validates a backup. Nothing is written.
pub fn parse(bytes: &[u8]) -> Result<Backup, String> {
    if bytes.len() as u64 > MAX_BYTES {
        return Err(
            "This file is too large to be a Terminal backup. Your journal has not been changed."
                .into(),
        );
    }
    let probe: serde_json::Value =
        serde_json::from_slice(bytes).map_err(|_| UNREADABLE.to_string())?;
    if probe.get("format").and_then(|f| f.as_str()) != Some(FORMAT) {
        return Err(UNREADABLE.into());
    }
    match probe.get("version").and_then(|v| v.as_u64()) {
        Some(v) if v == u64::from(VERSION) => {}
        Some(v) if v > u64::from(VERSION) => {
            return Err("This backup was made by a newer version of Terminal. Update Terminal to restore it. Your journal has not been changed.".into());
        }
        _ => return Err(UNREADABLE.into()),
    }
    let backup: Backup = serde_json::from_value(probe).map_err(|_| UNREADABLE.to_string())?;
    validate(&backup)?;
    Ok(backup)
}

fn validate(backup: &Backup) -> Result<(), String> {
    let invalid = |what: &str| {
        Err(format!(
            "This backup contains {what}. Your journal has not been changed."
        ))
    };
    if backup.entries.len() > MAX_ENTRIES {
        return invalid("too many entries");
    }
    if backup.next_entry_number < 1 {
        return invalid("an invalid entry counter");
    }
    let mut ids = HashSet::new();
    let mut numbers = HashSet::new();
    for e in &backup.entries {
        if !valid_entry_fields(&e.id, &e.title, &e.content, e.schema_version)
            || e.entry_number < 1
            || e.created_at < 0
            || e.updated_at < e.created_at
            || e.revision < 1
        {
            return invalid("an entry Terminal cannot read");
        }
        if !ids.insert(e.id.as_str()) || !numbers.insert(e.entry_number) {
            return invalid("duplicate entries");
        }
    }
    if let Some(p) = &backup.preferences
        && !p.valid()
    {
        return invalid("unsupported settings");
    }
    Ok(())
}

/// Replaces the whole journal with a validated backup in one transaction:
/// either every entry is replaced or nothing changes.
pub fn restore(db: &mut Connection, backup: &Backup) -> Result<(), String> {
    let failed =
        |_| "The backup could not be restored. Your journal has not been changed.".to_string();
    let tx = db
        .transaction_with_behavior(TransactionBehavior::Immediate)
        .map_err(failed)?;
    tx.execute("DELETE FROM entries", []).map_err(failed)?;
    for e in &backup.entries {
        tx.execute(
            "INSERT INTO entries(id,entry_number,title,content,schema_version,created_at,updated_at,revision) VALUES (?,?,?,?,?,?,?,?)",
            params![e.id, e.entry_number, e.title, e.content.to_string(), e.schema_version, e.created_at, e.updated_at, e.revision],
        )
        .map_err(failed)?;
    }
    // Never reuse a number that exists in the restored journal.
    let highest = backup
        .entries
        .iter()
        .map(|e| e.entry_number)
        .max()
        .unwrap_or(0);
    tx.execute(
        "UPDATE entry_sequence SET next_number=?",
        [backup.next_entry_number.max(highest + 1)],
    )
    .map_err(failed)?;
    tx.execute("DELETE FROM settings WHERE key='last_entry'", [])
        .map_err(failed)?;
    if let Some(p) = &backup.preferences {
        tx.execute(
            "INSERT INTO settings(key,value) VALUES ('preferences',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
            [serde_json::to_string(p).map_err(|_| "The backup could not be restored.".to_string())?],
        )
        .map_err(failed)?;
    }
    tx.commit().map_err(failed)
}

pub fn count_entries(db: &Connection) -> Result<usize, String> {
    db.query_row("SELECT count(*) FROM entries", [], |r| r.get::<_, i64>(0))
        .map(|n| n as usize)
        .map_err(|_| "Storage is unavailable.".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::journal::{self, Save};
    use serde_json::json;

    fn db() -> Connection {
        let mut db = Connection::open_in_memory().unwrap();
        crate::storage::migrate(&mut db).unwrap();
        db
    }
    fn draft(n: u8, title: &str, content: serde_json::Value) -> Save {
        Save {
            id: format!("00000000-0000-4000-8000-{n:012}"),
            title: title.into(),
            content,
            schema_version: 1,
            revision: 0,
        }
    }
    fn rich() -> serde_json::Value {
        serde_json::from_str(include_str!("../../tests/fixtures/formatted-entry.json")).unwrap()
    }
    fn journal_of(db: &Connection) -> Vec<Entry> {
        journal::list(db)
            .unwrap()
            .iter()
            .map(|s| journal::get(db, &s.id).unwrap().unwrap())
            .collect()
    }

    #[test]
    fn export_then_restore_preserves_entries_numbers_timestamps_and_rich_text() {
        let mut source = db();
        journal::save(&mut source, draft(1, "Synthetic one", rich())).unwrap();
        journal::save(&mut source, draft(2, "Synthetic two", json!({"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"café 日本語 🎸"}]}]}))).unwrap();
        journal::save(
            &mut source,
            draft(
                3,
                "Deleted later",
                json!({"type":"doc","content":[{"type":"paragraph"}]}),
            ),
        )
        .unwrap();
        journal::delete(&mut source, &draft(3, "", json!(null)).id, 1).unwrap();
        let chosen = Preferences {
            font: "literata".into(),
            font_size: 20,
            writing_width: 640,
            line_spacing: 180,
        };
        preferences::set(&source, &chosen).unwrap();
        let original = journal_of(&source);
        let file = export(&source, 1_700_000_000_000).unwrap();

        let mut target = db();
        journal::save(&mut target, draft(9, "Will be replaced", json!({"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"x"}]}]}))).unwrap();
        restore(&mut target, &parse(file.as_bytes()).unwrap()).unwrap();

        let restored = journal_of(&target);
        assert_eq!(restored.len(), 2);
        for (a, b) in original.iter().zip(&restored) {
            assert_eq!(
                (
                    &a.id,
                    a.entry_number,
                    &a.title,
                    &a.content,
                    a.created_at,
                    a.updated_at,
                    a.revision
                ),
                (
                    &b.id,
                    b.entry_number,
                    &b.title,
                    &b.content,
                    b.created_at,
                    b.updated_at,
                    b.revision
                )
            );
        }
        assert_eq!(preferences::get(&target).unwrap(), chosen);
        assert!(journal::last(&target).unwrap().is_none());
        // Entry #3 was deleted before the backup; its number is still never reused.
        let next = journal::save(&mut target, draft(4, "After restore", json!({"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"y"}]}]}))).unwrap().unwrap();
        assert_eq!(next.entry_number, 4);
    }

    #[test]
    fn invalid_backups_are_rejected_and_leave_the_journal_untouched() {
        let mut source = db();
        journal::save(&mut source, draft(1, "Keep me", rich())).unwrap();
        let good: serde_json::Value = serde_json::from_str(&export(&source, 1).unwrap()).unwrap();
        let mutate = |f: &dyn Fn(&mut serde_json::Value)| {
            let mut v = good.clone();
            f(&mut v);
            serde_json::to_vec(&v).unwrap()
        };
        let cases: Vec<Vec<u8>> = vec![
            b"not json".to_vec(),
            b"{}".to_vec(),
            mutate(&|v| v["format"] = json!("something-else")),
            mutate(&|v| v["version"] = json!(2)),
            mutate(
                &|v| v["entries"][0]["content"] = json!({"type":"doc","content":[{"type":"image","attrs":{"src":"https://example.invalid"}}]}),
            ),
            mutate(&|v| v["entries"][0]["updated_at"] = json!(-5)),
            mutate(&|v| v["entries"][0]["entry_number"] = json!(0)),
            mutate(&|v| {
                let e = v["entries"][0].clone();
                v["entries"].as_array_mut().unwrap().push(e);
            }),
            mutate(&|v| v["preferences"]["font"] = json!("comic-sans")),
            mutate(&|v| v["unexpected"] = json!(true)),
        ];
        let before = journal_of(&source);
        for bytes in cases {
            assert!(
                parse(&bytes).is_err(),
                "{}",
                String::from_utf8_lossy(&bytes[..bytes.len().min(80)])
            );
        }
        assert!(
            parse(&mutate(&|v| v["version"] = json!(2)))
                .err()
                .unwrap()
                .contains("newer version")
        );
        let after = journal_of(&source);
        assert_eq!(before.len(), after.len());
        assert_eq!(before[0].content, after[0].content);
    }

    #[test]
    fn a_failing_restore_rolls_back_completely() {
        let mut db = db();
        journal::save(&mut db, draft(1, "Original", rich())).unwrap();
        let mut backup = parse(export(&db, 1).unwrap().as_bytes()).unwrap();
        backup.entries[0].id = "00000000-0000-4000-8000-000000000077".into();
        // Bypass validation to force a constraint failure on the second insert.
        let mut clash = backup.entries[0].clone();
        clash.id = "00000000-0000-4000-8000-000000000078".into();
        backup.entries.push(clash);
        assert!(restore(&mut db, &backup).is_err());
        let left = journal_of(&db);
        assert_eq!(left.len(), 1);
        assert_eq!(left[0].title, "Original");
    }

    #[test]
    fn empty_journal_backup_round_trips() {
        let source = db();
        let mut target = db();
        restore(
            &mut target,
            &parse(export(&source, 1).unwrap().as_bytes()).unwrap(),
        )
        .unwrap();
        assert!(journal::list(&target).unwrap().is_empty());
    }
}
