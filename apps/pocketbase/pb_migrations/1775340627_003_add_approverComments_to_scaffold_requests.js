/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");

  const existing = collection.fields.getByName("approverComments");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("approverComments"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "approverComments",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");
  collection.fields.removeByName("approverComments");
  return app.save(collection);
})
