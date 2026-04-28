/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");
  const field = collection.fields.getByName("start_date");
  field.name = "requestedDate";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");
  const field = collection.fields.getByName("requestedDate");
  field.name = "start_date";
  return app.save(collection);
})
