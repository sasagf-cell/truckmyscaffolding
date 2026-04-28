/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("email_logs");
  collection.indexes.push("CREATE INDEX idx_email_logs_status ON email_logs (status)");
  collection.indexes.push("CREATE INDEX idx_email_logs_timestamp ON email_logs (timestamp)");
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("email_logs");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_email_logs_status"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_email_logs_timestamp"));
  return app.save(collection);
})
