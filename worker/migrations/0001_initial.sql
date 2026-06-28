PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS relationship_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  overall_summary TEXT NOT NULL DEFAULT '',
  recent_summary TEXT NOT NULL DEFAULT '',
  current_status TEXT NOT NULL DEFAULT '',
  mood_score INTEGER NOT NULL DEFAULT 0 CHECK (mood_score BETWEEN -100 AND 100),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS key_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_date TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  importance INTEGER NOT NULL DEFAULT 3 CHECK (importance BETWEEN 1 AND 5),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_key_events_event_date ON key_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_key_events_importance ON key_events(importance DESC);

CREATE TABLE IF NOT EXISTS consultations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at DESC);

CREATE TABLE IF NOT EXISTS raw_imports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_type TEXT NOT NULL,
  file_name TEXT,
  r2_key TEXT,
  content_preview TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_raw_imports_created_at ON raw_imports(created_at DESC);

INSERT OR IGNORE INTO relationship_state (id) VALUES (1);
