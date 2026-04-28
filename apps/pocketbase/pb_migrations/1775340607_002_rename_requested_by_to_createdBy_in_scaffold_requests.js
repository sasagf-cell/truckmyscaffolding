/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");
  const field = collection.fields.getByName("requested_by");
  field.name = "createdBy";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");
  const field = collection.fields.getByName("createdBy");
  field.name = "requested_by";
  return app.save(collection);
})
