/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("notificationPreferences");
  collection.indexes.push("CREATE UNIQUE INDEX idx_notificationPreferences_userId ON notificationPreferences (userId)");
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("notificationPreferences");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_notificationPreferences_userId"));
  return app.save(collection);
})
