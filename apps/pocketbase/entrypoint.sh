#!/bin/sh
set -e

# Mark the failing multi-match migration as already applied so PocketBase
# skips it on startup. The migration references a column ("schema") that does
# not exist in databases created before that schema change was introduced,
# causing a "SQL logic error: no such column: schema" crash.
# Mark all PocketBase v0.22.20 built-in Go migrations as applied so PocketBase
# does not attempt to run them on a database that was set up without migration tracking.
sqlite3 /pb/pb_data/data.db "
  INSERT OR IGNORE INTO _migrations (file, applied) VALUES ('1640988000_init.go',                                                        strftime('%s','now') * 1000000);
  INSERT OR IGNORE INTO _migrations (file, applied) VALUES ('1673167670_multi_match_migrate.go',                                          strftime('%s','now') * 1000000);
  INSERT OR IGNORE INTO _migrations (file, applied) VALUES ('1677152688_rename_authentik_to_oidc.go',                                     strftime('%s','now') * 1000000);
  INSERT OR IGNORE INTO _migrations (file, applied) VALUES ('1679943780_normalize_single_multiple_values.go',                             strftime('%s','now') * 1000000);
  INSERT OR IGNORE INTO _migrations (file, applied) VALUES ('1679943781_add_indexes_column.go',                                           strftime('%s','now') * 1000000);
  INSERT OR IGNORE INTO _migrations (file, applied) VALUES ('1685164450_check_fk.go',                                                     strftime('%s','now') * 1000000);
  INSERT OR IGNORE INTO _migrations (file, applied) VALUES ('1689579878_renormalize_single_multiple_values.go',                           strftime('%s','now') * 1000000);
  INSERT OR IGNORE INTO _migrations (file, applied) VALUES ('1690319366_reset_null_values.go',                                            strftime('%s','now') * 1000000);
  INSERT OR IGNORE INTO _migrations (file, applied) VALUES ('1690454337_transform_relations_to_views.go',                                 strftime('%s','now') * 1000000);
  INSERT OR IGNORE INTO _migrations (file, applied) VALUES ('1691747913_resave_views.go',                                                 strftime('%s','now') * 1000000);
  INSERT OR IGNORE INTO _migrations (file, applied) VALUES ('1692609521_copy_display_fields.go',                                          strftime('%s','now') * 1000000);
  INSERT OR IGNORE INTO _migrations (file, applied) VALUES ('1701496825_allow_single_oauth2_provider_in_multiple_auth_collections.go',    strftime('%s','now') * 1000000);
  INSERT OR IGNORE INTO _migrations (file, applied) VALUES ('1702134272_set_default_json_max_size.go',                                    strftime('%s','now') * 1000000);
  INSERT OR IGNORE INTO _migrations (file, applied) VALUES ('1718706525_add_login_alert_column.go',                                       strftime('%s','now') * 1000000);
" || true

exec /usr/local/bin/pocketbase serve --http=0.0.0.0:$PORT --dir=/pb/pb_data
