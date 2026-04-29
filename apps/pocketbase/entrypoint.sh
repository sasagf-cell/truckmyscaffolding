#!/bin/sh
set -e

# Mark the failing multi-match migration as already applied so PocketBase
# skips it on startup. The migration references a column ("schema") that does
# not exist in databases created before that schema change was introduced,
# causing a "SQL logic error: no such column: schema" crash.
sqlite3 /pb/pb_data/data.db \
  "INSERT OR IGNORE INTO _migrations (name) VALUES ('1673167670_multi_match_migrate.go');" || true

exec /usr/local/bin/pocketbase serve --http=0.0.0.0:$PORT --dir=/pb/pb_data
