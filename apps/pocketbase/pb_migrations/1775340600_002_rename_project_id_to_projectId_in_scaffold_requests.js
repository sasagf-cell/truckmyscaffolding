/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");
  const field = collection.fields.getByName("project_id");
  field.name = "projectId";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");
  const field = collection.fields.getByName("projectId");
  field.name = "project_id";
  return app.save(collection);
})
