#!/bin/sh
set -e

# Mark the failing multi-match migration as already applied so PocketBase
# skips it on startup. The migration references a column ("schema") that does
# not exist in databases created before that schema change was introduced,
# causing a "SQL logic error: no such column: schema" crash.
# Skip only the two broken built-in migrations that reference columns renamed in this DB.
# All other migrations are safe and must run normally so PocketBase schema stays intact.
sqlite3 /pb/pb_data/data.db "
  INSERT OR IGNORE INTO _migrations (file, applied) VALUES ('1673167670_multi_match_migrate.go',      strftime('%s','now') * 1000000);
  INSERT OR IGNORE INTO _migrations (file, applied) VALUES ('1677152688_rename_authentik_to_oidc.go', strftime('%s','now') * 1000000);
" || true

echo "=== _admins table ==="
sqlite3 /pb/pb_data/data.db "SELECT id, email FROM _admins;" || echo "No _admins table"

# Reset admin password to match env vars using PocketBase CLI
/usr/local/bin/pocketbase admin update "${POCKETBASE_SUPERUSER_EMAIL}" "${POCKETBASE_SUPERUSER_PASSWORD}" --dir=/pb/pb_data 2>&1 || \
/usr/local/bin/pocketbase admin create "${POCKETBASE_SUPERUSER_EMAIL}" "${POCKETBASE_SUPERUSER_PASSWORD}" --dir=/pb/pb_data 2>&1 || true
echo "=== Admin reset done ==="

exec /usr/local/bin/pocketbase serve --http=0.0.0.0:$PORT --dir=/pb/pb_data
