/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");
  const field = collection.fields.getByName("activity_description");
  field.name = "description";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");
  const field = collection.fields.getByName("description");
  field.name = "activity_description";
  return app.save(collection);
})
