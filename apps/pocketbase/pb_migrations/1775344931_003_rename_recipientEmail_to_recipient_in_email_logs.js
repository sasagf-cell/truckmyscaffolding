/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("email_logs");
  const field = collection.fields.getByName("recipientEmail");
  field.name = "recipient";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("email_logs");
  const field = collection.fields.getByName("recipient");
  field.name = "recipientEmail";
  return app.save(collection);
})
