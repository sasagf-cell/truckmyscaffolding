#!/bin/sh
set -e

# Mark the failing multi-match migration as already applied so PocketBase
# skips it on startup. The migration references a column ("schema") that does
# not exist in databases created before that schema change was introduced,
# causing a "SQL logic error: no such column: schema" crash.
sqlite3 /pb/pb_data/data.db "
  CREATE TABLE IF NOT EXISTS _migrations (file TEXT PRIMARY KEY, applied_at DATETIME NOT NULL);
  INSERT OR IGNORE INTO _migrations (file, applied_at) VALUES ('1673167670_multi_match_migrate.go', datetime('now'));
" || true

exec /usr/local/bin/pocketbase serve --http=0.0.0.0:$PORT --dir=/pb/pb_data
