/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");

  const existing = collection.fields.getByName("estimatedDuration");
  if (existing) {
    if (existing.type === "number") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("estimatedDuration"); // exists with wrong type, remove first
  }

  collection.fields.add(new NumberField({
    name: "estimatedDuration",
    required: true
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");
  collection.fields.removeByName("estimatedDuration");
  return app.save(collection);
})
