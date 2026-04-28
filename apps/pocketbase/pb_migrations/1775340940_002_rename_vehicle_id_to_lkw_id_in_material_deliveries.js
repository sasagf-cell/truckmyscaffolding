/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("material_deliveries");
  const field = collection.fields.getByName("vehicle_id");
  field.name = "lkw_id";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("material_deliveries");
  const field = collection.fields.getByName("lkw_id");
  field.name = "vehicle_id";
  return app.save(collection);
})
