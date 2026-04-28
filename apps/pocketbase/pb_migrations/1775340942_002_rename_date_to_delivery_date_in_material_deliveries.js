/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("material_deliveries");
  const field = collection.fields.getByName("date");
  field.name = "delivery_date";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("material_deliveries");
  const field = collection.fields.getByName("delivery_date");
  field.name = "date";
  return app.save(collection);
})
