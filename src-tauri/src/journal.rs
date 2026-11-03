use rusqlite::{Connection, OptionalExtension, TransactionBehavior, params};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Clone, Serialize, Deserialize)]
pub struct Entry {
    pub id: String,
    pub entry_number: i64,
    pub title: String,
    pub content: Value,
    pub schema_version: i64,
    pub created_at: i64,
    pub updated_at: i64,
    pub revision: i64,
}
#[derive(Serialize)]
pub struct Summary {
    pub id: String,
    pub entry_number: i64,
    pub title: String,
    pub updated_at: i64,
}
#[derive(Clone, Deserialize)]
pub struct Save {
    pub id: String,
    pub title: String,
    pub content: Value,
    pub schema_version: i64,
    pub revision: i64,
}
const FAILURE: &str = "The journal could not be updated. Your unsaved writing is still in this window. Retry when storage is available.";
fn safe(_: rusqlite::Error) -> String {
    FAILURE.into()
}
fn now() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as i64
}
fn row(r: &rusqlite::Row<'_>) -> rusqlite::Result<Entry> {
    let json: String = r.get(3)?;
    let content = serde_json::from_str(&json).map_err(|e| {
        rusqlite::Error::FromSqlConversionFailure(3, rusqlite::types::Type::Text, Box::new(e))
    })?;
    Ok(Entry {
        id: r.get(0)?,
        entry_number: r.get(1)?,
        title: r.get(2)?,
        content,
        schema_version: r.get(4)?,
        created_at: r.get(5)?,
        updated_at: r.get(6)?,
        revision: r.get(7)?,
    })
}
pub fn get(db: &Connection, id: &str) -> Result<Option<Entry>, String> {
    db.query_row("SELECT id,entry_number,title,content,schema_version,created_at,updated_at,revision FROM entries WHERE id=?", [id], row).optional().map_err(safe)
}
pub fn list(db: &Connection) -> Result<Vec<Summary>, String> {
    let mut query = db.prepare("SELECT id,entry_number,title,updated_at FROM entries ORDER BY updated_at DESC,entry_number DESC").map_err(safe)?;
    query
        .query_map([], |r| {
            Ok(Summary {
                id: r.get(0)?,
                entry_number: r.get(1)?,
                title: r.get(2)?,
                updated_at: r.get(3)?,
            })
        })
        .map_err(safe)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(safe)
}
pub fn last(db: &Connection) -> Result<Option<Entry>, String> {
    let id: Option<String> = db
        .query_row(
            "SELECT value FROM settings WHERE key='last_entry'",
            [],
            |r| r.get(0),
        )
        .optional()
        .map_err(safe)?;
    match id.and_then(|v| serde_json::from_str::<String>(&v).ok()) {
        Some(id) => get(db, &id),
        None => Ok(None),
    }
}
pub fn select(db: &mut Connection, id: Option<&str>) -> Result<Option<Entry>, String> {
    let tx = db.transaction().map_err(safe)?;
    let entry = match id {
        Some(id) => Some(get(&tx, id)?.ok_or("This entry no longer exists.")?),
        None => None,
    };
    tx.execute("INSERT INTO settings(key,value) VALUES ('last_entry',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",[serde_json::to_string(&id).unwrap()]).map_err(safe)?;
    tx.commit().map_err(safe)?;
    Ok(entry)
}
// Font values must match FONT_FAMILIES / FONT_SIZES in src/editor/extensions.ts.
const FONT_FAMILIES: [&str; 2] = [
    "'IBM Plex Mono', monospace",
    "'IBM Plex Sans Condensed', sans-serif",
];
const FONT_SIZES: [&str; 4] = ["14px", "17px", "20px", "24px"];

fn small_int(v: &Value, min: i64, max: i64) -> bool {
    v.as_i64().is_some_and(|n| (min..=max).contains(&n))
}
/// Each supported node or mark accepts only its own known attributes. `null`
/// always means "default". Anything else is refused so imported or pasted
/// content cannot smuggle styles, URLs or markup into stored entries.
fn valid_attr(kind: &str, key: &str, v: &Value) -> bool {
    if v.is_null() {
        return matches!(
            (kind, key),
            ("paragraph" | "heading", "textAlign")
                | ("orderedList", "start" | "type")
                | ("textStyle", "fontFamily" | "fontSize")
        );
    }
    match (kind, key) {
        ("paragraph" | "heading", "textAlign") => {
            matches!(v.as_str(), Some("left" | "center" | "right"))
        }
        ("heading", "level") => small_int(v, 1, 3),
        ("orderedList", "start") => small_int(v, -1_000_000, 1_000_000),
        // Pasted lists keep their HTML/CSS list type (e.g. "a", "disc"); it is only
        // ever rendered as a list attribute, so a short plain word is accepted.
        ("orderedList", "type") => v.as_str().is_some_and(|t| {
            !t.is_empty()
                && t.len() <= 24
                && t.chars().all(|c| c.is_ascii_alphanumeric() || c == '-')
        }),
        ("textStyle", "fontFamily") => v.as_str().is_some_and(|f| FONT_FAMILIES.contains(&f)),
        ("textStyle", "fontSize") => v.as_str().is_some_and(|f| FONT_SIZES.contains(&f)),
        _ => false,
    }
}
fn valid_attrs(kind: &str, v: &Value) -> bool {
    match v.get("attrs") {
        None => true,
        Some(Value::Object(attrs)) => attrs.iter().all(|(k, a)| valid_attr(kind, k, a)),
        _ => false,
    }
}
fn valid_node(v: &Value, depth: usize) -> bool {
    if depth > 64 {
        return false;
    }
    let Some(kind) = v.get("type").and_then(Value::as_str) else {
        return false;
    };
    if !matches!(
        kind,
        "doc"
            | "paragraph"
            | "text"
            | "hardBreak"
            | "heading"
            | "bulletList"
            | "orderedList"
            | "listItem"
            | "blockquote"
    ) || !valid_attrs(kind, v)
    {
        return false;
    }
    if kind == "text" && v.get("text").and_then(Value::as_str).is_none() {
        return false;
    }
    if let Some(marks) = v.get("marks") {
        let Some(marks) = marks.as_array() else {
            return false;
        };
        if marks
            .iter()
            .any(|m| match m.get("type").and_then(Value::as_str) {
                Some(mark @ ("bold" | "italic" | "underline" | "strike" | "textStyle")) => {
                    !valid_attrs(mark, m)
                }
                _ => true,
            })
        {
            return false;
        }
    }
    match v.get("content") {
        Some(Value::Array(children)) => children.iter().all(|c| valid_node(c, depth + 1)),
        None => true,
        _ => false,
    }
}
fn has_text(v: &Value) -> bool {
    v.get("text")
        .and_then(Value::as_str)
        .is_some_and(|s| !s.trim().is_empty())
        || v.get("content")
            .and_then(Value::as_array)
            .is_some_and(|a| a.iter().any(has_text))
}
pub fn save(db: &mut Connection, draft: Save) -> Result<Option<Entry>, String> {
    if draft.id.len() != 36
        || !draft.id.chars().all(|c| c.is_ascii_hexdigit() || c == '-')
        || draft.title.len() > 100_000
        || draft.content.to_string().len() > 10_000_000
        || draft.schema_version != 1
        || draft.content.get("type").and_then(Value::as_str) != Some("doc")
        || !valid_node(&draft.content, 0)
    {
        return Err("Unsupported journal document. Your writing has not been replaced.".into());
    }
    let tx = db
        .transaction_with_behavior(TransactionBehavior::Immediate)
        .map_err(safe)?;
    let existing = get(&tx, &draft.id)?;
    if existing.is_none() && draft.revision != 0 {
        return Err("This entry was removed. Your draft remains in this window.".into());
    }
    if existing.is_none() && draft.title.trim().is_empty() && !has_text(&draft.content) {
        return Ok(None);
    }
    let timestamp = now();
    if let Some(old) = existing {
        if old.revision != draft.revision {
            return Err("This entry changed in another window. Your draft is retained; do not close this window.".into());
        }
        tx.execute(
            "UPDATE entries SET title=?,content=?,updated_at=?,revision=revision+1 WHERE id=?",
            params![
                draft.title,
                draft.content.to_string(),
                timestamp.max(old.updated_at),
                draft.id
            ],
        )
        .map_err(safe)?;
    } else {
        let number: i64 = tx
            .query_row(
                "SELECT next_number FROM entry_sequence WHERE singleton=1",
                [],
                |r| r.get(0),
            )
            .map_err(safe)?;
        tx.execute(
            "UPDATE entry_sequence SET next_number=next_number+1 WHERE singleton=1",
            [],
        )
        .map_err(safe)?;
        tx.execute("INSERT INTO entries(id,entry_number,title,content,schema_version,created_at,updated_at) VALUES (?,?,?,?,1,?,?)",params![draft.id,number,draft.title,draft.content.to_string(),timestamp,timestamp]).map_err(safe)?;
    }
    tx.execute("INSERT INTO settings(key,value) VALUES ('last_entry',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",[serde_json::to_string(&draft.id).unwrap()]).map_err(safe)?;
    let result = get(&tx, &draft.id)?;
    tx.commit().map_err(safe)?;
    Ok(result)
}
pub fn delete(db: &mut Connection, id: &str, revision: i64) -> Result<(), String> {
    let tx = db
        .transaction_with_behavior(TransactionBehavior::Immediate)
        .map_err(safe)?;
    let count = tx
        .execute(
            "DELETE FROM entries WHERE id=? AND revision=?",
            params![id, revision],
        )
        .map_err(safe)?;
    if count != 1 {
        return Err("Entry changed or was already removed; deletion was cancelled.".into());
    }
    tx.execute(
        "DELETE FROM settings WHERE key='last_entry' AND value=?",
        [serde_json::to_string(id).unwrap()],
    )
    .map_err(safe)?;
    tx.commit().map_err(safe)
}

#[cfg(test)]
mod tests {
    use super::*;
    fn draft(n: u8) -> Save {
        Save {
            id: format!("00000000-0000-4000-8000-{n:012}"),
            title: "Synthetic".into(),
            content: serde_json::json!({"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"café 日本語"}]}]}),
            schema_version: 1,
            revision: 0,
        }
    }
    fn db() -> Connection {
        let mut db = Connection::open_in_memory().unwrap();
        crate::storage::migrate(&mut db).unwrap();
        db
    }
    #[test]
    fn stable_identity_and_no_number_reuse() {
        let mut db = db();
        let first = save(&mut db, draft(1)).unwrap().unwrap();
        let mut edit = draft(1);
        edit.revision = first.revision;
        edit.title = "Renamed".into();
        let updated = save(&mut db, edit).unwrap().unwrap();
        assert_eq!(first.id, updated.id);
        assert_eq!(first.created_at, updated.created_at);
        assert_eq!(first.entry_number, updated.entry_number);
        delete(&mut db, &updated.id, updated.revision).unwrap();
        assert_eq!(save(&mut db, draft(2)).unwrap().unwrap().entry_number, 2);
    }
    #[test]
    fn blank_draft_does_not_allocate() {
        let mut db = db();
        let mut empty = draft(1);
        empty.title = " ".into();
        empty.content = serde_json::json!({"type":"doc","content":[{"type":"paragraph"}]});
        assert!(save(&mut db, empty).unwrap().is_none());
        assert_eq!(save(&mut db, draft(2)).unwrap().unwrap().entry_number, 1);
    }
    #[test]
    fn stale_save_and_delete_are_rejected() {
        let mut db = db();
        save(&mut db, draft(1)).unwrap();
        assert!(save(&mut db, draft(1)).is_err());
        assert!(delete(&mut db, &draft(1).id, 0).is_err());
        assert_eq!(list(&db).unwrap().len(), 1);
    }
    #[test]
    fn failed_insert_rolls_back_number_allocation() {
        let mut db = db();
        db.execute_batch("CREATE TRIGGER fail_insert BEFORE INSERT ON entries BEGIN SELECT RAISE(ABORT,'synthetic failure'); END;").unwrap();
        assert!(save(&mut db, draft(1)).is_err());
        db.execute_batch("DROP TRIGGER fail_insert").unwrap();
        assert_eq!(save(&mut db, draft(2)).unwrap().unwrap().entry_number, 1);
    }
    #[test]
    fn deleting_middle_entry_keeps_other_numbers_and_never_reuses() {
        let mut db = db();
        for n in 1..=3 {
            save(&mut db, draft(n)).unwrap().unwrap();
        }
        let middle = get(&db, &draft(2).id).unwrap().unwrap();
        delete(&mut db, &middle.id, middle.revision).unwrap();
        let mut numbers: Vec<i64> = list(&db).unwrap().iter().map(|e| e.entry_number).collect();
        numbers.sort();
        assert_eq!(numbers, vec![1, 3]);
        assert_eq!(get(&db, &draft(3).id).unwrap().unwrap().entry_number, 3);
        assert_eq!(save(&mut db, draft(4)).unwrap().unwrap().entry_number, 4);
    }
    #[test]
    fn selecting_entry_is_remembered_and_new_draft_clears_it() {
        let mut db = db();
        save(&mut db, draft(1)).unwrap();
        save(&mut db, draft(2)).unwrap();
        select(&mut db, Some(&draft(1).id)).unwrap();
        assert_eq!(last(&db).unwrap().unwrap().id, draft(1).id);
        select(&mut db, None).unwrap();
        assert!(last(&db).unwrap().is_none());
        assert!(select(&mut db, Some("00000000-0000-4000-8000-000000000099")).is_err());
    }
    #[test]
    fn unsupported_document_is_rejected_without_writing() {
        let mut db = db();
        let mut bad = draft(1);
        bad.content = serde_json::json!({"type":"doc","content":[{"type":"image","attrs":{"src":"https://example.invalid"}}]});
        assert!(save(&mut db, bad).is_err());
        assert!(list(&db).unwrap().is_empty());
    }
    #[test]
    fn formatted_document_round_trips() {
        let mut db = db();
        let mut formatted = draft(1);
        formatted.content =
            serde_json::from_str(include_str!("../../tests/fixtures/formatted-entry.json"))
                .unwrap();
        let saved = save(&mut db, formatted.clone()).unwrap().unwrap();
        assert_eq!(
            get(&db, &saved.id).unwrap().unwrap().content,
            formatted.content
        );
    }
    #[test]
    fn pasted_list_types_are_accepted() {
        let mut db = db();
        let mut pasted = draft(1);
        pasted.content = serde_json::json!({"type":"doc","content":[{"type":"orderedList","attrs":{"start":null,"type":"disc"},"content":[{"type":"listItem","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":"x","marks":[{"type":"textStyle","attrs":{"fontFamily":null,"fontSize":null}}]}]}]}]}]});
        assert!(save(&mut db, pasted).is_ok());
    }
    #[test]
    fn unknown_styles_and_attributes_are_rejected() {
        let mut db = db();
        for content in [
            serde_json::json!({"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"x","marks":[{"type":"textStyle","attrs":{"fontFamily":"url(https://example.invalid)","fontSize":null}}]}]}]}),
            serde_json::json!({"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"x","marks":[{"type":"textStyle","attrs":{"color":"red"}}]}]}]}),
            serde_json::json!({"type":"doc","content":[{"type":"heading","attrs":{"level":6,"textAlign":null},"content":[{"type":"text","text":"x"}]}]}),
            serde_json::json!({"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":"justify","style":"x"},"content":[{"type":"text","text":"x"}]}]}),
            serde_json::json!({"type":"doc","content":[{"type":"orderedList","attrs":{"type":"x\" onload=\"y"},"content":[]}]}),
            serde_json::json!({"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"x","marks":[{"type":"link","attrs":{"href":"https://example.invalid"}}]}]}]}),
        ] {
            let mut bad = draft(1);
            bad.content = content;
            assert!(save(&mut db, bad).is_err());
        }
        assert!(list(&db).unwrap().is_empty());
    }
    #[test]
    fn crash_child() {
        let Ok(path) = std::env::var("TERMINAL_SYNTHETIC_CRASH_DB") else {
            return;
        };
        let mut db = crate::storage::open(std::path::Path::new(&path)).unwrap();
        save(&mut db, draft(1)).unwrap();
        db.execute_batch("BEGIN IMMEDIATE; UPDATE entries SET title='Uncommitted synthetic edit';")
            .unwrap();
        // Exit immediately without running Connection destructors.
        std::process::exit(0);
    }
    #[test]
    fn abrupt_process_exit_preserves_committed_data_only() {
        let path = std::env::temp_dir().join(format!(
            "terminal-crash-synthetic-{}-{}.sqlite3",
            std::process::id(),
            now()
        ));
        let status = std::process::Command::new(std::env::current_exe().unwrap())
            .args(["--exact", "journal::tests::crash_child"])
            .env("TERMINAL_SYNTHETIC_CRASH_DB", &path)
            .status()
            .unwrap();
        assert!(status.success());
        {
            let db = crate::storage::open(&path).unwrap();
            assert_eq!(last(&db).unwrap().unwrap().title, "Synthetic");
        }
        std::fs::remove_file(path).unwrap();
    }
    #[test]
    fn reopen_preserves_document_and_last_entry() {
        let path = std::env::temp_dir().join(format!(
            "terminal-synthetic-{}-{}.sqlite3",
            std::process::id(),
            now()
        ));
        let original = {
            let mut db = crate::storage::open(&path).unwrap();
            save(&mut db, draft(1)).unwrap().unwrap()
        };
        {
            let db = crate::storage::open(&path).unwrap();
            let restored = last(&db).unwrap().unwrap();
            assert_eq!(restored.content, original.content);
            assert_eq!(restored.id, original.id);
            assert_eq!(restored.created_at, original.created_at);
        }
        std::fs::remove_file(path).unwrap();
    }
}
