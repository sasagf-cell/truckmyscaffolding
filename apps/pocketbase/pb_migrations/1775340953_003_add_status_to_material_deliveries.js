/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("material_deliveries");

  const existing = collection.fields.getByName("status");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("status"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "status",
    required: true,
    values: ["Pending", "In Transit", "Delivered", "Cancelled"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("material_deliveries");
  collection.fields.removeByName("status");
  return app.save(collection);
})
