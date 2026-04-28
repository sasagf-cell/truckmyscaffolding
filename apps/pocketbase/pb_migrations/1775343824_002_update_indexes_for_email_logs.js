/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("email_logs");
  collection.indexes.push("CREATE UNIQUE INDEX idx_email_logs_trackingId ON email_logs (trackingId)");
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("email_logs");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_email_logs_trackingId"));
  return app.save(collection);
})
