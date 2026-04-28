/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("material_items");
  const field = collection.fields.getByName("unit");
  field.required = true;
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("material_items");
  const field = collection.fields.getByName("unit");
  field.required = false;
  return app.save(collection);
})
