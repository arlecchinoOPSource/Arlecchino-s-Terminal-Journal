use rusqlite::{Connection, OptionalExtension};
use serde::{Deserialize, Serialize};

// Allowed values must match src/domain/preferences.ts.
const FONTS: [&str; 4] = ["plex-sans", "plex-serif", "literata", "plex-mono"];
const SIZES: std::ops::RangeInclusive<u16> = 14..=22;
const WIDTHS: [u16; 4] = [560, 640, 720, 840];
const LINE_SPACINGS: [u16; 4] = [140, 165, 180, 200];

/// Editor preferences. Line spacing is stored in hundredths (165 = 1.65) to avoid floats.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Preferences {
    pub font: String,
    pub font_size: u16,
    pub writing_width: u16,
    pub line_spacing: u16,
}
impl Default for Preferences {
    fn default() -> Self {
        Self {
            font: "plex-sans".into(),
            font_size: 17,
            writing_width: 720,
            line_spacing: 165,
        }
    }
}
impl Preferences {
    fn valid(&self) -> bool {
        FONTS.contains(&self.font.as_str())
            && SIZES.contains(&self.font_size)
            && WIDTHS.contains(&self.writing_width)
            && LINE_SPACINGS.contains(&self.line_spacing)
    }
}

const FAILURE: &str = "Settings could not be saved. They apply until Terminal closes.";

/// Stored preferences, or defaults when none are stored or the stored record is unreadable.
/// An unreadable record is left untouched rather than overwritten.
pub fn get(db: &Connection) -> Result<Preferences, String> {
    let stored: Option<String> = db
        .query_row(
            "SELECT value FROM settings WHERE key='preferences'",
            [],
            |r| r.get(0),
        )
        .optional()
        .map_err(|_| "Settings could not be read. Defaults are in use.".to_string())?;
    Ok(stored
        .and_then(|json| serde_json::from_str::<Preferences>(&json).ok())
        .filter(Preferences::valid)
        .unwrap_or_default())
}

pub fn set(db: &Connection, preferences: &Preferences) -> Result<(), String> {
    if !preferences.valid() {
        return Err("Unsupported setting. Nothing was changed.".into());
    }
    let json = serde_json::to_string(preferences).map_err(|_| FAILURE.to_string())?;
    db.execute(
        "INSERT INTO settings(key,value) VALUES ('preferences',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        [json],
    )
    .map_err(|_| FAILURE.to_string())?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    fn db() -> Connection {
        let mut db = Connection::open_in_memory().unwrap();
        crate::storage::migrate(&mut db).unwrap();
        db
    }
    #[test]
    fn defaults_are_used_until_preferences_are_saved() {
        let db = db();
        assert_eq!(get(&db).unwrap(), Preferences::default());
    }
    #[test]
    fn saved_preferences_survive_reopening() {
        let path = std::env::temp_dir().join(format!(
            "terminal-preferences-synthetic-{}.sqlite3",
            std::process::id()
        ));
        let _ = std::fs::remove_file(&path);
        let chosen = Preferences {
            font: "literata".into(),
            font_size: 20,
            writing_width: 840,
            line_spacing: 200,
        };
        set(&crate::storage::open(&path).unwrap(), &chosen).unwrap();
        assert_eq!(get(&crate::storage::open(&path).unwrap()).unwrap(), chosen);
        for suffix in ["", "-wal", "-shm"] {
            let _ = std::fs::remove_file(format!("{}{suffix}", path.display()));
        }
    }
    #[test]
    fn invalid_preferences_are_refused_without_writing() {
        let db = db();
        for bad in [
            Preferences {
                font: "comic-sans".into(),
                ..Preferences::default()
            },
            Preferences {
                font_size: 40,
                ..Preferences::default()
            },
            Preferences {
                writing_width: 2000,
                ..Preferences::default()
            },
            Preferences {
                line_spacing: 99,
                ..Preferences::default()
            },
        ] {
            assert!(set(&db, &bad).is_err());
        }
        let stored: i64 = db
            .query_row(
                "SELECT count(*) FROM settings WHERE key='preferences'",
                [],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(stored, 0);
    }
    #[test]
    fn unreadable_stored_preferences_fall_back_to_defaults_untouched() {
        let db = db();
        db.execute(
            "INSERT INTO settings VALUES ('preferences', '{\"font\":\"x\",\"font_size\":3}')",
            [],
        )
        .unwrap();
        assert_eq!(get(&db).unwrap(), Preferences::default());
        let stored: String = db
            .query_row(
                "SELECT value FROM settings WHERE key='preferences'",
                [],
                |r| r.get(0),
            )
            .unwrap();
        assert!(stored.contains("\"x\""));
    }
}
