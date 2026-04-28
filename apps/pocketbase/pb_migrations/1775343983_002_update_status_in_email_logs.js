/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("email_logs");
  const field = collection.fields.getByName("status");
  field.values = ["sent", "bounced", "failed", "test"];
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("email_logs");
  const field = collection.fields.getByName("status");
  field.values = ["sent", "bounced", "failed"];
  return app.save(collection);
})
