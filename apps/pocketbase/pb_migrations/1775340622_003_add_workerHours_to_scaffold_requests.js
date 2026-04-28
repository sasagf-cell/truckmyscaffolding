/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");

  const existing = collection.fields.getByName("workerHours");
  if (existing) {
    if (existing.type === "json") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("workerHours"); // exists with wrong type, remove first
  }

  collection.fields.add(new JSONField({
    name: "workerHours",
    required: true
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");
  collection.fields.removeByName("workerHours");
  return app.save(collection);
})
