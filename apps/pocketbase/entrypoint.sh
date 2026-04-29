#!/bin/sh
set -e

# Mark the failing multi-match migration as already applied so PocketBase
# skips it on startup. The migration references a column ("schema") that does
# not exist in databases created before that schema change was introduced,
# causing a "SQL logic error: no such column: schema" crash.
echo "=== _migrations full schema ==="
sqlite3 /pb/pb_data/data.db "PRAGMA table_info(_migrations);"

echo "=== Inserting skip record ==="
sqlite3 /pb/pb_data/data.db \
  "INSERT OR IGNORE INTO _migrations (file, applied) VALUES ('1673167670_multi_match_migrate.go', strftime('%s','now') * 1000000);" \
  && echo "INSERT OK" || echo "INSERT failed - trying file-only"

echo "=== Verify ==="
sqlite3 /pb/pb_data/data.db "SELECT file FROM _migrations WHERE file LIKE '%multi_match%';"

exec /usr/local/bin/pocketbase serve --http=0.0.0.0:$PORT --dir=/pb/pb_data
