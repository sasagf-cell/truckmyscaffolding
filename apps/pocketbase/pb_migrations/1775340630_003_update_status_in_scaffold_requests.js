/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");
  const field = collection.fields.getByName("status");
  field.values = ["pending", "approved", "on_hold", "rejected", "completed"];
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");
  const field = collection.fields.getByName("status");
  field.values = ["active", "pending", "on_hold", "completed", "rejected"];
  return app.save(collection);
})
