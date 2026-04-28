/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("material_deliveries");

  const existing = collection.fields.getByName("driver_phone");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("driver_phone"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "driver_phone",
    required: true
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("material_deliveries");
  collection.fields.removeByName("driver_phone");
  return app.save(collection);
})
