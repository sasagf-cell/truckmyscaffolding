/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("diary_entries");
  const field = collection.fields.getByName("temperature");
  field.required = true;
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("diary_entries");
  const field = collection.fields.getByName("temperature");
  field.required = false;
  return app.save(collection);
})
