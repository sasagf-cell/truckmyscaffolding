/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");

  const existing = collection.fields.getByName("type");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("type"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "type",
    required: true,
    values: ["Standard", "Heavy Load", "Temporary"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");
  collection.fields.removeByName("type");
  return app.save(collection);
})
