/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("material_deliveries");
  const field = collection.fields.getByName("delivery_number");
  field.name = "driver_name";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("material_deliveries");
  const field = collection.fields.getByName("driver_name");
  field.name = "delivery_number";
  return app.save(collection);
})
