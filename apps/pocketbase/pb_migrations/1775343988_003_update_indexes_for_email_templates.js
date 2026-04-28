/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("email_templates");
  collection.indexes.push("CREATE INDEX idx_email_templates_emailType ON email_templates (emailType)");
  collection.indexes.push("CREATE INDEX idx_email_templates_language ON email_templates (language)");
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("email_templates");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_email_templates_emailType"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_email_templates_language"));
  return app.save(collection);
})
