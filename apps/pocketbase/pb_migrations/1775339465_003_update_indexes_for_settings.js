/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("settings");
  collection.indexes.push("CREATE UNIQUE INDEX idx_settings_user_id ON settings (user_id)");
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("settings");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_settings_user_id"));
  return app.save(collection);
})
