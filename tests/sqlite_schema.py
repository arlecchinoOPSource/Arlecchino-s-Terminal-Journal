"""Native SQLite checks using disposable in-memory databases only."""
import pathlib
import sqlite3
import unittest

MIGRATION = (pathlib.Path(__file__).resolve().parents[1] / 'src-tauri/migrations/0001_initial.sql').read_text()

class SchemaTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(':memory:')
        self.db.executescript(MIGRATION)

    def tearDown(self):
        self.db.close()

    def test_roundtrip(self):
        doc = '{"type":"doc","content":[{"type":"paragraph"}]}'
        self.db.execute('INSERT INTO entries (id,entry_number,title,content,schema_version,created_at,updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)', ('synthetic-id', 1, 'Synthetic title', doc, 1, 100, 100))
        self.assertEqual(self.db.execute('SELECT content FROM entries WHERE id = ?', ('synthetic-id',)).fetchone()[0], doc)

    def test_invalid_json_rejected(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute('INSERT INTO settings VALUES (?, ?)', ('example', 'invalid'))

    def test_sequence_survives_deletion(self):
        self.db.execute('UPDATE entry_sequence SET next_number = 2 WHERE singleton = 1')
        self.db.execute('DELETE FROM entries')
        self.assertEqual(self.db.execute('SELECT next_number FROM entry_sequence').fetchone()[0], 2)

if __name__ == '__main__':
    unittest.main()
