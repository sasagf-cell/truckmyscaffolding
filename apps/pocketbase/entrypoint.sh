#!/bin/sh
set -e

# Upsert superuser so API can always authenticate (PocketBase v0.23+ command)
/usr/local/bin/pocketbase superuser upsert "${POCKETBASE_SUPERUSER_EMAIL}" "${POCKETBASE_SUPERUSER_PASSWORD}" --dir=/pb/pb_data 2>&1 || true

exec /usr/local/bin/pocketbase serve --http=0.0.0.0:$PORT --dir=/pb/pb_data
