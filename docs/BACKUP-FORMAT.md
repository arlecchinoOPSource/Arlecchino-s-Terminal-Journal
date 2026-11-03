# Journal backup format — version 1

A Terminal backup is one UTF-8 JSON file (`.json`) containing the whole journal. It is produced and read only by the native layer (`src-tauri/src/backup.rs`).

```json
{
  "format": "terminal-journal-backup",
  "version": 1,
  "exported_at": 1793700000000,
  "next_entry_number": 4,
  "entries": [
    {
      "id": "00000000-0000-4000-8000-000000000001",
      "entry_number": 1,
      "title": "Synthetic title",
      "content": { "type": "doc", "content": [] },
      "schema_version": 1,
      "created_at": 1793600000000,
      "updated_at": 1793650000000,
      "revision": 3
    }
  ],
  "preferences": { "font": "plex-sans", "font_size": 17, "writing_width": 720, "line_spacing": 165 }
}
```

- Timestamps are Unix milliseconds. `content` is the stored Tiptap JSON document (`schema_version` 1), so formatting and tables are preserved exactly.
- `next_entry_number` keeps numbering monotonic: numbers of entries deleted before the backup are never reused after a restore.
- `preferences` may be `null`. The last-opened entry is not included.

## Validation (before anything is changed)

A file is refused, with the journal untouched, if any of these fail:

- It is larger than 256 MB, is not JSON, or has unknown top-level fields.
- `format` is not `terminal-journal-backup`, or `version` is not 1. A higher version is reported as "made by a newer version of Terminal".
- Any entry fails the same checks used when saving (ID shape, title length, supported nodes/marks/attributes only, `schema_version` 1), or has `entry_number < 1`, `updated_at < created_at`, a negative timestamp, or `revision < 1`.
- Two entries share an ID or an entry number, or there are more than 200,000 entries.
- `preferences` contains values outside the allowed settings.

## Restore procedure

1. The person picks a file in a native dialog; it is read and fully validated. The validated backup is held in memory only.
2. Terminal shows how many entries the backup has, its date, and how many entries will be replaced. Cancel is the default.
3. On confirmation, pending edits are saved, then the current journal is written to `backups/before-restore-<time>.json` in the app-data folder. If that copy cannot be written, the restore stops.
4. All entries, the entry counter and preferences are replaced in a single SQLite `IMMEDIATE` transaction. Any failure rolls back completely; there is no partial replacement.

## Compatibility rules

- Version 1 readers accept exactly version 1. A future format change that older Terminal versions cannot read must increase `version`.
- Adding optional fields requires a version increase, because version 1 refuses unknown fields.
- Entry `content` follows the editor schema; new node types require the native validator and this document to be updated together.
