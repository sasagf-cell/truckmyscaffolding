#!/bin/sh
set -e

# Mark the failing multi-match migration as already applied so PocketBase
# skips it on startup. The migration references a column ("schema") that does
# not exist in databases created before that schema change was introduced,
# causing a "SQL logic error: no such column: schema" crash.
echo "=== DB path check ==="
ls -la /pb/pb_data/ || echo "Directory /pb/pb_data does not exist"

echo "=== _migrations schema ==="
sqlite3 /pb/pb_data/data.db "PRAGMA table_info(_migrations);" || echo "PRAGMA failed"

echo "=== _migrations last 5 rows ==="
sqlite3 /pb/pb_data/data.db "SELECT * FROM _migrations ORDER BY rowid DESC LIMIT 5;" || echo "SELECT failed"

echo "=== Inserting skip record ==="
sqlite3 /pb/pb_data/data.db \
  "INSERT OR IGNORE INTO _migrations (file) VALUES ('1673167670_multi_match_migrate.go');" || echo "INSERT failed"

echo "=== Verify insert ==="
sqlite3 /pb/pb_data/data.db "SELECT * FROM _migrations WHERE file LIKE '%multi_match%';" || echo "Verify failed"

exec /usr/local/bin/pocketbase serve --http=0.0.0.0:$PORT --dir=/pb/pb_data
