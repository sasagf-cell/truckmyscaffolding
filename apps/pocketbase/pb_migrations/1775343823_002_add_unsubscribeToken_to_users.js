/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");

  const existing = collection.fields.getByName("unsubscribeToken");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("unsubscribeToken"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "unsubscribeToken",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.fields.removeByName("unsubscribeToken");
  return app.save(collection);
})
