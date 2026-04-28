/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("projects");

  const existing = collection.fields.getByName("type");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("type"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "type",
    values: ["Residential", "Commercial", "Industrial", "Other"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("projects");
  collection.fields.removeByName("type");
  return app.save(collection);
})
