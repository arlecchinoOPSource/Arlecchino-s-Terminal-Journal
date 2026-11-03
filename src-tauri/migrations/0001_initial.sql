CREATE TABLE entries (
  id TEXT PRIMARY KEY NOT NULL,
  entry_number INTEGER NOT NULL UNIQUE CHECK (entry_number > 0),
  title TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision > 0),
  content TEXT NOT NULL CHECK (json_valid(content)),
  schema_version INTEGER NOT NULL CHECK (schema_version = 1),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL CHECK (updated_at >= created_at)
);
CREATE TABLE entry_sequence (
  singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
  next_number INTEGER NOT NULL CHECK (next_number > 0)
);
INSERT INTO entry_sequence VALUES (1, 1);
CREATE TABLE settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL CHECK (json_valid(value))
);
CREATE INDEX entries_modified ON entries(updated_at DESC, entry_number DESC);
