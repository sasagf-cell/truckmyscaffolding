/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("email_logs");
  collection.indexes.push("CREATE INDEX idx_email_logs_recipientId ON email_logs (recipientId)");
  collection.indexes.push("CREATE INDEX idx_email_logs_sentAt ON email_logs (sentAt)");
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("email_logs");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_email_logs_recipientId"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_email_logs_sentAt"));
  return app.save(collection);
})
